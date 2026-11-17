/* Урок 7.17 «Система натуральных чисел» (Куликов, гл. 4, § 1).
 * Рисунок 1 «Слова из палочек»: сумма m ⊕ n — сочленение, произведение m ⊙ n — слово m, повторённое n раз;
 * вычисление по шагам по правилам m ⊕ n| = (m ⊕ n)| и m ⊙ n| = (m ⊙ n) ⊕ m (аксиомы IV и VI в модели N*).
 * Рисунок 2 «Аксиома индукции»: множество A на отрезке 0…15, условия (a) 0 ∈ A и (b) n ∈ A ⇒ n + 1 ∈ A,
 * «домино» от нуля. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Слова из палочек: сложение и умножение',
      title2: 'Аксиома индукции: падают ли все костяшки',
      m: 'слово $m$',
      n: 'слово $n$',
      op: 'Операция',
      sticks: (k) => (k === 0 ? '0* (пусто)' : MC.i18n.count(k, { ru: ['палочка', 'палочки', 'палочек'] }, 'ru')),
      inM: 'палочек в $m$',
      inN: 'палочек в $n$',
      inR: 'в результате',
      aria1: 'Слова m, n и результат операции, записанные палочками',
      addHead: (m, n, r) => 'Сумма: слово n приписано справа к слову m, палочек ' + m + ' + ' + n + ' = ' + r + '. По шагам (число палочек): ',
      mulHead: (m, n, r) => 'Произведение: слово m повторено ' + n + ' раз, палочек ' + m + ' · ' + n + ' = ' + r + '. По шагам (число палочек): ',
      addBase: (m) => 'm ⊕ 0* = m (' + m + ')',
      addStep: (k, prev, r) => 'm ⊕ ' + k + ' = (m ⊕ ' + (k - 1) + ')| = ' + prev + ' + 1 = ' + r,
      mulBase: 'm ⊙ 0* = 0* (0)',
      mulStep: (k, prev, m, r) => 'm ⊙ ' + k + ' = (m ⊙ ' + (k - 1) + ') ⊕ m = ' + prev + ' + ' + m + ' = ' + r,
      a: '(a) $0 \\in A$',
      b: '(b) $n \\in A \\Rightarrow n + 1 \\in A$',
      full: '$A$ — весь отрезок',
      yes: 'да',
      no: 'нет',
      run: 'Пуск',
      stop: 'Стоп',
      pre: { all: 'Все', noBase: 'Без базы', gap: 'Разрыв', even: 'Чётные' },
      aria2: 'Числа от 0 до 15; синие клетки — элементы множества A',
      cell: (k, on) => k + (on ? ' — в A' : ' — не в A'),
      okAll: 'Выполнены (a) и (b) — по аксиоме VII множество A содержит все числа. «Пуск» уронит все костяшки.',
      noA: 'Нарушено (a): 0 не входит в A. Шаг может быть верен (например, для A = {n | n ≥ 3}), но цепочке не с чего начаться.',
      noB: (k) => 'Нарушено (b): ' + k + ' ∈ A, но ' + (k + 1) + ' ∉ A. Волна от нуля остановится на числе ' + (k + 1) + '.',
      wave: (k) => 'Волна от нуля дошла до числа ' + k + '. ',
      waveAll: 'Волна от нуля прошла весь отрезок. ',
      hint2: 'Нажмите на клетку, чтобы включить число в A или исключить его.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Words made of strokes: addition and multiplication',
      title2: 'The induction axiom: do all dominoes fall',
      m: 'word $m$',
      n: 'word $n$',
      op: 'Operation',
      sticks: (k) => (k === 0 ? '0* (empty)' : MC.i18n.count(k, { en: ['stroke', 'strokes'] }, 'en')),
      inM: 'strokes in $m$',
      inN: 'strokes in $n$',
      inR: 'in the result',
      aria1: 'Words m, n and the result of the operation written with strokes',
      addHead: (m, n, r) => 'Sum: the word n is appended to the right of m, strokes ' + m + ' + ' + n + ' = ' + r + '. Step by step (number of strokes): ',
      mulHead: (m, n, r) => 'Product: the word m repeated ' + n + ' times, strokes ' + m + ' · ' + n + ' = ' + r + '. Step by step (number of strokes): ',
      addBase: (m) => 'm ⊕ 0* = m (' + m + ')',
      addStep: (k, prev, r) => 'm ⊕ ' + k + ' = (m ⊕ ' + (k - 1) + ')| = ' + prev + ' + 1 = ' + r,
      mulBase: 'm ⊙ 0* = 0* (0)',
      mulStep: (k, prev, m, r) => 'm ⊙ ' + k + ' = (m ⊙ ' + (k - 1) + ') ⊕ m = ' + prev + ' + ' + m + ' = ' + r,
      a: '(a) $0 \\in A$',
      b: '(b) $n \\in A \\Rightarrow n + 1 \\in A$',
      full: '$A$ is the whole range',
      yes: 'yes',
      no: 'no',
      run: 'Run',
      stop: 'Stop',
      pre: { all: 'All', noBase: 'No base', gap: 'Gap', even: 'Even' },
      aria2: 'Numbers 0 to 15; blue cells are elements of the set A',
      cell: (k, on) => k + (on ? ' — in A' : ' — not in A'),
      okAll: 'Both (a) and (b) hold — by axiom VII the set A contains every number. “Run” knocks down all dominoes.',
      noA: 'Condition (a) fails: 0 is not in A. The step may hold (e.g. for A = {n | n ≥ 3}), but the chain has nowhere to start.',
      noB: (k) => 'Condition (b) fails: ' + k + ' ∈ A, but ' + (k + 1) + ' ∉ A. The wave from zero stops at ' + (k + 1) + '.',
      wave: (k) => 'The wave from zero reached ' + k + '. ',
      waveAll: 'The wave from zero went through the whole range. ',
      hint2: 'Click a cell to put the number into A or take it out.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: 'Tayoqchalardan so‘zlar: qo‘shish va ko‘paytirish',
      title2: 'Induksiya aksiomasi: barcha domino toshlari yiqiladimi',
      m: '$m$ so‘z',
      n: '$n$ so‘z',
      op: 'Amal',
      sticks: (k) => (k === 0 ? '0* (bo‘sh)' : k + ' ta tayoqcha'),
      inM: '$m$ dagi tayoqchalar',
      inN: '$n$ dagi tayoqchalar',
      inR: 'natijada',
      aria1: 'm, n so‘zlar va amal natijasi tayoqchalar bilan yozilgan',
      addHead: (m, n, r) => 'Yig‘indi: n so‘z m so‘zning o‘ng tomoniga yozilgan, tayoqchalar ' + m + ' + ' + n + ' = ' + r + '. Qadamma-qadam (tayoqchalar soni): ',
      mulHead: (m, n, r) => 'Ko‘paytma: m so‘z ' + n + ' marta takrorlangan, tayoqchalar ' + m + ' · ' + n + ' = ' + r + '. Qadamma-qadam (tayoqchalar soni): ',
      addBase: (m) => 'm ⊕ 0* = m (' + m + ')',
      addStep: (k, prev, r) => 'm ⊕ ' + k + ' = (m ⊕ ' + (k - 1) + ')| = ' + prev + ' + 1 = ' + r,
      mulBase: 'm ⊙ 0* = 0* (0)',
      mulStep: (k, prev, m, r) => 'm ⊙ ' + k + ' = (m ⊙ ' + (k - 1) + ') ⊕ m = ' + prev + ' + ' + m + ' = ' + r,
      a: '(a) $0 \\in A$',
      b: '(b) $n \\in A \\Rightarrow n + 1 \\in A$',
      full: '$A$ — butun kesma',
      yes: 'ha',
      no: 'yo‘q',
      run: 'Boshlash',
      stop: 'To‘xtatish',
      pre: { all: 'Hammasi', noBase: 'Bazasiz', gap: 'Uzilish', even: 'Juftlar' },
      aria2: '0 dan 15 gacha sonlar; ko‘k kataklar — A to‘plam elementlari',
      cell: (k, on) => k + (on ? ' — A da' : ' — A da emas'),
      okAll: '(a) va (b) bajarilgan — VII aksiomaga ko‘ra A barcha sonlarni o‘z ichiga oladi. «Boshlash» barcha toshlarni yiqitadi.',
      noA: '(a) buzilgan: 0 A ga kirmaydi. Qadam to‘g‘ri bo‘lishi mumkin (masalan, A = {n | n ≥ 3} uchun), lekin zanjir boshlanmaydi.',
      noB: (k) => '(b) buzilgan: ' + k + ' ∈ A, lekin ' + (k + 1) + ' ∉ A. Noldan boshlangan to‘lqin ' + (k + 1) + ' sonida to‘xtaydi.',
      wave: (k) => 'Noldan boshlangan to‘lqin ' + k + ' soniga yetdi. ',
      waveAll: 'Noldan boshlangan to‘lqin butun kesmadan o‘tdi. ',
      hint2: 'Sonni A ga qo‘shish yoki chiqarish uchun katakni bosing.',
    },
  });

  /* ---------- Рисунок 1: слова из палочек ---------- */

  /** Шаги вычисления по рекурсии (аксиомы III–IV и V–VI в модели N*): массив строк. */
  function steps(op, m, n) {
    const out = [];
    if (op === 'add') {
      out.push(T.addBase(m));
      for (let k = 1; k <= n; k++) out.push(T.addStep(k, m + k - 1, m + k));
    } else {
      out.push(T.mulBase);
      for (let k = 1; k <= n; k++) out.push(T.mulStep(k, m * (k - 1), m, m * k));
    }
    return out;
  }

  MC.widget('stick-words', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { m: cfg.m != null ? cfg.m : 2, n: cfg.n != null ? cfg.n : 3, op: cfg.op || 'add' };
    const opSeg = F.seg([{ value: 'add', label: '$m \\oplus n$' }, { value: 'mul', label: '$m \\odot n$' }], st.op, (v) => {
      st.op = v;
      draw();
    }, T.op);
    const mS = F.slider({ label: T.m, min: 0, max: 6, step: 1, value: st.m, fmt: (v) => T.sticks(Math.round(v)), oninput: (v) => {
      st.m = Math.round(v);
      draw();
    } });
    const nS = F.slider({ label: T.n, min: 0, max: 6, step: 1, value: st.n, fmt: (v) => T.sticks(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      draw();
    } });
    fig.controls.append(opSeg.el, mS.el, nS.el);
    const ro = F.readout(fig.readout, [
      { key: 'm', label: T.inM },
      { key: 'n', label: T.inN },
      { key: 'r', label: T.inR },
    ]);

    let svg = null;
    function draw() {
      const { m, n, op } = st;
      const X0 = 92;
      const dx = 13;
      const gap = 10;
      const rowH = 64;
      // результат: список палочек [x-смещение, цвет]
      const res = [];
      let x = 0;
      if (op === 'add') {
        for (let i = 0; i < m; i++, x += dx) res.push([x, 'var(--accent)']);
        if (m && n) x += 4;
        for (let i = 0; i < n; i++, x += dx) res.push([x, 'var(--warm)']);
      } else {
        for (let c = 0; c < n; c++) {
          for (let i = 0; i < m; i++, x += dx) res.push([x, 'var(--accent)']);
          if (m) x += gap;
        }
      }
      const W = Math.max(X0 + Math.max(x, 6 * dx) + 24, 320);
      const H = rowH * 3 + 12;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria1 });
      svg.style.maxWidth = W + 'px';
      svg.style.width = '100%';
      const label = (y, txt) => svg.appendChild(S('text', { class: 'cv corner', x: X0 / 2, y }, txt));
      const stick = (sx, y, color, under) => {
        const ln = S('line', { x1: sx, y1: y - 18, x2: sx, y2: y + 18 });
        ln.style.stroke = color;
        ln.style.strokeWidth = '3';
        ln.style.strokeLinecap = 'round';
        svg.appendChild(ln);
        if (under) {
          const u = S('line', { x1: sx - 5, y1: y + 25, x2: sx + 5, y2: y + 25 });
          u.style.stroke = 'var(--fg4)';
          u.style.strokeWidth = '1.5';
          svg.appendChild(u);
        }
      };
      const empty = (y) => svg.appendChild(S('text', { class: 'cv ch', x: X0 + 18, y }, '0*'));
      const y1 = rowH / 2 + 4;
      const y2 = y1 + rowH;
      const y3 = y2 + rowH;
      label(y1, 'm');
      label(y2, 'n');
      label(y3, op === 'add' ? 'm ⊕ n' : 'm ⊙ n');
      if (m) for (let i = 0; i < m; i++) stick(X0 + 6 + i * dx, y1, 'var(--accent)');
      else empty(y1);
      if (n) for (let i = 0; i < n; i++) stick(X0 + 6 + i * dx, y2, 'var(--warm)');
      else empty(y2);
      const sep = S('line', { x1: X0 - 10, y1: y2 + rowH / 2 - 2, x2: W - 10, y2: y2 + rowH / 2 - 2 });
      sep.style.stroke = 'var(--line)';
      svg.appendChild(sep);
      if (res.length) res.forEach(([sx, col]) => stick(X0 + 6 + sx, y3, col));
      else empty(y3);
      fig.plot.appendChild(svg);
      const r = op === 'add' ? m + n : m * n;
      ro.set('m', String(m));
      ro.set('n', String(n));
      ro.set('r', String(r), 'accent');
      fig.note.textContent = (op === 'add' ? T.addHead(m, n, r) : T.mulHead(m, n, r)) + steps(op, m, n).join('; ') + '.';
    }
    draw();
  });

  /* ---------- Рисунок 2: аксиома индукции на отрезке 0…15 ---------- */
  const N = 16;
  const PRE = {
    all: () => true,
    noBase: (k) => k >= 3,
    gap: (k) => k !== 6,
    even: (k) => k % 2 === 0,
  };

  /** Условия аксиомы VII на отрезке: base — 0 ∈ A; brk — первое n ≤ 14 с n ∈ A, n + 1 ∉ A (или −1); reach — докуда дошла волна. */
  function analyse(A) {
    const base = !!A[0];
    let brk = -1;
    for (let k = 0; k < N - 1; k++) if (A[k] && !A[k + 1]) { brk = k; break; }
    let reach = -1;
    while (reach + 1 < N && A[reach + 1]) reach++;
    return { base, brk, reach, full: A.every(Boolean) };
  }

  MC.widget('induction-run', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { A: [], wave: -1 };
    const fill = (f) => {
      st.A = [];
      for (let k = 0; k < N; k++) st.A.push(f(k) ? 1 : 0);
      st.wave = -1;
    };
    fill(PRE[cfg.preset || 'all']);
    const pl = F.player(() => {
      if (st.wave + 1 < N && st.A[st.wave + 1]) {
        st.wave++;
        draw();
        return true;
      }
      draw();
      return false;
    }, { interval: 220, onchange: (on) => { runBtn.textContent = on ? T.stop : T.run; } });
    const runBtn = F.button(null, T.run, () => {
      if (!pl.playing()) {
        st.wave = -1;
        draw();
      }
      pl.toggle();
    });
    const row = MC.h('div', { class: 'row' }, runBtn, ...Object.keys(PRE).map((k) => F.button(null, T.pre[k], () => {
      pl.pause();
      fill(PRE[k]);
      draw();
    })));
    fig.controls.append(row);
    const ro = F.readout(fig.readout, [
      { key: 'a', label: T.a },
      { key: 'b', label: T.b },
      { key: 'f', label: T.full },
    ]);

    let svg = null;
    function draw() {
      const C = 52;
      const cols = 8;
      const W = C * cols;
      const H = C * 2;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria2 });
      svg.style.maxWidth = W + 'px';
      svg.style.width = '100%';
      for (let k = 0; k < N; k++) {
        const cx = C * (k % cols);
        const cy = C * Math.floor(k / cols);
        const on = !!st.A[k];
        const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cell(k, on) });
        const r = S('rect', { class: 'cell' + (k <= st.wave ? ' on' : ''), x: cx + 3, y: cy + 3, width: C - 6, height: C - 6, rx: 4 });
        if (on) r.style.fill = k <= st.wave ? 'var(--accent)' : 'var(--accent-soft)';
        g.appendChild(r);
        const t = S('text', { class: 'cv', x: cx + C / 2, y: cy + C / 2 }, String(k));
        if (on) t.style.fill = k <= st.wave ? 'var(--bg)' : 'var(--accent)';
        g.appendChild(t);
        const flip = () => {
          pl.pause();
          st.A[k] = on ? 0 : 1;
          st.wave = -1;
          draw();
        };
        g.addEventListener('click', flip);
        g.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            flip();
          }
        });
        svg.appendChild(g);
      }
      fig.plot.appendChild(svg);
      const a = analyse(st.A);
      ro.set('a', a.base ? T.yes : T.no, a.base ? 'accent' : 'warm');
      ro.set('b', a.brk < 0 ? T.yes : T.no, a.brk < 0 ? 'accent' : 'warm');
      ro.set('f', a.full ? T.yes : T.no, a.full ? 'accent' : 'warm');
      let s = '';
      if (st.wave >= 0) s += st.wave === N - 1 ? T.waveAll : T.wave(st.wave);
      if (!a.base) s += T.noA + ' ';
      else if (a.brk >= 0) s += T.noB(a.brk) + ' ';
      else if (a.full) s += T.okAll + ' ';
      fig.note.textContent = s + T.hint2;
    }
    draw();
  });

  if (typeof module !== 'undefined') module.exports = { steps, analyse, PRE };
})();
