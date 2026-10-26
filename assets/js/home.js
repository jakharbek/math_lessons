/* =====================================================================================
 * MC.home — главная страница: шапка, фон-анимация (синус и его многочлены Тейлора),
 * «карта формулы» градиентного спуска и программа курса: карта ступеней, ступени с
 * раскрывающимися частями, поиск, фильтры («Готовые», «Пройденные», «Путь в ML») и прогресс.
 * Программа строится из MC.course — отдельно её нигде править не нужно.
 * ===================================================================================== */
(function (root) {
  'use strict';
  const MC = root.MC;
  const H = MC.h;
  const S = MC.svg;
  const doc = root.document;

  const plural = MC.util.plural;
  const norm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е');

  /* --------------------------------- фон: Тейлор ---------------------------------- */
  /** sin x и многочлены Тейлора T₁, T₃, …, T₂₅: каждый следующий дольше держится за синус. */
  function taylorArt(svg) {
    const W = 1200;
    const Hh = 560;
    const X = 11.5;
    const Y = 3.3;
    const sx = (x) => ((x + X) / (2 * X)) * W;
    const sy = (y) => Hh / 2 - (y / Y) * (Hh / 2);
    const poly = (n) => (x) => {
      let s = 0;
      let term = x; // x^(2k+1)/(2k+1)! со знаком
      for (let k = 0; 2 * k + 1 <= n; k++) {
        s += term;
        term *= (-x * x) / ((2 * k + 2) * (2 * k + 3));
      }
      return s;
    };
    const pathOf = (f) => {
      let d = '';
      let pen = false;
      for (let i = 0; i <= 900; i++) {
        const x = -X + (2 * X * i) / 900;
        const y = f(x);
        if (Math.abs(y) > Y * 1.15) {
          pen = false;
          continue;
        }
        d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1);
        pen = true;
      }
      return d;
    };
    svg.appendChild(S('line', { class: 'axis', x1: 0, x2: W, y1: Hh / 2, y2: Hh / 2 }));
    const curves = [];
    for (let n = 1; n <= 25; n += 2) curves.push(S('path', { class: 'taylor', d: pathOf(poly(n)) }));
    const sine = S('path', { class: 'sine', d: pathOf(Math.sin) });
    svg.append(...curves, sine);
    [sine, ...curves].forEach((p, i) => {
      const len = Math.ceil(p.getTotalLength ? p.getTotalLength() : 4000);
      p.style.setProperty('--len', len);
      p.style.animationDelay = (i === 0 ? 0.1 : 0.35 + i * 0.16).toFixed(2) + 's';
    });
  }

  /* --------------------------------- карта формулы -------------------------------- */
  const SYMBOLS = {
    theta: { part: '26', lesson: '26.3', html: '<b>θ</b> — параметры модели: вектор из тысяч, а то и миллиардов чисел. Как с такими объектами обращаться, рассказывает часть 26 «Векторы и матрицы».' },
    minus: { part: '38', lesson: '38.1', html: '<b>Минус</b>: шагаем против градиента — вниз, к минимуму. Так обучается почти любая модель. Урок 38.1 «Градиент и градиентный спуск».' },
    eta: { part: '38', lesson: '38.1', html: '<b>η</b> — темп обучения (learning rate), длина шага. Слишком большой — спуск разлетается, слишком маленький — ползёт. Урок 38.1.' },
    nabla: { part: '20', lesson: '20.1', html: '<b>∇</b> — градиент: стрелка в сторону самого быстрого роста. Он собран из производных — часть 20 «Производная».' },
    loss: { part: '37', lesson: null, html: '<b>L</b> — функция потерь: одно число, которое говорит, насколько модель ошибается. Откуда берутся MSE и log-loss — часть 37 «Математическая статистика».' },
  };
  const DEFAULT_CAPTION = 'Наведите на символ или нажмите на него — покажу, в какой части курса он объясняется.';

  function formulaMap() {
    const box = doc.getElementById('formula');
    const cap = doc.getElementById('formula-caption');
    if (!box || !cap) return;
    const syms = Array.from(box.querySelectorAll('.sym'));
    let pinned = null;
    const show = (key) => {
      syms.forEach((s) => s.classList.toggle('on', s.dataset.key === key));
      doc.querySelectorAll('.part').forEach((p) => p.classList.toggle('hl', !!key && p.dataset.part === SYMBOLS[key].part));
      if (!key) {
        cap.textContent = DEFAULT_CAPTION;
        return;
      }
      const info = SYMBOLS[key];
      cap.innerHTML = info.html; // доверенная разметка курса
      const l = info.lesson && MC.course.byId(info.lesson);
      if (l && l.status === 'ready') cap.append(' ', H('a', { class: 'ul', href: MC.course.href(l.id, './') }, 'Открыть урок →'));
      else cap.append(' ', H('a', { class: 'ul', href: '#part-' + info.part }, 'К программе →'));
    };
    syms.forEach((s) => {
      s.addEventListener('mouseenter', () => show(s.dataset.key));
      s.addEventListener('mouseleave', () => show(pinned));
      s.addEventListener('focus', () => show(s.dataset.key));
      s.addEventListener('blur', () => show(pinned));
      s.addEventListener('click', () => {
        pinned = pinned === s.dataset.key ? null : s.dataset.key;
        s.setAttribute('aria-pressed', String(pinned === s.dataset.key));
        syms.forEach((o) => o !== s && o.setAttribute('aria-pressed', 'false'));
        show(pinned);
      });
    });
    show(null);
  }

  /* --------------------------------- программа ------------------------------------ */
  /** Текст с подсветкой найденного (безопасно: только textContent). */
  function highlight(text, q) {
    if (!q) return [text];
    const out = [];
    const low = norm(text);
    let at = 0;
    let k;
    while ((k = low.indexOf(q, at)) >= 0) {
      if (k > at) out.push(text.slice(at, k));
      out.push(H('mark', { class: 'hit' }, text.slice(k, k + q.length)));
      at = k + q.length;
    }
    if (at < text.length) out.push(text.slice(at));
    return out;
  }

  const FILTERS = {
    all: () => true,
    ready: (l) => l.status === 'ready',
    done: (l) => MC.progress.isDone(l.id),
    ml: (l) => !!MC.course.part(l.part).ml,
  };
  const lessonText = (l) => norm([l.id, l.title, l.summary, l.subtitle, (l.keywords || []).join(' ')].join(' '));

  /** Совпадение урока с запросом: по самому уроку, его части или ступени. */
  function matches(l, query, f) {
    if (!FILTERS[f](l)) return false;
    if (!query) return true;
    const p = MC.course.part(l.part);
    const st = MC.course.stage(l.stage);
    return lessonText(l).includes(query) || norm(p.title + ' ' + p.summary).includes(query) || norm(st.title).includes(query);
  }

  function lessonRow(l, query) {
    const done = MC.progress.isDone(l.id);
    const ready = l.status === 'ready';
    const meta = ready
      ? H('span', { class: 'lm' }, done ? H('span', { class: 'tag done' }, MC.ui.icon('check'), 'пройден') : null, l.minutes + ' мин', MC.ui.icon('arrow', 'go'))
      : H('span', { class: 'lm' }, H('span', { class: 'tag' }, 'скоро'));
    const inner = [H('span', { class: 'ln' }, l.id), H('span', { class: 'lt' }, H('b', null, highlight(l.title, query)), H('span', null, highlight(l.summary, query))), meta];
    return H('li', null, ready ? H('a', { class: 'lrow ready', href: MC.course.href(l.id, './') }, inner) : H('div', { class: 'lrow soon', 'aria-disabled': 'true' }, inner));
  }

  function program() {
    const box = doc.getElementById('stages');
    const map = doc.getElementById('stage-map');
    const q = doc.getElementById('q');
    const stat = doc.getElementById('stat');
    const empty = doc.getElementById('empty');
    const kicker = doc.getElementById('program-kicker');
    const chips = Array.from(doc.querySelectorAll('#filters .chip'));
    if (!box) return;
    const C = MC.course;
    let filter = 'all';
    const userOpen = new Map(); // часть → раскрыта ли она учеником вручную

    if (kicker) kicker.textContent = plural(C.stages.length, 'ступень', 'ступени', 'ступеней') + ' · ' + plural(C.parts.length, 'часть', 'части', 'частей') + ' · ' + plural(C.lessons.length, 'урок', 'урока', 'уроков');

    const render = () => {
      const query = norm(q ? q.value.trim() : '');
      const narrowed = !!query || filter !== 'all';
      let shown = 0;
      const tiles = [];
      const blocks = [];
      for (const st of C.stages) {
        const parts = [];
        let stageCount = 0;
        for (const p of st.parts) {
          const ls = p.lessons.filter((l) => matches(l, query, filter));
          if (!ls.length) continue;
          stageCount += ls.length;
          const readyN = p.lessons.filter((l) => l.status === 'ready').length;
          const open = narrowed || (userOpen.has(p.id) ? userOpen.get(p.id) : readyN > 0);
          const det = H(
            'details',
            { class: 'part', id: 'part-' + p.id, 'data-part': p.id, open },
            H(
              'summary',
              null,
              H('span', { class: 'pn' }, p.id),
              H('span', { class: 'pt' }, H('b', null, highlight(p.title, query)), H('span', null, p.summary)),
              H(
                'span',
                { class: 'pm' },
                p.ml ? H('span', { class: 'tag ml', title: 'Входит в путь в машинное обучение' }, 'ML') : null,
                readyN ? H('span', { class: 'tag ready' }, 'готово ' + readyN) : null,
                narrowed && ls.length !== p.lessons.length ? ls.length + ' из ' + p.lessons.length : plural(p.lessons.length, 'урок', 'урока', 'уроков'),
                MC.ui.icon('chev', 'chev')
              )
            ),
            H('ol', { class: 'lessons' }, ls.map((l) => lessonRow(l, query)))
          );
          det.addEventListener('toggle', () => {
            if (!narrowed) userOpen.set(p.id, det.open);
          });
          parts.push(det);
        }
        shown += stageCount;
        const total = st.parts.reduce((s, p) => s + p.lessons.length, 0);
        const readySt = st.parts.reduce((s, p) => s + p.lessons.filter((l) => l.status === 'ready').length, 0);
        tiles.push(
          H(
            'a',
            { class: 'stage-tile', href: '#stage-' + st.id, hidden: !stageCount },
            H('span', { class: 'sn' }, st.id),
            H('b', null, st.title),
            readySt ? H('i', { class: 'rd', title: 'Есть готовые уроки' }) : null,
            H('small', null, plural(st.parts.length, 'часть', 'части', 'частей') + ' · ' + plural(total, 'урок', 'урока', 'уроков'))
          )
        );
        if (!parts.length) continue;
        blocks.push(
          H(
            'section',
            { class: 'stage', id: 'stage-' + st.id, 'data-stage': st.id },
            H(
              'header',
              { class: 'stage-head' },
              H('span', { class: 'stage-num', 'aria-hidden': 'true' }, st.id),
              H(
                'div',
                null,
                H('span', { class: 'kicker' }, 'Ступень ' + st.id + ' · ' + plural(st.parts.length, 'часть', 'части', 'частей') + ' · ' + plural(total, 'урок', 'урока', 'уроков')),
                H('h3', null, st.title),
                H('p', null, st.summary)
              )
            ),
            H('div', { class: 'parts' }, parts)
          )
        );
      }
      box.replaceChildren(...blocks);
      if (map) map.replaceChildren(...tiles);
      if (empty) empty.hidden = shown > 0;
      chips.forEach((c) => {
        const f = c.dataset.filter;
        c.setAttribute('aria-pressed', String(f === filter));
        c.querySelector('small').textContent = C.lessons.filter((l) => matches(l, query, f)).length;
      });
      const ready = C.ready();
      const done = ready.filter((l) => MC.progress.isDone(l.id)).length;
      if (stat) {
        stat.querySelector('.t').textContent = 'Готово ' + plural(ready.length, 'урок', 'урока', 'уроков') + ' из ' + C.lessons.length + ' · пройдено ' + done;
        stat.querySelector('.meter i').style.transform = 'scaleX(' + (ready.length ? done / ready.length : 0) + ')';
      }
    };
    chips.forEach((c) =>
      c.addEventListener('click', () => {
        filter = c.dataset.filter;
        render();
      })
    );
    if (q) q.addEventListener('input', MC.util.debounce(render, 80));
    MC.bus.on('progress', render);
    root.addEventListener('storage', (e) => e.key === 'mc:progress' && render()); // отметка в соседней вкладке
    render();
  }

  /** Переход по ссылке #part-N: раскрыть часть и прокрутить к ней. */
  function revealHash() {
    const id = decodeURIComponent(root.location.hash.slice(1));
    const t = id && doc.getElementById(id);
    if (!t) return;
    if (t.matches('details.part')) {
      t.open = true;
      t.classList.add('hl');
      setTimeout(() => t.classList.remove('hl'), 1800);
    }
    setTimeout(() => t.scrollIntoView({ block: 'start' }), 60);
  }

  /** Главная кнопка героя: «Продолжить» с последнего открытого урока или «Начать». */
  function cta() {
    const a = doc.getElementById('start');
    if (!a) return;
    const last = MC.course.byId(MC.progress.last());
    const first = MC.course.ready()[0];
    const target = last && last.status === 'ready' ? last : first;
    if (!target) return;
    a.href = MC.course.href(target.id, './');
    a.lastChild.textContent = (last && last.status === 'ready' ? 'Продолжить: ' : 'Начать: ') + target.title;
  }

  function init() {
    const head = MC.page.header(null);
    doc.body.prepend(head);
    MC.page.wireHeader(head);
    const art = doc.getElementById('hero-art');
    if (art) taylorArt(art);
    formulaMap();
    program();
    cta();
    doc.body.appendChild(MC.page.footer());
    MC.math.render(doc.body);
    revealHash();
    root.addEventListener('hashchange', revealHash);
  }

  MC.home = { init, taylorArt, plural };
})(typeof window !== 'undefined' ? window : globalThis);
