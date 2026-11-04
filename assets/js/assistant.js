/* =====================================================================================
 * MC.assistant — ИИ-наставник курса: на каждой странице (уроки и главная), на языке страницы (ru, en, uz).
 *
 * Ученик выделяет фрагмент урока (слово, формулу, абзац) → рядом появляется кнопка
 * «Спросить ИИ» → открывается панель чата. Вопрос уходит на локальный claude-server
 * (папка claude-server в корне курса — OpenAI-совместимый API поверх Claude Code CLI)
 * вместе с контекстом: урок и его цели, раздел, текст раздела, выделенный фрагмент.
 * Формулы страницы передаются в TeX. Ответ приходит потоком (SSE) и показывается
 * с формулами KaTeX. У каждой задачи урока есть кнопка «Подсказка» — наставник даёт
 * наводящий шаг, а не готовое решение.
 *
 * Запуск сервера: node claude-server/server.js (или python tools/serve.py — запустит сам).
 * Тот же сервер обслуживает курс «Градиентный бустинг по косточкам».
 * Без сервера курс работает как обычно: панель покажет, как его запустить.
 * Ответ модели — недоверенные данные: он отображается через MC.md (без innerHTML).
 * ===================================================================================== */
(function (root) {
  'use strict';
  const MC = root.MC || (root.MC = {});
  MC.config = MC.config || {};
  MC.config.assistant = Object.assign(
    {
      url: 'http://127.0.0.1:8137', // адрес claude-server
      model: 'sonnet', // opus | sonnet | haiku
      effort: 'low', // low | medium | high — сколько модель «думает» перед ответом
      token: '', // Bearer-токен, если сервер запущен с CLAUDE_SERVER_TOKEN
    },
    MC.config.assistant || {}
  );

  /* =================================================================================
   * Чистая логика (без DOM) — проверяется в tests/js/assistant.test.js
   * ================================================================================= */

  /* claude-server передаёт запрос в командную строку `claude -p …`; в Windows её длина
   * ограничена ~32 тыс. символов. Поэтому контекст дозируется: весь запрос ≤ total. */
  const LIMITS = { selection: 2500, section: 7000, lesson: 2500, history: 6000, question: 4000, total: 22000, storedTurns: 40 };

  /* ---------------------------------------------------------------------------------
   * Языки. Наставник говорит на языке страницы (<html lang>): ru, en или uz (латиница).
   * PROMPT — то, что уходит модели (системное сообщение и подписи контекста);
   * UI — тексты панели. Русские тексты — исходные; переводы — по образцу ассистента блога.
   * --------------------------------------------------------------------------------- */
  const PROMPT = {
    ru: {
      system: [
        'Ты — ИИ-наставник интерактивного курса «Математика по косточкам» (математика для машинного обучения). Ученик читает урок (или главную страницу курса), выделил фрагмент и задаёт по нему вопрос.',
        '',
        'Правила ответа:',
        '1. Отвечай на языке вопроса (страница — на русском), на «вы», дружелюбно и по существу. Сначала прямой ответ на вопрос, потом пояснение.',
        '2. Объясняй «по косточкам»: от интуиции к строгой формулировке, каждое новое понятие — простыми словами. Английский термин давай в скобках при первом упоминании.',
        '3. Математика должна быть точной: не подменяй определения, различай «необходимо» и «достаточно», называй условия теорем. Если упрощаешь — так и скажи.',
        '4. Опирайся на текст урока и его обозначения. Не выдумывай числа, которых нет в уроке; свой пример помечай как свой. Вычисления показывай по шагам и проверяй.',
        '5. Будь краток: обычно 80–250 слов. Развёрнуто — только если ученик просит подробнее.',
        '6. Формулы пиши в LaTeX: строчные — $…$, выключные — $$…$$. Разметка — Markdown. Код, если он нужен, — Python в блоках ```python.',
        '7. Если ученик просит помочь с задачей урока — сначала дай подсказку (наводящий вопрос или первый шаг), полное решение — только по прямой просьбе. Если ученик прислал своё решение — проверь его по шагам и укажи первую ошибку.',
        '8. Где уместно, одной фразой свяжи тему с машинным обучением (функции потерь, градиентный спуск, векторы признаков, матрицы весов).',
        '9. Если вопрос не относится к курсу, ответь коротко и предложи вернуться к уроку. Если не уверен — скажи об этом прямо.',
        '10. Отвечай сразу текстом: файлы, команды и другие инструменты не нужны — весь контекст уже в сообщении.',
        '11. Если к вопросу приложен скриншот — это снимок страницы урока (график, рисунок, формула). Сначала коротко скажи, что на нём видно, затем отвечай по нему.',
      ].join('\n'),
      q: ['«', '»'],
      ctxHead: 'Контекст — что читает ученик:',
      lesson: (n, t, part) => 'Урок ' + n + ' «' + t + '»' + (part ? ' (часть курса: ' + part + ')' : ''),
      home: (t) => 'Главная страница курса «' + t + '»: ученик выбирает урок или спрашивает о курсе в целом.',
      subtitle: 'Подзаголовок: ', summary: 'Кратко: ', goals: 'Цели урока: ', outline: 'Разделы урока: ', program: 'Программа курса (готовые уроки отмечены *): ',
      exercise: 'Задача из урока', fragment: 'Выделенный фрагмент урока', where: (s) => ' (раздел «' + s + '»)',
      reading: (s) => 'Ученик сейчас читает раздел «' + s + '».', sectionText: 'Текст раздела для контекста:',
      shotNow: 'К вопросу приложен скриншот страницы урока.', shotGone: '(К этому вопросу ученик прикладывал скриншот; сейчас он недоступен.)', question: 'Вопрос ученика: ',
    },
    en: {
      system: [
        'You are the AI tutor of the interactive course “Math, bone by bone” (mathematics for machine learning). The student is reading a lesson (or the home page of the course), has selected a fragment and asks about it.',
        '',
        'Rules:',
        '1. Answer in the language of the question (the page is in English), politely and to the point. Give the direct answer first, then the explanation.',
        '2. Explain “bone by bone”: from intuition to the rigorous statement; explain every new concept in plain words.',
        '3. Mathematics must be precise: do not swap definitions, distinguish “necessary” from “sufficient”, state the conditions of theorems. If you simplify, say so.',
        '4. Rely on the lesson text and its notation. Do not invent numbers that are not in the lesson; mark your own examples as yours. Show calculations step by step and check them.',
        '5. Be brief: usually 80–250 words. Go into detail only if the student asks.',
        '6. Write formulas in LaTeX: inline $…$, display $$…$$. Use Markdown. Code, if needed, is Python in ```python blocks. Use a decimal point in numbers.',
        '7. If the student asks for help with a lesson problem, give a hint first (a guiding question or the first step); give the full solution only when asked directly. If the student sends their own solution, check it step by step and point out the first mistake.',
        '8. Where it fits, link the topic to machine learning in one sentence (loss functions, gradient descent, feature vectors, weight matrices).',
        '9. If the question is not about the course, answer briefly and suggest returning to the lesson. If you are not sure, say so plainly.',
        '10. Answer with text right away: no files, commands or other tools are needed; all context is in the message.',
        '11. If a screenshot is attached, it is a snapshot of a lesson page (a plot, a figure, a formula). First say briefly what it shows, then answer about it.',
      ].join('\n'),
      q: ['“', '”'],
      ctxHead: 'Context, what the student is reading:',
      lesson: (n, t, part) => 'Lesson ' + n + ' “' + t + '”' + (part ? ' (course part: ' + part + ')' : ''),
      home: (t) => 'Home page of the course “' + t + '”: the student is choosing a lesson or asking about the course as a whole.',
      subtitle: 'Subtitle: ', summary: 'Summary: ', goals: 'Lesson objectives: ', outline: 'Lesson sections: ', program: 'Course curriculum (ready lessons are marked *): ',
      exercise: 'Problem from the lesson', fragment: 'Selected fragment of the lesson', where: (s) => ' (section “' + s + '”)',
      reading: (s) => 'The student is now reading the section “' + s + '”.', sectionText: 'Section text for context:',
      shotNow: 'A screenshot of the lesson page is attached to the question.', shotGone: '(The student attached a screenshot to this question; it is no longer available.)', question: 'Student’s question: ',
    },
    uz: {
      system: [
        'Sen «Matematika: mayda detallarigacha» interaktiv kursining (mashinaviy o‘qitish uchun matematika) AI-ustozisan. O‘quvchi darsni (yoki kursning bosh sahifasini) o‘qiyapti, parchani belgilab, u bo‘yicha savol beryapti.',
        '',
        'Javob qoidalari:',
        '1. Savol qaysi tilda bo‘lsa, shu tilda javob ber (sahifa — o‘zbek tilida, lotin yozuvida), «siz» deb, samimiy va mazmunli. Avval savolga to‘g‘ridan-to‘g‘ri javob, keyin izoh.',
        '2. «Mayda detallarigacha» tushuntir: intuitsiyadan qat’iy ta’rifga; har bir yangi tushunchani oddiy so‘zlar bilan. Ingliz atamasini birinchi eslatishda qavs ichida ber.',
        '3. Matematika aniq bo‘lishi kerak: ta’riflarni almashtirma, «zarur» va «yetarli»ni farqla, teorema shartlarini ayt. Soddalashtirsang — buni ochiq ayt.',
        '4. Dars matni va undagi belgilashlarga tayan. Darsda yo‘q sonlarni o‘ylab topma; o‘z misolingni o‘zingniki deb belgila. Hisob-kitoblarni qadamma-qadam ko‘rsat va tekshir.',
        '5. Qisqa bo‘l: odatda 80–250 so‘z. Batafsil — faqat o‘quvchi so‘rasa.',
        '6. Formulalarni LaTeX da yoz: satr ichida $…$, alohida $$…$$. Belgilash — Markdown. Kod kerak bo‘lsa — Python, ```python bloklarida. O‘nli kasrlarda vergul ishlat.',
        '7. O‘quvchi dars masalasida yordam so‘rasa — avval maslahat ber (yo‘naltiruvchi savol yoki birinchi qadam), to‘liq yechimni faqat to‘g‘ridan-to‘g‘ri so‘ralganda ber. O‘quvchi o‘z yechimini yuborsa — uni qadamma-qadam tekshir va birinchi xatoni ko‘rsat.',
        '8. O‘rinli bo‘lsa, mavzuni bir jumla bilan mashinaviy o‘qitishga bog‘la (yo‘qotish funksiyalari, gradiyent tushish, belgilar vektorlari, vaznlar matritsalari).',
        '9. Savol kursga oid bo‘lmasa, qisqa javob ber va darsga qaytishni taklif qil. Ishonching komil bo‘lmasa — buni to‘g‘ridan-to‘g‘ri ayt.',
        '10. Darhol matn bilan javob ber: fayllar, buyruqlar va boshqa vositalar kerak emas — butun kontekst xabarda.',
        '11. Skrinshot biriktirilgan bo‘lsa — bu dars sahifasining surati (grafik, rasm, formula). Avval unda nima ko‘rinayotganini qisqa ayt, keyin u bo‘yicha javob ber.',
      ].join('\n'),
      q: ['«', '»'],
      ctxHead: 'Kontekst — o‘quvchi nimani o‘qiyapti:',
      lesson: (n, t, part) => n + '-dars «' + t + '»' + (part ? ' (kurs qismi: ' + part + ')' : ''),
      home: (t) => '«' + t + '» kursining bosh sahifasi: o‘quvchi dars tanlayapti yoki kurs haqida umuman so‘rayapti.',
      subtitle: 'Kichik sarlavha: ', summary: 'Qisqacha: ', goals: 'Dars maqsadlari: ', outline: 'Dars bo‘limlari: ', program: 'Kurs dasturi (tayyor darslar * bilan belgilangan): ',
      exercise: 'Darsdagi masala', fragment: 'Darsdan belgilangan parcha', where: (s) => ' («' + s + '» bo‘limi)',
      reading: (s) => 'O‘quvchi hozir «' + s + '» bo‘limini o‘qiyapti.', sectionText: 'Kontekst uchun bo‘lim matni:',
      shotNow: 'Savolga dars sahifasining skrinshoti biriktirilgan.', shotGone: '(O‘quvchi bu savolga skrinshot biriktirgan edi; hozir u mavjud emas.)', question: 'O‘quvchining savoli: ',
    },
  };
  const langOf = (lang) => (PROMPT[lang] ? lang : PROMPT[MC.lang] ? MC.lang : 'ru');
  const SYSTEM_PROMPT = PROMPT.ru.system;

  /** Обрезать текст до max символов; around — подстрока, вокруг которой оставить окно. */
  function clip(text, max, around) {
    text = String(text || '');
    if (text.length <= max) return text;
    if (around) {
      const key = around.trim().slice(0, 80);
      const at = key ? text.indexOf(key) : -1;
      if (at >= 0) {
        const start = Math.max(0, Math.min(at - Math.floor(max * 0.4), text.length - max));
        return (start > 0 ? '…' : '') + text.slice(start, start + max).trim() + (start + max < text.length ? '…' : '');
      }
    }
    return text.slice(0, max).trim() + '…';
  }

  /** Привести текст, извлечённый из страницы, в порядок: пробелы, пустые строки. */
  function tidy(text) {
    return String(text || '')
      .replace(/ /g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /** Что читает ученик: урок (номер, часть, цели, разделы) или главная страница (программа курса). */
  function lessonBlock(lesson, lang) {
    if (!lesson) return '';
    const P = PROMPT[langOf(lang)];
    const lines = [];
    if (lesson.home) {
      lines.push(P.home(lesson.title || ''));
      if (lesson.summary) lines.push(P.summary + lesson.summary);
      if ((lesson.program || []).length) lines.push(P.program + lesson.program.join('; '));
      return clip(lines.join('\n'), LIMITS.lesson);
    }
    lines.push(P.lesson(lesson.number || '', lesson.title || '', lesson.part));
    if (lesson.subtitle) lines.push(P.subtitle + lesson.subtitle);
    if (lesson.summary) lines.push(P.summary + lesson.summary);
    if ((lesson.objectives || []).length) lines.push(P.goals + lesson.objectives.join('; '));
    if ((lesson.outline || []).length) lines.push(P.outline + lesson.outline.join(' → '));
    return clip(lines.join('\n'), LIMITS.lesson);
  }

  /** Текст одного хода ученика для модели. full — добавлять ли текст раздела. */
  function userContent(turn, full, lang) {
    const P = PROMPT[langOf(lang)];
    const parts = [];
    const where = turn.section ? P.where(turn.section) : '';
    if (turn.quote) parts.push((turn.kind === 'exercise' ? P.exercise : P.fragment) + where + ':\n' + P.q[0] + clip(turn.quote, LIMITS.selection) + P.q[1]);
    else if (turn.section && full) parts.push(P.reading(turn.section));
    if (full && turn.context) parts.push(P.sectionText + '\n"""\n' + clip(turn.context, LIMITS.section, turn.quote) + '\n"""');
    if (turn.image && full) parts.push(P.shotNow);
    else if (turn.image || turn.hadImage) parts.push(P.shotGone);
    parts.push(P.question + clip(turn.text, LIMITS.question));
    return parts.join('\n\n');
  }

  /**
   * Сообщения для /v1/chat/completions. turns — весь диалог (последний ход — вопрос ученика).
   * История обрезается с начала, пока запрос не уложится в лимит.
   */
  function buildMessages(lesson, turns, lang) {
    const P = PROMPT[langOf(lang)];
    const system = P.system + '\n\n' + P.ctxHead + '\n' + lessonBlock(lesson, lang);
    const last = turns[turns.length - 1];
    const sizeOf = (list) => list.reduce((s, m) => s + m.content.length + 12, 0);
    let latest = userContent(last, true, lang);
    const history = [];
    let used = 0;
    for (let i = turns.length - 2; i >= 0; i--) {
      const t = turns[i];
      if (t.role === 'assistant' && (t.error || !t.text)) continue;
      const content = t.role === 'user' ? userContent(t, false, lang) : clip(t.text, 2500);
      if (used + content.length > LIMITS.history) break;
      used += content.length;
      history.unshift({ role: t.role, content });
    }
    // история должна начинаться с хода ученика
    while (history.length && history[0].role !== 'user') history.shift();
    let messages = [{ role: 'system', content: system }, ...history, { role: 'user', content: latest }];
    while (sizeOf(messages) > LIMITS.total && history.length) {
      history.splice(0, 2);
      messages = [{ role: 'system', content: system }, ...history, { role: 'user', content: latest }];
    }
    if (sizeOf(messages) > LIMITS.total) {
      const over = sizeOf(messages) - LIMITS.total;
      const ctx = clip(last.context || '', Math.max(500, Math.min(LIMITS.section, (last.context || '').length) - over - 50), last.quote);
      latest = userContent(Object.assign({}, last, { context: ctx }), true, lang);
      messages = [{ role: 'system', content: system }, ...history, { role: 'user', content: latest }];
    }
    // Скриншот — в формате OpenAI (image_url с data-URL); claude-server передаёт его модели как изображение
    if (last.image) messages[messages.length - 1].content = [{ type: 'text', text: latest }, { type: 'image_url', image_url: { url: last.image } }];
    return messages;
  }

  /** Разбор потока Server-Sent Events: feed(кусок текста) → onEvent(объект | '[DONE]'). */
  function sseParser(onEvent) {
    let buf = '';
    const emit = (block) => {
      const data = block
        .split(/\r?\n/)
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).replace(/^ /, ''))
        .join('\n');
      if (!data) return;
      if (data.trim() === '[DONE]') return onEvent('[DONE]');
      try {
        onEvent(JSON.parse(data));
      } catch (e) {
        /* неполная или посторонняя строка — пропускаем */
      }
    };
    return {
      feed(chunk) {
        buf += chunk;
        let m;
        while ((m = /\r?\n\r?\n/.exec(buf))) {
          emit(buf.slice(0, m.index));
          buf = buf.slice(m.index + m[0].length);
        }
      },
      end() {
        if (buf.trim()) emit(buf);
        buf = '';
      },
    };
  }

  /** Привести адрес сервера к виду http(s)://host[:port] или вернуть null. */
  function normalizeUrl(url) {
    const s = String(url || '').trim().replace(/\/+$/, '');
    return /^https?:\/\/[^\s/]+(\/[^\s]*)?$/i.test(s) ? s.replace(/\/v1$/i, '') : null;
  }

  /** Размер картинки после вписывания в квадрат max×max (без увеличения). */
  function fitSize(w, h, max) {
    const k = Math.min(1, max / Math.max(w, h));
    return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
  }

  /**
   * Область кадра для вырезания: rect — прямоугольник в координатах окна (CSS-пиксели),
   * view — размер окна, frame — размер кадра захвата (он крупнее при масштабе экрана > 100%).
   */
  function cropRect(rect, view, frame) {
    const sx = frame.w / view.w;
    const sy = frame.h / view.h;
    const x = Math.max(0, Math.min(frame.w - 1, Math.round(rect.x * sx)));
    const y = Math.max(0, Math.min(frame.h - 1, Math.round(rect.y * sy)));
    return { x, y, w: Math.max(1, Math.min(frame.w - x, Math.round(rect.w * sx))), h: Math.max(1, Math.min(frame.h - y, Math.round(rect.h * sy))) };
  }

  const pure = { LIMITS, SYSTEM_PROMPT, PROMPT, clip, tidy, lessonBlock, userContent, buildMessages, sseParser, normalizeUrl, fitSize, cropRect };
  MC.assistant = { _pure: pure };
  if (!root.document) return; // Node.js (тесты): только чистая логика

  /* =================================================================================
   * Браузер
   * ================================================================================= */
  const doc = root.document;
  const H = MC.h;
  const icon = (n) => MC.ui.icon(n);
  const SERVER_CMD = 'node claude-server/server.js';

  /* Тексты панели наставника на языке страницы. */
  const UI_TEXT = {
    ru: {
      widget: 'интерактивный рисунок', caption: 'Подпись: ', quiz: 'тест «Проверь себя»', lessonStart: 'Начало урока', pageStart: 'Начало страницы',
      checking: 'проверяю сервер…', online: (m) => 'Claude · ' + m + ' · локально', offlineSt: 'сервер не запущен',
      badUrl: 'В настройках указан неверный адрес сервера.', noServer: 'Не удалось связаться с claude-server.', srvErr: (c) => 'Сервер ответил ошибкой ' + c + '.',
      needToken: 'Сервер требует токен: укажите его в настройках ассистента.', genErr: 'Ошибка генерации.', empty: 'Модель вернула пустой ответ. Попробуйте ещё раз.',
      fromLesson: 'Из урока', fromPage: 'Со страницы', exerciseSrc: 'Задача',
      shotAlt: 'Скриншот, приложенный к вопросу', shotGoneUi: 'скриншот (не сохраняется после перезагрузки)', shotOld: 'Запущенный claude-server не принимает картинки — перезапустите его',
      shotType: 'Подойдёт картинка PNG, JPEG, WebP или GIF', shotRead: 'Не удалось прочитать картинку', shotHint: 'Выделите мышью область для снимка · Enter — всё окно · Esc — отмена',
      shotArea: 'Выбор области снимка', shotFail: 'Не удалось сделать снимок: ', shotRemove: 'Убрать скриншот', shotPreview: 'Скриншот к вопросу', shotWill: 'Скриншот будет отправлен с вопросом',
      shotCapture: 'Сделать скриншот и приложить к вопросу', shotPick: 'Приложить картинку', shotDefault: 'Объясните, что показано на скриншоте.',
      stopped: 'Ответ остановлен.', copy: 'Копировать ответ', copied: 'Ответ скопирован', copyFail: 'Не удалось скопировать', retry: 'Ответить заново',
      chipsQuote: ['Объясните проще', 'Покажите на числах', 'Откуда это следует?', 'Где это в машинном обучении?'],
      chipsExercise: ['Дайте подсказку, не решение', 'С чего начать?', 'Проверьте моё решение'],
      chipsEmpty: ['Перескажите главную мысль раздела', 'Проверьте меня: задайте 3 вопроса', 'Какие здесь частые ошибки?'],
      chipsHome: ['С какого урока начать?', 'Зачем машинному обучению математика?', 'Что я узнаю в этом курсе?'],
      checkMine: 'Проверьте моё решение', checkMinePrefix: 'Вот моё решение: ',
      removeQuote: 'Убрать фрагмент', stop: 'Остановить', send: 'Отправить (Enter)', thinking: 'Думаю…', sec: ' с', tokens: (n) => ' · ≈ ' + n + ' токенов рассуждений',
      noAnswer: 'Не удалось получить ответ.', noLink: 'Нет связи с claude-server. Запустите его и нажмите «Ответить заново».',
      models: { sonnet: 'Sonnet — быстро и точно', opus: 'Opus — глубже, медленнее', haiku: 'Haiku — самый быстрый' },
      efforts: { low: 'Быстрый ответ', medium: 'Обдуманный', high: 'Глубокий (дольше)' },
      sUrl: 'Адрес claude-server', sUrlHint: 'Локальный сервер на вашем компьютере. Запросы уходят только на этот адрес.', sModel: 'Модель', sEffort: 'Глубина ответа',
      sToken: 'Токен доступа', sTokenHint: 'Нужен, только если сервер запущен с CLAUDE_SERVER_TOKEN.', sTokenPh: 'не требуется', save: 'Сохранить', reset: 'По умолчанию',
      saved: 'Настройки сохранены', urlBad: 'Адрес должен начинаться с http:// или https://',
      title: 'ИИ-наставник', settings: 'Настройки', newChat: 'Новый диалог', close: 'Закрыть (Esc)', panel: 'ИИ-наставник курса', log: 'Диалог с наставником',
      cmdCopy: 'Копировать команду', cmdCopied: 'Команда скопирована', check: 'Проверить снова', serverOk: 'Сервер на связи',
      offTitle: 'Локальный сервер ИИ не запущен',
      offText: 'Наставник работает через Claude Code на вашем компьютере — ключ API не нужен, вопросы никуда, кроме Claude, не уходят. Один раз:',
      step1: ['Установите ', 'Node.js 18+', ' и Claude Code, выполните вход: '],
      step2Remote: 'Скачайте claude-server и распакуйте архив.', step3Remote: 'В папке сервера выполните команду:',
      step2Local: 'Запустите сервер в терминале из корня курса:', step3Local: ['Или одной командой — курс вместе с сервером: ', '. Нет репозитория под рукой? Скачайте архив и выполните в его папке ', '.'],
      step4: 'Нажмите «Проверить снова».', sameServer: 'Сервер, запущенный для курса «Градиентный бустинг», тоже подойдёт.',
      remoteNote: (o) => 'Сервер уже запущен? Если без этой настройки — остановите его (Ctrl+C) и запустите командой выше: она разрешает запросы со страниц ' + o + '.',
      forbidden: ['Сервер запущен, но отвечает 403: он не разрешает адрес этой страницы ', '. Обновите claude-server или запустите его с '],
      lnaPrompt: 'Браузер спросит, можно ли этому сайту обращаться к устройствам в локальной сети: ответьте «Разрешить» — так страница доберётся до сервера на вашем компьютере.',
      lnaDenied: 'Браузер запретил этому сайту доступ к локальной сети, и страница не видит сервер на вашем компьютере. Разрешите доступ в настройках сайта (значок слева от адреса → «Доступ к локальной сети») и нажмите «Проверить снова».',
      download: 'Скачать claude-server (zip)',
      emptyTitle: 'Спросите об уроке', emptyText: 'Выделите в уроке любое место — слово, формулу, абзац — и нажмите «Спросить ИИ». Наставник увидит фрагмент и раздел, в котором он находится.',
      emptyLesson: (id, t) => 'Открыт урок ' + id + ' «' + t + '».',
      emptyHomeTitle: 'Спросите о курсе', emptyHomeText: 'Наставник знает программу курса: подскажет, с какого урока начать и что понадобится для вашей задачи. В уроках он ещё и видит выделенный фрагмент.',
      placeholder: 'Ваш вопрос…', inputLabel: 'Вопрос наставнику', hint: 'Enter — отправить, Shift+Enter — новая строка. ИИ может ошибаться — сверяйтесь с уроком.',
      hintTitle: 'Попросить у ИИ-наставника подсказку к этой задаче', hintBtn: 'Подсказка',
      ask: 'Спросить ИИ', askTitle: 'Задать вопрос ИИ-наставнику по выделенному фрагменту (Alt+I)', toggle: 'ИИ-наставник', toggleTitle: 'ИИ-наставник (Alt+I)',
    },
    en: {
      widget: 'interactive figure', caption: 'Caption: ', quiz: 'quiz “Check yourself”', lessonStart: 'Top of the lesson', pageStart: 'Top of the page',
      checking: 'checking the server…', online: (m) => 'Claude · ' + m + ' · local', offlineSt: 'server is not running',
      badUrl: 'The server address in the settings is invalid.', noServer: 'Could not reach claude-server.', srvErr: (c) => 'The server returned error ' + c + '.',
      needToken: 'The server requires a token: enter it in the assistant settings.', genErr: 'Generation error.', empty: 'The model returned an empty answer. Try again.',
      fromLesson: 'From the lesson', fromPage: 'From the page', exerciseSrc: 'Problem',
      shotAlt: 'Screenshot attached to the question', shotGoneUi: 'screenshot (not kept after reload)', shotOld: 'The running claude-server does not accept images; restart it',
      shotType: 'Use a PNG, JPEG, WebP or GIF image', shotRead: 'Could not read the image', shotHint: 'Drag to select an area · Enter: whole window · Esc: cancel',
      shotArea: 'Select an area for the screenshot', shotFail: 'Could not take the screenshot: ', shotRemove: 'Remove the screenshot', shotPreview: 'Screenshot for the question', shotWill: 'The screenshot will be sent with the question',
      shotCapture: 'Take a screenshot and attach it to the question', shotPick: 'Attach an image', shotDefault: 'Explain what the screenshot shows.',
      stopped: 'The answer was stopped.', copy: 'Copy the answer', copied: 'Answer copied', copyFail: 'Could not copy', retry: 'Answer again',
      chipsQuote: ['Explain it more simply', 'Show it with numbers', 'Where does this come from?', 'Where is this used in machine learning?'],
      chipsExercise: ['Give me a hint, not the solution', 'Where do I start?', 'Check my solution'],
      chipsEmpty: ['Summarize the main idea of this section', 'Quiz me: ask 3 questions', 'What are the common mistakes here?'],
      chipsHome: ['Which lesson should I start with?', 'Why does machine learning need mathematics?', 'What will I learn in this course?'],
      checkMine: 'Check my solution', checkMinePrefix: 'Here is my solution: ',
      removeQuote: 'Remove the fragment', stop: 'Stop', send: 'Send (Enter)', thinking: 'Thinking…', sec: ' s', tokens: (n) => ' · ≈ ' + n + ' reasoning tokens',
      noAnswer: 'Could not get an answer.', noLink: 'No connection to claude-server. Start it and press “Answer again”.',
      models: { sonnet: 'Sonnet: fast and accurate', opus: 'Opus: deeper, slower', haiku: 'Haiku: the fastest' },
      efforts: { low: 'Quick answer', medium: 'Considered', high: 'Deep (slower)' },
      sUrl: 'claude-server address', sUrlHint: 'A local server on your computer. Requests go only to this address.', sModel: 'Model', sEffort: 'Answer depth',
      sToken: 'Access token', sTokenHint: 'Needed only if the server was started with CLAUDE_SERVER_TOKEN.', sTokenPh: 'not required', save: 'Save', reset: 'Defaults',
      saved: 'Settings saved', urlBad: 'The address must start with http:// or https://',
      title: 'AI tutor', settings: 'Settings', newChat: 'New chat', close: 'Close (Esc)', panel: 'AI tutor of the course', log: 'Chat with the tutor',
      cmdCopy: 'Copy the command', cmdCopied: 'Command copied', check: 'Check again', serverOk: 'The server is up',
      offTitle: 'The local AI server is not running',
      offText: 'The tutor works through Claude Code on your computer: no API key is needed, and questions go nowhere except to Claude. Once:',
      step1: ['Install ', 'Node.js 18+', ' and Claude Code, then sign in: '],
      step2Remote: 'Download claude-server and unzip it.', step3Remote: 'In the server folder, run:',
      step2Local: 'Start the server in a terminal from the course root:', step3Local: ['Or start the course together with the server: ', '. No repository at hand? Download the archive and run in its folder ', '.'],
      step4: 'Press “Check again”.', sameServer: 'A server started for the “Gradient boosting” course works too.',
      remoteNote: (o) => 'Already running? If it was started without this setting, stop it (Ctrl+C) and start it with the command above, which allows requests from ' + o + '.',
      forbidden: ['The server is running but answers 403: it does not allow the address of this page ', '. Update claude-server or start it with '],
      lnaPrompt: 'The browser will ask whether this site may access devices on your local network: choose “Allow” so the page can reach the server on your computer.',
      lnaDenied: 'The browser has blocked this site from the local network, so the page cannot see the server on your computer. Allow access in the site settings (the icon to the left of the address → “Local network access”) and press “Check again”.',
      download: 'Download claude-server (zip)',
      emptyTitle: 'Ask about the lesson', emptyText: 'Select any part of the lesson (a word, a formula, a paragraph) and press “Ask AI”. The tutor will see the fragment and the section it belongs to.',
      emptyLesson: (id, t) => 'Lesson ' + id + ' “' + t + '” is open.',
      emptyHomeTitle: 'Ask about the course', emptyHomeText: 'The tutor knows the curriculum: it will suggest where to start and what you need for your goal. Inside lessons it also sees the fragment you select.',
      placeholder: 'Your question…', inputLabel: 'Question for the tutor', hint: 'Enter: send, Shift+Enter: new line. AI can make mistakes; check against the lesson.',
      hintTitle: 'Ask the AI tutor for a hint on this problem', hintBtn: 'Hint',
      ask: 'Ask AI', askTitle: 'Ask the AI tutor about the selected fragment (Alt+I)', toggle: 'AI tutor', toggleTitle: 'AI tutor (Alt+I)',
    },
    uz: {
      widget: 'interaktiv rasm', caption: 'Izoh: ', quiz: '«O‘zingizni tekshiring» testi', lessonStart: 'Dars boshi', pageStart: 'Sahifa boshi',
      checking: 'server tekshirilmoqda…', online: (m) => 'Claude · ' + m + ' · lokal', offlineSt: 'server ishga tushirilmagan',
      badUrl: 'Sozlamalarda server manzili noto‘g‘ri.', noServer: 'claude-server bilan bog‘lanib bo‘lmadi.', srvErr: (c) => 'Server ' + c + ' xatosi bilan javob berdi.',
      needToken: 'Server token talab qiladi: uni yordamchi sozlamalarida kiriting.', genErr: 'Generatsiya xatosi.', empty: 'Model bo‘sh javob qaytardi. Yana urinib ko‘ring.',
      fromLesson: 'Darsdan', fromPage: 'Sahifadan', exerciseSrc: 'Masala',
      shotAlt: 'Savolga biriktirilgan skrinshot', shotGoneUi: 'skrinshot (qayta yuklangandan keyin saqlanmaydi)', shotOld: 'Ishlayotgan claude-server rasmlarni qabul qilmaydi — uni qayta ishga tushiring',
      shotType: 'PNG, JPEG, WebP yoki GIF rasm mos keladi', shotRead: 'Rasmni o‘qib bo‘lmadi', shotHint: 'Sichqoncha bilan sohani belgilang · Enter — butun oyna · Esc — bekor qilish',
      shotArea: 'Skrinshot sohasini tanlash', shotFail: 'Skrinshot olib bo‘lmadi: ', shotRemove: 'Skrinshotni olib tashlash', shotPreview: 'Savol uchun skrinshot', shotWill: 'Skrinshot savol bilan yuboriladi',
      shotCapture: 'Skrinshot olib, savolga biriktirish', shotPick: 'Rasm biriktirish', shotDefault: 'Skrinshotda nima ko‘rsatilganini tushuntiring.',
      stopped: 'Javob to‘xtatildi.', copy: 'Javobni nusxalash', copied: 'Javob nusxalandi', copyFail: 'Nusxalab bo‘lmadi', retry: 'Qaytadan javob berish',
      chipsQuote: ['Soddaroq tushuntiring', 'Sonlarda ko‘rsating', 'Bu qayerdan kelib chiqadi?', 'Bu mashinaviy o‘qitishda qayerda uchraydi?'],
      chipsExercise: ['Yechim emas, maslahat bering', 'Nimadan boshlay?', 'Yechimimni tekshiring'],
      chipsEmpty: ['Bo‘limning asosiy fikrini qisqacha ayting', 'Meni tekshiring: 3 ta savol bering', 'Bu yerda qanday xatolar ko‘p uchraydi?'],
      chipsHome: ['Qaysi darsdan boshlay?', 'Mashinaviy o‘qitishga matematika nima uchun kerak?', 'Bu kursda nimalarni o‘rganaman?'],
      checkMine: 'Yechimimni tekshiring', checkMinePrefix: 'Mana mening yechimim: ',
      removeQuote: 'Parchani olib tashlash', stop: 'To‘xtatish', send: 'Yuborish (Enter)', thinking: 'O‘ylayapman…', sec: ' s', tokens: (n) => ' · ≈ ' + n + ' ta mulohaza tokeni',
      noAnswer: 'Javob olib bo‘lmadi.', noLink: 'claude-server bilan aloqa yo‘q. Uni ishga tushiring va «Qaytadan javob berish»ni bosing.',
      models: { sonnet: 'Sonnet — tez va aniq', opus: 'Opus — chuqurroq, sekinroq', haiku: 'Haiku — eng tez' },
      efforts: { low: 'Tez javob', medium: 'O‘ylangan', high: 'Chuqur (uzoqroq)' },
      sUrl: 'claude-server manzili', sUrlHint: 'Kompyuteringizdagi lokal server. So‘rovlar faqat shu manzilga yuboriladi.', sModel: 'Model', sEffort: 'Javob chuqurligi',
      sToken: 'Kirish tokeni', sTokenHint: 'Faqat server CLAUDE_SERVER_TOKEN bilan ishga tushirilgan bo‘lsa kerak.', sTokenPh: 'talab qilinmaydi', save: 'Saqlash', reset: 'Standart',
      saved: 'Sozlamalar saqlandi', urlBad: 'Manzil http:// yoki https:// bilan boshlanishi kerak',
      title: 'AI-ustoz', settings: 'Sozlamalar', newChat: 'Yangi suhbat', close: 'Yopish (Esc)', panel: 'Kursning AI-ustozi', log: 'Ustoz bilan suhbat',
      cmdCopy: 'Buyruqni nusxalash', cmdCopied: 'Buyruq nusxalandi', check: 'Qayta tekshirish', serverOk: 'Server aloqada',
      offTitle: 'Lokal AI-server ishga tushirilmagan',
      offText: 'Ustoz kompyuteringizdagi Claude Code orqali ishlaydi — API kaliti kerak emas, savollar Claude dan boshqa hech qayerga ketmaydi. Bir marta:',
      step1: ['', 'Node.js 18+', ' va Claude Code ni o‘rnating, tizimga kiring: '],
      step2Remote: 'claude-server ni yuklab oling va arxivni oching.', step3Remote: 'Server papkasida buyruqni bajaring:',
      step2Local: 'Serverni terminalda kurs ildizidan ishga tushiring:', step3Local: ['Yoki kursni server bilan birga bitta buyruqda: ', '. Repozitoriy yo‘qmi? Arxivni yuklab oling va uning papkasida bajaring: ', '.'],
      step4: '«Qayta tekshirish»ni bosing.', sameServer: '«Gradiyentli busting» kursi uchun ishga tushirilgan server ham mos keladi.',
      remoteNote: (o) => 'Server allaqachon ishlayaptimi? Agar bu sozlamasiz ishga tushirilgan bo‘lsa — uni to‘xtating (Ctrl+C) va yuqoridagi buyruq bilan ishga tushiring: u ' + o + ' sahifalaridan so‘rovlarga ruxsat beradi.',
      forbidden: ['Server ishlayapti, lekin 403 javob beryapti: u bu sahifa manziliga ruxsat bermaydi ', '. claude-server ni yangilang yoki uni quyidagi bilan ishga tushiring: '],
      lnaPrompt: 'Brauzer bu saytga lokal tarmoqdagi qurilmalarga murojaat qilishga ruxsat so‘raydi: «Ruxsat berish»ni tanlang — shunda sahifa kompyuteringizdagi serverga yeta oladi.',
      lnaDenied: 'Brauzer bu saytga lokal tarmoqqa kirishni taqiqlagan, sahifa kompyuteringizdagi serverni ko‘rmayapti. Sayt sozlamalarida ruxsat bering (manzil chap tomonidagi belgi → «Lokal tarmoqqa kirish») va «Qayta tekshirish»ni bosing.',
      download: 'claude-server ni yuklab olish (zip)',
      emptyTitle: 'Dars haqida so‘rang', emptyText: 'Darsning istalgan joyini — so‘z, formula, xatboshi — belgilang va «AI dan so‘rash»ni bosing. Ustoz parchani va u turgan bo‘limni ko‘radi.',
      emptyLesson: (id, t) => id + '-dars «' + t + '» ochiq.',
      emptyHomeTitle: 'Kurs haqida so‘rang', emptyHomeText: 'Ustoz kurs dasturini biladi: qaysi darsdan boshlash va maqsadingiz uchun nima kerakligini aytib beradi. Darslarda u belgilangan parchani ham ko‘radi.',
      placeholder: 'Savolingiz…', inputLabel: 'Ustozga savol', hint: 'Enter — yuborish, Shift+Enter — yangi qator. AI xato qilishi mumkin — dars bilan solishtiring.',
      hintTitle: 'AI-ustozdan bu masala bo‘yicha maslahat so‘rash', hintBtn: 'Maslahat',
      ask: 'AI dan so‘rash', askTitle: 'Belgilangan parcha bo‘yicha AI-ustozdan so‘rash (Alt+I)', toggle: 'AI-ustoz', toggleTitle: 'AI-ustoz (Alt+I)',
    },
  };
  const T = UI_TEXT[langOf()];

  const state = {
    main: null,
    hero: null,
    lesson: null, // запись MC.course
    turns: [],
    quote: null, // {text, section, context, kind} — фрагмент, приложенный к следующему вопросу
    image: null, // data-URL скриншота, приложенного к следующему вопросу
    serverImages: null, // умеет ли запущенный claude-server принимать изображения
    busy: false,
    abort: null,
    online: null, // null — не проверяли, true/false
    open: false,
  };
  const el = {}; // узлы интерфейса

  const settings = () => Object.assign({}, MC.config.assistant, MC.storage.get('assistant-settings', {}) || {});
  const storeKey = () => 'assistant:' + (MC.lang === 'ru' ? '' : MC.lang + ':') + (state.lesson ? state.lesson.id : 'course');
  const saveTurns = () =>
    MC.storage.set(
      storeKey(),
      // сами скриншоты не сохраняем (они большие) — только отметку, что он был
      state.turns.slice(-LIMITS.storedTurns).map((t) => ({ role: t.role, text: t.text, quote: t.quote, section: t.section, kind: t.kind, error: t.error, stopped: t.stopped, hadImage: !!(t.image || t.hadImage) || undefined }))
    );

  /* --------------------------------- текст урока ---------------------------------- */
  const SKIP = 'script, style, noscript, button, .katex-html, .eq-num, .h-num, .assistant-ask, .assistant-hint-btn, .fig-controls, .readout, .fig-note, .visually-hidden';
  const BLOCK = /^(P|DIV|SECTION|ARTICLE|H[1-6]|LI|UL|OL|DL|DT|DD|TR|TABLE|PRE|BLOCKQUOTE|DETAILS|SUMMARY|HEADER|FOOTER|FIGURE|FIGCAPTION|HR)$/;

  /** Текст узла так, как его стоит показать модели: формулы — в TeX, рисунки — пометкой. */
  function textOf(node) {
    let out = '';
    const walk = (n) => {
      if (n.nodeType === 3) {
        out += n.nodeValue;
        return;
      }
      if (n.nodeType !== 1 && n.nodeType !== 11) return;
      if (n.nodeType === 1) {
        if (n.matches(SKIP)) return;
        if (n.classList.contains('katex')) {
          const ann = n.querySelector('annotation');
          const html = n.querySelector('.katex-html');
          const display = n.parentElement && n.parentElement.classList.contains('katex-display');
          if (ann) out += display ? '\n$$' + ann.textContent.trim() + '$$\n' : '$' + ann.textContent.trim() + '$';
          else out += (html || n).textContent;
          return;
        }
        if (n.classList.contains('katex-mathml')) return;
        if (n.matches('[data-widget]')) {
          const t = n.querySelector('.fig-title');
          const cap = n.querySelector('.figcaption');
          out += '\n[' + T.widget + (t ? ': ' + tidy(textOf(t)) : '') + ']' + (cap ? '\n' + T.caption + tidy(textOf(cap)) : '') + '\n';
          return;
        }
        if (n.classList.contains('quiz')) {
          out += '\n[' + T.quiz + ']\n';
          return;
        }
        if (n.tagName === 'PRE') {
          out += '\n```\n' + n.textContent.trim() + '\n```\n';
          return;
        }
        if (n.tagName === 'BR') {
          out += '\n';
          return;
        }
        if (n.classList.contains('env-head')) {
          out += '\n' + tidy(n.textContent) + '. ';
          return;
        }
        if (n.tagName === 'LI') out += '\n- ';
        else if (n.tagName === 'TD' || n.tagName === 'TH') out += ' | ';
        else if (BLOCK.test(n.tagName)) out += '\n';
      }
      for (const c of n.childNodes) walk(c);
      if (n.nodeType === 1 && BLOCK.test(n.tagName)) out += '\n';
    };
    walk(node);
    return tidy(out);
  }

  const headingText = (h) => (h ? h.dataset.title || tidy(textOf(h)) : '');

  /** Раздел урока, к которому относится узел: {title, node}. */
  function sectionOf(node) {
    const start = node && node.nodeType === 3 ? node.parentElement : node;
    if (start && state.hero && state.hero.contains(start)) return { title: state.lesson ? T.lessonStart : T.pageStart, node: state.hero };
    const sec = start && start.closest ? start.closest(state.lesson ? 'main.lesson > section' : 'main > section') : null;
    if (sec) return { title: headingText(sec.querySelector(':scope > h2, h2')), node: sec };
    return { title: '', node: state.main };
  }

  /** Раздел, который сейчас на экране (когда чат открыт без выделения). */
  function visibleSection() {
    const top = 90;
    for (const s of state.main.querySelectorAll(':scope > section')) {
      if (s.getBoundingClientRect().bottom > top + 40) return sectionOf(s);
    }
    return { title: '', node: null };
  }

  function lessonInfo() {
    const l = state.lesson;
    const P = PROMPT[langOf()];
    if (!l) {
      // главная: курс целиком — части и уроки, готовые отмечены *
      const program = MC.course.parts.map((p) => p.id + ' ' + P.q[0] + p.title + P.q[1] + ': ' + p.lessons.map((x) => x.id + ' ' + x.title + (x.status === 'ready' ? '*' : '')).join(', '));
      return { home: true, title: MC.course.title, summary: MC.course.subtitle, program };
    }
    const part = MC.course.part(l.part);
    const strip = (html) => tidy(String(html || '').replace(/<[^>]+>/g, ''));
    return {
      number: l.id,
      title: l.title,
      part: part ? part.id + ' ' + P.q[0] + part.title + P.q[1] : '',
      subtitle: l.subtitle,
      summary: l.summary,
      objectives: (l.objectives || []).map(strip),
      outline: Array.from(state.main.querySelectorAll(':scope > section > h2')).map(headingText).filter(Boolean),
    };
  }

  /* --------------------------------- выделение ------------------------------------ */
  const inScope = (n) => !!n && (state.main.contains(n) || (state.hero && state.hero.contains(n)));

  function currentSelection() {
    const sel = root.getSelection && root.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!inScope(sel.anchorNode) || !inScope(sel.focusNode)) return null;
    const host = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
    if (host && host.closest('input, textarea, select, [contenteditable="true"], .assistant')) return null;
    const text = textOf(range.cloneContents());
    if (!text.replace(/\s/g, '')) return null; // достаточно одного символа: «η», «∇»
    return { range, text };
  }

  function quoteFromSelection(s) {
    const sec = sectionOf(s.range.startContainer);
    return { text: clip(s.text, LIMITS.selection), section: sec.title, context: sec.node ? textOf(sec.node) : '' };
  }

  let mouseDown = false;
  let selTimer = null;
  function placeAsk() {
    const s = currentSelection();
    if (!s || mouseDown) return hideAsk();
    const rects = Array.from(s.range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
    if (!rects.length) return hideAsk();
    const last = rects[rects.length - 1];
    const first = rects[0];
    const vw = doc.documentElement.clientWidth;
    const vh = root.innerHeight;
    el.ask.hidden = false;
    const w = el.ask.offsetWidth;
    const h = el.ask.offsetHeight;
    let top = last.bottom + 10;
    let left = last.right - w / 2;
    if (top + h > vh - 8) top = first.top - h - 10; // снизу нет места — над выделением
    if (top < 8 || last.bottom < 0 || first.top > vh) return hideAsk(); // выделение ушло с экрана
    left = Math.max(8, Math.min(left, vw - w - 8));
    el.ask.style.top = Math.round(top) + 'px';
    el.ask.style.left = Math.round(left) + 'px';
    el.ask.classList.add('show');
  }
  function hideAsk() {
    if (!el.ask) return;
    el.ask.classList.remove('show');
    el.ask.hidden = true;
  }

  function watchSelection() {
    const later = (ms) => {
      clearTimeout(selTimer);
      selTimer = setTimeout(placeAsk, ms);
    };
    doc.addEventListener('mousedown', (e) => {
      if (el.ask.contains(e.target)) return;
      mouseDown = true;
      hideAsk();
    });
    doc.addEventListener('mouseup', () => {
      mouseDown = false;
      later(10);
    });
    doc.addEventListener('keyup', (e) => {
      if (e.shiftKey || e.key === 'Shift' || (e.key === 'a' && (e.ctrlKey || e.metaKey))) later(10);
    });
    doc.addEventListener('touchend', () => later(350), { passive: true });
    doc.addEventListener('selectionchange', () => later(mouseDown ? 100000 : 300));
    const follow = MC.util.rafThrottle(() => {
      if (!el.ask.hidden) placeAsk();
    });
    root.addEventListener('scroll', follow, { passive: true, capture: true });
    root.addEventListener('resize', follow);
  }

  /* --------------------------------- сервер --------------------------------------- */
  function headers() {
    const h = { 'Content-Type': 'application/json' };
    const t = settings().token;
    if (t) h.Authorization = 'Bearer ' + t;
    return h;
  }

  /** Chrome (Local Network Access): сайт из интернета обращается к 127.0.0.1 только с разрешения ученика. */
  async function lnaState() {
    if (!isRemotePage() || !root.navigator.permissions) return null;
    try {
      return (await root.navigator.permissions.query({ name: 'local-network-access' })).state; // granted | prompt | denied
    } catch (e) {
      return null; // браузер не знает такого разрешения — значит, и не спрашивает
    }
  }

  async function checkServer() {
    const url = normalizeUrl(settings().url);
    setStatus(null);
    let ok = false;
    state.serverForbidden = false;
    if (url) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 3500);
      try {
        const r = await fetch(url + '/health', { signal: ctl.signal, cache: 'no-store' });
        ok = r.ok;
        state.serverForbidden = r.status === 403; // сервер есть, но не разрешает адрес этой страницы
        // claude-server сообщает {images: true}; старая запущенная копия — нет
        state.serverImages = ok ? !!((await r.json().catch(() => ({}))) || {}).images : null;
      } catch (e) {
        ok = false;
      }
      clearTimeout(timer);
      // /health отвечает и чужим адресам; настоящее разрешение для сайта из интернета проверяем пустым запросом
      if (ok && isRemotePage()) {
        try {
          const r = await fetch(url + '/v1/chat/completions', { method: 'POST', headers: headers(), body: '{}', cache: 'no-store' });
          if (r.status === 403) {
            ok = false;
            state.serverForbidden = true;
          }
        } catch (e) {
          // CORS отказал (старый сервер без этого адреса в списке) — тоже «не разрешено»
          ok = false;
          state.serverForbidden = true;
        }
      }
    }
    if (el.forbidden) el.forbidden.hidden = !state.serverForbidden;
    if (el.lna) {
      const lna = ok ? null : await lnaState();
      el.lna.hidden = !lna || lna === 'granted';
      el.lna.textContent = lna === 'denied' ? T.lnaDenied : T.lnaPrompt;
    }
    setStatus(ok);
    return ok;
  }

  function setStatus(online) {
    state.online = online;
    if (!el.panel) return;
    el.panel.dataset.status = online === null ? 'checking' : online ? 'online' : 'offline';
    const s = settings();
    el.status.textContent = online === null ? T.checking : online ? T.online(s.model) : T.offlineSt;
    el.offline.hidden = online !== false;
  }

  /** Потоковый запрос. cb: {onText(полный текст), onThinking(число токенов)}. */
  async function streamChat(messages, signal, cb) {
    const s = settings();
    const url = normalizeUrl(s.url);
    if (!url) throw Object.assign(new Error(T.badUrl), { kind: 'config' });
    let res;
    try {
      res = await fetch(url + '/v1/chat/completions', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ model: s.model, effort: s.effort, stream: true, messages }),
        signal,
      });
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      throw Object.assign(new Error(T.noServer), { kind: 'offline' });
    }
    if (!res.ok) {
      let msg = T.srvErr(res.status);
      try {
        const j = await res.json();
        if (j && j.error && j.error.message) msg = j.error.message;
      } catch (e) {
        /* тело не JSON */
      }
      if (res.status === 401) msg = T.needToken;
      throw Object.assign(new Error(msg), { kind: 'server' });
    }
    let text = '';
    let failed = null;
    const parser = sseParser((ev) => {
      if (ev === '[DONE]') return;
      if (ev.error) {
        failed = ev.error.message || T.genErr;
        return;
      }
      const d = ev.choices && ev.choices[0] && ev.choices[0].delta;
      if (!d) return;
      if (typeof d.reasoning_tokens === 'number') cb.onThinking(d.reasoning_tokens);
      if (d.content) {
        text += d.content;
        cb.onText(text);
      }
    });
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      parser.feed(dec.decode(value, { stream: true }));
    }
    parser.end();
    if (failed) throw Object.assign(new Error(failed), { kind: 'server', partial: text });
    if (!text.trim()) throw Object.assign(new Error(T.empty), { kind: 'server' });
    return text;
  }

  /* --------------------------------- сообщения ------------------------------------ */
  const nearBottom = () => el.body.scrollHeight - el.body.scrollTop - el.body.clientHeight < 80;
  const toBottom = () => (el.body.scrollTop = el.body.scrollHeight);

  /** Текст фрагмента урока с отрисованными формулами ($…$ → KaTeX); остальное — как есть. */
  function withMath(text) {
    const out = [];
    const re = /\$\$([^$]+)\$\$|\$([^$\n]+)\$/g;
    let at = 0;
    let m;
    while ((m = re.exec(text))) {
      if (m.index > at) out.push(text.slice(at, m.index));
      out.push(MC.math.tex((m[1] || m[2]).trim(), false));
      at = m.index + m[0].length;
    }
    if (at < text.length) out.push(text.slice(at));
    return out;
  }

  function quoteBlock(q, section, kind) {
    const src = (kind === 'exercise' ? T.exerciseSrc : state.lesson ? T.fromLesson : T.fromPage) + (section ? ' · ' + section : '');
    return H('blockquote', { class: 'assistant-cite' }, H('span', { class: 'src' }, src), H('span', { class: 'txt' }, withMath(clip(q, 600))));
  }

  function renderUser(t) {
    const shot = t.image
      ? H('img', { class: 'assistant-shot', src: t.image, alt: T.shotAlt })
      : t.hadImage
        ? H('span', { class: 'assistant-shot-gone' }, icon('image'), T.shotGoneUi)
        : null;
    return H('div', { class: 'assistant-msg user' }, t.quote ? quoteBlock(t.quote, t.section, t.kind) : null, shot, H('div', { class: 'bubble' }, t.text));
  }

  /* --------------------------------- скриншот ------------------------------------- */
  const SHOT_MAX = 1568; // длинная сторона, пикселей: больше модели не нужно
  const canCapture = () => !!(root.navigator.mediaDevices && root.navigator.mediaDevices.getDisplayMedia);

  /** Холст → data-URL: PNG, а если он тяжёлый (фото, градиенты) — JPEG. */
  function canvasToDataUrl(canvas) {
    const png = canvas.toDataURL('image/png');
    return png.length < 1500000 ? png : canvas.toDataURL('image/jpeg', 0.9);
  }

  /** Вырезать область из источника (видео-кадр или картинка) и уменьшить до SHOT_MAX. */
  function drawShot(source, frame, crop) {
    const c = crop || { x: 0, y: 0, w: frame.w, h: frame.h };
    const size = fitSize(c.w, c.h, SHOT_MAX);
    const canvas = H('canvas', { width: size.w, height: size.h });
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, c.x, c.y, c.w, c.h, 0, 0, size.w, size.h);
    return canvasToDataUrl(canvas);
  }

  function attachImage(dataUrl) {
    state.image = dataUrl;
    renderShot();
    updateSend();
    if (state.serverImages === false) MC.ui.toast(T.shotOld);
  }

  /** Картинка из файла или буфера обмена. */
  function attachFile(file) {
    if (!file || !/^image\/(png|jpeg|webp|gif)$/.test(file.type)) return MC.ui.toast(T.shotType);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      attachImage(drawShot(img, { w: img.naturalWidth, h: img.naturalHeight }));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      MC.ui.toast(T.shotRead);
    };
    img.src = url;
  }

  /**
   * Выбор области мышью на застывшем снимке окна. Возвращает {x, y, w, h} в координатах окна,
   * 'full' (Enter или щелчок без протяжки — всё окно) или null (Esc).
   */
  function pickRegion(frozen) {
    return new Promise((resolve) => {
      frozen.className = 'assistant-region-frame';
      const box = H('div', { class: 'assistant-region-box', hidden: true });
      const hint = H('div', { class: 'assistant-region-hint' }, T.shotHint);
      const layer = H('div', { class: 'assistant-region', tabindex: '-1', role: 'dialog', 'aria-label': T.shotArea }, frozen, box, hint);
      let start = null;
      const rectOf = (e) => ({ x: Math.min(start.x, e.clientX), y: Math.min(start.y, e.clientY), w: Math.abs(e.clientX - start.x), h: Math.abs(e.clientY - start.y) });
      const finish = (value) => {
        layer.remove();
        doc.removeEventListener('keydown', onKey, true);
        resolve(value);
      };
      const onKey = (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          finish(e.key === 'Enter' ? 'full' : null);
        }
      };
      layer.addEventListener('pointerdown', (e) => {
        start = { x: e.clientX, y: e.clientY };
        layer.setPointerCapture(e.pointerId);
        hint.hidden = true;
      });
      layer.addEventListener('pointermove', (e) => {
        if (!start) return;
        const r = rectOf(e);
        box.hidden = false;
        Object.assign(box.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
      });
      layer.addEventListener('pointerup', (e) => {
        if (!start) return;
        const r = rectOf(e);
        finish(r.w >= 8 && r.h >= 8 ? r : 'full');
      });
      doc.addEventListener('keydown', onKey, true);
      doc.body.appendChild(layer);
      layer.focus();
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const nextFrame = () => new Promise((r) => (root.requestAnimationFrame || setTimeout)(() => r()));

  /**
   * Снимок экрана, как в «ножницах»: браузер спрашивает разрешение на показ вкладки, берём ОДИН кадр
   * и сразу останавливаем показ; затем ученик выделяет область уже на застывшем кадре. Так в снимок
   * не попадает рамка выбора, а координаты области точно соответствуют тому, что ученик видит.
   */
  async function captureScreenshot() {
    if (state.capturing) return;
    if (!canCapture()) return el.file.click(); // телефон и старые браузеры — выбрать файл
    state.capturing = true;
    let stream = null;
    const video = H('video', { class: 'assistant-capture-video', muted: true, playsinline: true });
    try {
      stream = await root.navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'browser' }, audio: false, preferCurrentTab: true, selfBrowserSurface: 'include' });
      const track = stream.getVideoTracks()[0];
      const isTab = (track.getSettings ? track.getSettings().displaySurface : 'browser') === 'browser';
      doc.body.classList.add('assistant-shooting'); // прячем панель и кнопку — в кадре только урок
      doc.body.appendChild(video); // в документе: иначе браузер может не обновлять кадры
      video.srcObject = stream;
      await video.play();
      // страница перерисовывается без панели; захват отстаёт на несколько кадров — ждём, но не вечно
      await nextFrame();
      await nextFrame();
      await Promise.race([new Promise((r) => (video.requestVideoFrameCallback ? video.requestVideoFrameCallback(() => r()) : r())), sleep(500)]);
      await sleep(250);
      const frame = { w: video.videoWidth, h: video.videoHeight };
      if (!frame.w || !frame.h) throw new Error('пустой кадр');
      const frozen = H('canvas', { width: frame.w, height: frame.h });
      frozen.getContext('2d').drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop()); // показ экрана больше не нужен
      stream = null;
      const region = isTab ? await pickRegion(frozen) : 'full';
      if (region) attachImage(drawShot(frozen, frame, region === 'full' ? null : cropRect(region, { w: root.innerWidth, h: root.innerHeight }, frame)));
    } catch (e) {
      if (e && e.name !== 'NotAllowedError' && e.name !== 'AbortError') MC.ui.toast(T.shotFail + (e.message || e.name));
    } finally {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      video.remove();
      doc.body.classList.remove('assistant-shooting');
      state.capturing = false;
      if (el.input) el.input.focus({ preventScroll: true });
    }
  }

  function renderShot() {
    el.shot.textContent = '';
    el.shot.hidden = !state.image;
    if (!state.image) return;
    const x = H('button', { type: 'button', class: 'icon-btn', title: T.shotRemove, 'aria-label': T.shotRemove }, icon('close'));
    x.addEventListener('click', () => {
      state.image = null;
      renderShot();
      updateSend();
      el.input.focus();
    });
    el.shot.append(H('img', { src: state.image, alt: T.shotPreview }), H('span', null, T.shotWill), x);
  }

  function renderBot(t, isLast) {
    const body = H('div', { class: 'assistant-answer' });
    if (t.text) body.appendChild(MC.md.toElement(t.text));
    if (t.stopped) body.appendChild(H('p', { class: 'assistant-note' }, T.stopped));
    if (t.error) body.appendChild(H('p', { class: 'assistant-error', role: 'alert' }, icon('alert'), H('span', null, t.error)));
    const actions = H('div', { class: 'assistant-actions' });
    if (t.text) {
      const copy = H('button', { type: 'button', class: 'icon-btn', title: T.copy, 'aria-label': T.copy }, icon('copy'));
      copy.addEventListener('click', async () => MC.ui.toast((await MC.io.copy(t.text)) ? T.copied : T.copyFail));
      actions.appendChild(copy);
    }
    if (isLast) {
      const retry = H('button', { type: 'button', class: 'icon-btn', title: T.retry, 'aria-label': T.retry }, icon('reset'));
      retry.addEventListener('click', regenerate);
      actions.appendChild(retry);
    }
    return H('div', { class: 'assistant-msg bot' }, body, actions);
  }

  function renderAll() {
    el.log.textContent = '';
    state.turns.forEach((t, i) => el.log.appendChild(t.role === 'user' ? renderUser(t) : renderBot(t, i === state.turns.length - 1 && !state.busy)));
    el.empty.hidden = state.turns.length > 0;
    renderChips();
    toBottom();
  }

  const CHIPS_QUOTE = T.chipsQuote;
  const CHIPS_EXERCISE = T.chipsExercise;
  const CHIPS_EMPTY = T.chipsEmpty;
  function renderChips() {
    el.chips.textContent = '';
    const list = state.quote ? (state.quote.kind === 'exercise' ? CHIPS_EXERCISE : CHIPS_QUOTE) : state.turns.length ? [] : state.lesson ? CHIPS_EMPTY : T.chipsHome;
    for (const c of list) {
      const b = H('button', { type: 'button', class: 'assistant-chip' }, c);
      b.addEventListener('click', () => {
        if (c === T.checkMine) {
          el.input.value = T.checkMinePrefix;
          autosize();
          el.input.focus();
          return;
        }
        send(c);
      });
      el.chips.appendChild(b);
    }
    el.chips.hidden = !list.length || state.busy;
  }

  function renderQuote() {
    el.quote.textContent = '';
    el.quote.hidden = !state.quote;
    if (state.quote) {
      const x = H('button', { type: 'button', class: 'icon-btn', title: T.removeQuote, 'aria-label': T.removeQuote }, icon('close'));
      x.addEventListener('click', () => {
        state.quote = null;
        renderQuote();
        renderChips();
        el.input.focus();
      });
      el.quote.append(quoteBlock(state.quote.text, state.quote.section, state.quote.kind), x);
    }
  }

  function setBusy(b) {
    state.busy = b;
    el.panel.classList.toggle('busy', b);
    el.log.setAttribute('aria-busy', String(b));
    el.send.replaceChildren(icon(b ? 'stop' : 'send'));
    el.send.title = b ? T.stop : T.send;
    el.send.setAttribute('aria-label', el.send.title);
    updateSend();
    renderChips();
  }
  const updateSend = () => (el.send.disabled = !state.busy && !el.input.value.trim() && !state.image);

  /* --------------------------------- отправка ------------------------------------- */
  async function send(textArg) {
    if (state.busy) return;
    const text = (textArg || el.input.value).trim() || (state.image ? T.shotDefault : '');
    if (!text) return;
    const q = state.quote;
    const sec = q ? null : visibleSection();
    const turn = { role: 'user', text, quote: q ? q.text : undefined, section: q ? q.section : sec.title || undefined, kind: q ? q.kind : undefined, image: state.image || undefined };
    turn.context = q ? q.context : sec.node ? textOf(sec.node) : '';
    state.turns.push(turn);
    state.quote = null;
    state.image = null;
    renderShot();
    if (!textArg) {
      el.input.value = '';
      autosize();
    }
    renderQuote();
    await answer();
  }

  function regenerate() {
    if (state.busy) return;
    while (state.turns.length && state.turns[state.turns.length - 1].role === 'assistant') state.turns.pop();
    if (state.turns.length) answer();
  }

  async function answer() {
    const bot = { role: 'assistant', text: '' };
    const messages = buildMessages(lessonInfo(), state.turns, MC.lang);
    state.turns.push(bot);
    setBusy(true);
    renderAll();
    // «живой» узел ответа: индикатор размышления → текст по мере поступления
    const node = el.log.lastChild;
    const body = node.querySelector('.assistant-answer');
    const think = H('div', { class: 'assistant-thinking' }, H('span', { class: 'dots', 'aria-hidden': 'true' }, H('i'), H('i'), H('i')), H('span', { class: 'label' }, T.thinking));
    body.replaceChildren(think);
    const t0 = Date.now();
    const tick = setInterval(() => {
      const label = think.querySelector('.label');
      if (label && think.isConnected) label.textContent = T.thinking + ' ' + Math.round((Date.now() - t0) / 1000) + T.sec + (think.dataset.tokens ? T.tokens(think.dataset.tokens) : '');
    }, 1000);
    const paint = MC.util.rafThrottle(() => {
      const stick = nearBottom();
      body.replaceChildren(MC.md.toElement(bot.text), H('span', { class: 'assistant-caret', 'aria-hidden': 'true' }));
      if (stick) toBottom();
    });
    state.abort = new AbortController();
    try {
      bot.text = await streamChat(messages, state.abort.signal, {
        onThinking: (n) => (think.dataset.tokens = String(n)),
        onText: (text) => {
          bot.text = text;
          paint();
        },
      });
      if (state.online !== true) setStatus(true);
    } catch (e) {
      if (e.name === 'AbortError') bot.stopped = true;
      else {
        if (e.partial) bot.text = e.partial;
        bot.error = e.message || T.noAnswer;
        if (e.kind === 'offline') {
          setStatus(false);
          bot.error = T.noLink;
        }
      }
    } finally {
      clearInterval(tick);
      state.abort = null;
      setBusy(false);
      saveTurns();
      // Лента перерисовывается целиком; отложенный paint() попадёт в уже отсоединённый узел — это безвредно
      const stick = nearBottom();
      const top = el.body.scrollTop;
      renderAll();
      if (!stick) el.body.scrollTop = top;
    }
  }

  /* --------------------------------- панель --------------------------------------- */
  function autosize() {
    el.input.style.height = 'auto';
    el.input.style.height = Math.min(160, el.input.scrollHeight) + 'px';
    updateSend();
  }

  function buildSettings() {
    const s = settings();
    const field = (label, control, hint) => H('label', { class: 'assistant-field' }, H('span', null, label), control, hint ? H('small', null, hint) : null);
    const url = H('input', { type: 'url', value: s.url, spellcheck: 'false', autocomplete: 'off' });
    const option = (v, label, cur) => H('option', { value: v, selected: v === cur }, label);
    const model = H('select', null, ['sonnet', 'opus', 'haiku'].map((m) => option(m, T.models[m], s.model)));
    const effort = H('select', null, ['low', 'medium', 'high'].map((m) => option(m, T.efforts[m], s.effort)));
    const token = H('input', { type: 'password', value: s.token, autocomplete: 'off', placeholder: T.sTokenPh });
    const save = MC.ui.button(T.save, { kind: 'primary', small: true });
    const reset = MC.ui.button(T.reset, { small: true });
    save.addEventListener('click', () => {
      const u = normalizeUrl(url.value);
      if (!u) {
        url.setAttribute('aria-invalid', 'true');
        url.focus();
        return MC.ui.toast(T.urlBad);
      }
      MC.storage.set('assistant-settings', { url: u, model: model.value, effort: effort.value, token: token.value.trim() });
      toggleSettings(false);
      checkServer();
      MC.ui.toast(T.saved);
    });
    reset.addEventListener('click', () => {
      MC.storage.set('assistant-settings', {});
      el.settings.replaceChildren(...buildSettings());
      checkServer();
    });
    return [
      field(T.sUrl, url, T.sUrlHint),
      field(T.sModel, model),
      field(T.sEffort, effort),
      field(T.sToken, token, T.sTokenHint),
      H('div', { class: 'assistant-settings-foot' }, reset, save),
    ];
  }

  function toggleSettings(show) {
    const on = show === undefined ? el.settings.hidden : show;
    if (on) el.settings.replaceChildren(...buildSettings());
    el.settings.hidden = !on;
    el.settingsBtn.setAttribute('aria-expanded', String(on));
  }

  /* --------------------------------- сервер не запущен --------------------------- */
  const isLocalHost = () => /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(root.location.hostname);
  /** Страница открыта из интернета (не с диска и не с локального сервера) — нужны разрешения браузера. */
  const isRemotePage = () => /^https?:$/.test(root.location.protocol) && !isLocalHost();
  // claude-server по умолчанию разрешает сайт курса (SITE_ORIGINS в claude-server/server.js); другим адресам нужна переменная
  const needsOriginEnv = () => isRemotePage() && root.location.origin !== 'https://jakharbek.github.io';
  const isWindows = () => /Win/i.test((root.navigator.userAgentData && root.navigator.userAgentData.platform) || root.navigator.platform || root.navigator.userAgent || '');

  /** Команда запуска скачанного сервера; для чужого адреса страницы — с разрешением этого адреса. */
  function serverCommand(os) {
    if (!needsOriginEnv()) return 'npm start';
    const o = root.location.origin;
    return os === 'win' ? '$env:CLAUDE_SERVER_ALLOWED_ORIGINS="' + o + '"; npm start' : 'CLAUDE_SERVER_ALLOWED_ORIGINS=' + o + ' npm start';
  }

  /** Инструкция «сервер не запущен»: для сайта в интернете — скачать архив, для локального курса — команда из корня. */
  function buildOffline() {
    const origin = root.location.origin;
    const copyBtn = (code) => {
      const b = H('button', { type: 'button', class: 'icon-btn', title: T.cmdCopy, 'aria-label': T.cmdCopy }, icon('copy'));
      b.addEventListener('click', async () => MC.ui.toast((await MC.io.copy(code.textContent)) ? T.cmdCopied : T.copyFail));
      return b;
    };
    const retry = MC.ui.button(T.check, { small: true, icon: 'reset' });
    retry.addEventListener('click', async () => {
      if (await checkServer()) MC.ui.toast(T.serverOk);
    });
    const download = H('a', { class: 'b2 small', href: MC.page.rootPath() + 'claude-server.zip', download: 'claude-server.zip' }, icon('download'), T.download);
    let step2;
    let step3;
    if (isRemotePage()) {
      let os = isWindows() ? 'win' : 'unix';
      const code = H('code', null, serverCommand(os));
      let osSwitch = null;
      if (needsOriginEnv()) {
        const mk = (id, label) => {
          const b = H('button', { type: 'button', 'aria-pressed': String(os === id) }, label);
          b.addEventListener('click', () => {
            os = id;
            code.textContent = serverCommand(os);
            osSwitch.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          });
          return b;
        };
        osSwitch = H('div', { class: 'assistant-os', role: 'group' }, mk('win', 'Windows (PowerShell)'), mk('unix', 'macOS / Linux'));
      }
      step2 = H('li', null, T.step2Remote);
      step3 = H('li', null, T.step3Remote, osSwitch, H('div', { class: 'cmd' }, code, copyBtn(code)), needsOriginEnv() ? H('small', { class: 'muted' }, T.remoteNote(origin)) : null);
    } else {
      const code = H('code', null, SERVER_CMD);
      step2 = H('li', null, T.step2Local, H('div', { class: 'cmd' }, code, copyBtn(code)));
      step3 = H('li', { class: 'muted' }, T.step3Local[0], H('code', null, 'python tools/serve.py'), T.step3Local[1], H('code', null, 'npm start'), T.step3Local[2]);
    }
    el.forbidden = H('p', { class: 'muted', hidden: true }, H('strong', null, '403 · '), T.forbidden[0], H('code', null, origin), T.forbidden[1], H('code', null, 'CLAUDE_SERVER_ALLOWED_ORIGINS=' + origin), '.');
    el.lna = H('p', { class: 'muted', hidden: true });
    return H(
      'div',
      { class: 'assistant-offline', hidden: true, role: 'status' },
      H('strong', null, T.offTitle),
      H('p', null, T.offText),
      H('ol', null, H('li', null, T.step1[0], H('a', { href: 'https://nodejs.org/', target: '_blank', rel: 'noopener noreferrer' }, T.step1[1]), T.step1[2], H('code', null, 'claude login')), step2, step3, H('li', null, T.step4)),
      H('p', { class: 'muted' }, T.sameServer),
      el.forbidden,
      el.lna,
      H('div', { class: 'actions' }, download, retry)
    );
  }

  function buildPanel() {
    const l = state.lesson;
    const iconBtn = (name, label, fn) => {
      const b = H('button', { type: 'button', class: 'icon-btn', title: label, 'aria-label': label }, icon(name));
      b.addEventListener('click', fn);
      return b;
    };
    el.status = H('span', { class: 'assistant-status' });
    el.settingsBtn = iconBtn('settings', T.settings, () => toggleSettings());
    el.settingsBtn.setAttribute('aria-expanded', 'false');
    const head = H(
      'header',
      { class: 'assistant-head' },
      H('div', { class: 'assistant-title' }, H('strong', null, T.title), H('span', { class: 'sub' }, H('i', { class: 'dot', 'aria-hidden': 'true' }), el.status)),
      iconBtn('plus', T.newChat, newChat),
      el.settingsBtn,
      iconBtn('close', T.close, () => close())
    );
    el.settings = H('div', { class: 'assistant-settings', hidden: true });

    el.offline = buildOffline();

    el.empty = H(
      'div',
      { class: 'assistant-empty' },
      H('span', { class: 'glyph', 'aria-hidden': 'true' }, '?'),
      H('strong', null, l ? T.emptyTitle : T.emptyHomeTitle),
      H('p', null, l ? T.emptyText : T.emptyHomeText),
      H('p', { class: 'muted' }, l ? T.emptyLesson(l.id, l.title) : '')
    );
    el.log = H('div', { class: 'assistant-log', role: 'log', 'aria-live': 'polite', 'aria-label': T.log });
    el.body = H('div', { class: 'assistant-body' }, el.empty, el.log);

    el.quote = H('div', { class: 'assistant-quote', hidden: true });
    el.chips = H('div', { class: 'assistant-chips' });
    el.input = H('textarea', { rows: '1', placeholder: T.placeholder, 'aria-label': T.inputLabel, maxlength: String(LIMITS.question) });
    el.input.addEventListener('input', autosize);
    el.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        send();
      }
    });
    // картинка из буфера обмена (Ctrl+V) — например, снимок, сделанный «ножницами»
    el.input.addEventListener('paste', (e) => {
      const file = Array.from((e.clipboardData && e.clipboardData.files) || []).find((f) => f.type.startsWith('image/'));
      if (file) {
        e.preventDefault();
        attachFile(file);
      }
    });
    el.send = H('button', { type: 'button', class: 'assistant-send' }, icon('send'));
    el.send.addEventListener('click', () => (state.busy ? state.abort && state.abort.abort() : send()));
    el.shot = H('div', { class: 'assistant-shot-preview', hidden: true });
    el.file = H('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif', hidden: true, 'aria-hidden': 'true', tabindex: '-1' });
    el.file.addEventListener('change', () => {
      if (el.file.files[0]) attachFile(el.file.files[0]);
      el.file.value = '';
    });
    const shotLabel = canCapture() ? T.shotCapture : T.shotPick;
    el.camera = H('button', { type: 'button', class: 'icon-btn assistant-camera', title: shotLabel, 'aria-label': shotLabel }, icon('camera'));
    el.camera.addEventListener('click', captureScreenshot);
    const foot = H(
      'footer',
      { class: 'assistant-foot' },
      el.quote,
      el.shot,
      el.chips,
      H('div', { class: 'assistant-input' }, el.camera, el.input, el.send, el.file),
      H('p', { class: 'assistant-hint' }, T.hint)
    );

    el.panel = H('aside', { class: 'assistant', 'aria-label': T.panel, hidden: true }, head, el.settings, el.offline, el.body, foot);
    el.panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (!el.settings.hidden) toggleSettings(false);
        else close();
      }
    });
    doc.body.appendChild(el.panel);
    setBusy(false);
  }

  function newChat() {
    if (state.abort) state.abort.abort();
    state.turns = [];
    state.quote = null;
    state.image = null;
    saveTurns();
    renderQuote();
    renderShot();
    renderAll();
    el.input.focus();
  }

  let returnFocus = null;
  /** Открыть панель; quote — {text, section, context, kind} или null. */
  function open(quote) {
    if (!el.panel) buildPanel();
    if (quote) state.quote = quote;
    if (!state.open) {
      returnFocus = doc.activeElement;
      state.open = true;
      el.panel.hidden = false;
      doc.body.classList.add('assistant-open');
      el.toggle.setAttribute('aria-pressed', 'true');
      renderAll();
      checkServer();
    }
    renderQuote();
    renderChips();
    hideAsk();
    setTimeout(() => el.input.focus({ preventScroll: true }), 30);
  }

  function close() {
    if (!state.open) return;
    state.open = false;
    el.panel.hidden = true;
    doc.body.classList.remove('assistant-open');
    el.toggle.setAttribute('aria-pressed', 'false');
    if (returnFocus && returnFocus.focus && doc.contains(returnFocus)) returnFocus.focus({ preventScroll: true });
  }

  /** Кнопка «Подсказка» у каждой задачи: в чат уходит условие (без решения). */
  function exerciseHints() {
    for (const ex of state.main.querySelectorAll('.exercise')) {
      const btn = H('button', { type: 'button', class: 'assistant-hint-btn', title: T.hintTitle }, icon('spark'), T.hintBtn);
      btn.addEventListener('click', () => {
        const statement = ex.cloneNode(true);
        statement.querySelectorAll('details, .env-head, .assistant-hint-btn').forEach((n) => n.remove());
        const name = (ex.querySelector('.env-head span') || {}).textContent || T.exerciseSrc;
        const sec = sectionOf(ex);
        open({ text: clip(textOf(statement), LIMITS.selection), section: name, context: sec.node ? textOf(sec.node) : '', kind: 'exercise' });
      });
      const head = ex.querySelector(':scope > .env-head');
      if (head) head.appendChild(btn);
    }
  }

  /* --------------------------------- инициализация -------------------------------- */
  function init(info) {
    // урок — его запись в программе; главная — lesson: null (наставник знает программу курса)
    const main = (info && info.main) || doc.querySelector('main.lesson') || doc.querySelector('main');
    const lesson = info && 'lesson' in info ? info.lesson : MC.course.byId(doc.documentElement.dataset.lesson);
    if (!main || el.ask) return;
    state.main = main;
    state.hero = lesson ? doc.querySelector('.lesson-hero') : null;
    state.lesson = lesson;
    state.turns = (MC.storage.get(storeKey(), []) || []).filter((t) => t && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string');

    // кнопка у выделенного текста
    el.ask = H('button', { type: 'button', class: 'assistant-ask', hidden: true, title: T.askTitle }, icon('spark'), H('span', null, T.ask));
    el.ask.addEventListener('mousedown', (e) => e.preventDefault()); // не сбрасывать выделение
    el.ask.addEventListener('click', () => {
      const s = currentSelection();
      if (s) open(quoteFromSelection(s));
    });
    doc.body.appendChild(el.ask);
    watchSelection();

    // кнопка в шапке — перед переключателем темы
    el.toggle = H('button', { type: 'button', class: 'icon-btn assistant-toggle', 'aria-label': T.toggle, 'aria-pressed': 'false', title: T.toggleTitle }, icon('spark'), H('span', { class: 'lbl' }, T.ask));
    el.toggle.addEventListener('click', () => (state.open ? close() : open(null)));
    const theme = doc.querySelector('.site-header .theme-btn');
    if (theme) theme.before(el.toggle);

    exerciseHints();

    doc.addEventListener('keydown', (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.code === 'KeyI' || e.key === 'i' || e.key === 'ш')) {
        e.preventDefault();
        const s = currentSelection();
        if (s) open(quoteFromSelection(s));
        else if (state.open) close();
        else open(null);
      } else if (e.key === 'Escape' && !el.ask.hidden) hideAsk();
    });
  }

  Object.assign(MC.assistant, { init, open, close, textOf, captureScreenshot });
  if (MC.bus) MC.bus.on('pageready', init);
})(typeof window !== 'undefined' ? window : globalThis);
