/* =====================================================================================
 * MC.home — главная страница: шапка, фон-анимация (синус и его многочлены Тейлора),
 * «карта формулы» градиентного спуска, программа курса с поиском, фильтром и прогрессом.
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
    theta: { part: 'III', lesson: '3.2', html: '<b>θ</b> — параметры модели: вектор из тысяч, а то и миллиардов чисел. Как с такими объектами обращаться, рассказывает часть III «Линейная алгебра».' },
    minus: { part: 'VI', lesson: '6.1', html: '<b>Минус</b>: шагаем против градиента — вниз, к минимуму. Так обучается почти любая модель. Урок 6.1 «Градиент и градиентный спуск».' },
    eta: { part: 'VI', lesson: '6.1', html: '<b>η</b> — темп обучения (learning rate), длина шага. Слишком большой — спуск разлетается, слишком маленький — ползёт. Урок 6.1.' },
    nabla: { part: 'II', lesson: '2.2', html: '<b>∇</b> — градиент: стрелка в сторону самого быстрого роста. Он собран из производных — часть II «Анализ», урок 2.2 «Производная».' },
    loss: { part: 'V', lesson: null, html: '<b>L</b> — функция потерь: одно число, которое говорит, насколько модель ошибается. Откуда берутся MSE и log-loss — часть V «Вероятность».' },
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

  function program() {
    const list = doc.getElementById('parts');
    const q = doc.getElementById('q');
    const stat = doc.getElementById('stat');
    const empty = doc.getElementById('empty');
    const chips = Array.from(doc.querySelectorAll('#filters .chip'));
    if (!list) return;
    let filter = 'all';

    const matches = (l, query, f) => {
      if (f === 'ready' && l.status !== 'ready') return false;
      if (f === 'done' && !MC.progress.isDone(l.id)) return false;
      if (!query) return true;
      return norm([l.id, l.title, l.summary, l.subtitle, (l.keywords || []).join(' ')].join(' ')).includes(query);
    };

    const row = (l, query) => {
      const done = MC.progress.isDone(l.id);
      const ready = l.status === 'ready';
      const meta = ready
        ? H('span', { class: 'lm' }, done ? H('span', { class: 'tag done' }, MC.ui.icon('check'), 'пройден') : null, l.minutes + ' мин', MC.ui.icon('arrow', 'go'))
        : H('span', { class: 'lm' }, H('span', { class: 'tag' }, 'скоро'));
      const inner = [H('span', { class: 'ln' }, l.id), H('span', { class: 'lt' }, H('b', null, highlight(l.title, query)), H('span', null, highlight(l.summary, query))), meta];
      return H('li', null, ready ? H('a', { class: 'lrow ready', href: MC.course.href(l.id, './') }, inner) : H('div', { class: 'lrow soon', 'aria-disabled': 'true' }, inner));
    };

    const render = () => {
      const query = norm(q ? q.value.trim() : '');
      let shown = 0;
      const parts = MC.course.parts
        .map((p) => {
          const ls = p.lessons.filter((l) => matches(l, query, filter));
          shown += ls.length;
          if (!ls.length) return null;
          return H(
            'article',
            { class: 'part', id: 'part-' + p.id, 'data-part': p.id },
            H('div', { class: 'part-num', 'aria-hidden': 'true' }, p.id),
            H('div', { class: 'part-body' }, H('h3', null, H('span', { class: 'visually-hidden' }, 'Часть ' + p.id + '. '), p.title), H('p', { class: 'desc' }, p.summary), H('ol', { class: 'lessons' }, ls.map((l) => row(l, query))))
          );
        })
        .filter(Boolean);
      list.replaceChildren(...parts);
      if (empty) empty.hidden = shown > 0;
      chips.forEach((c) => {
        const f = c.dataset.filter;
        c.setAttribute('aria-pressed', String(f === filter));
        const n = MC.course.lessons.filter((l) => matches(l, query, f)).length;
        c.querySelector('small').textContent = n;
      });
      const ready = MC.course.ready();
      const done = ready.filter((l) => MC.progress.isDone(l.id)).length;
      if (stat) {
        stat.querySelector('.t').textContent = 'Готово ' + plural(ready.length, 'урок', 'урока', 'уроков') + ' из ' + MC.course.lessons.length + ' · пройдено ' + done;
        stat.querySelector('.meter i').style.transform = 'scaleX(' + (ready.length ? done / ready.length : 0) + ')';
      }
    };
    chips.forEach((c) =>
      c.addEventListener('click', () => {
        filter = c.dataset.filter;
        render();
      })
    );
    if (q) q.addEventListener('input', render);
    MC.bus.on('progress', render);
    root.addEventListener('storage', (e) => e.key === 'mc:progress' && render()); // отметка в соседней вкладке
    render();
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
    if (root.location.hash) {
      const t = doc.getElementById(decodeURIComponent(root.location.hash.slice(1)));
      if (t) setTimeout(() => t.scrollIntoView(), 60);
    }
  }

  MC.home = { init, taylorArt, plural };
})(typeof window !== 'undefined' ? window : globalThis);
