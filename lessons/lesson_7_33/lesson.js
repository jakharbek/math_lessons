/* Урок 7.33 «Теоремы о матрицах. Правило Крамера» (Куликов, гл. 6, § 6):
 * рисунок 1 «Присоединенная матрица по клеткам» — вычёркивание строки и столбца, минор, дополнение,
 * затем AA* = |A|E и A⁻¹ = |A|⁻¹A* (теорема 6.2); рисунок 2 «Правило Крамера по шагам» — |A|, матрицы A(k)
 * с заменённым столбцом, x_k = |A(k)|/|A| (теорема 6.4). Вся арифметика — точные дроби. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  /* ---------------------------- точные дроби ---------------------------- */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const fr = (n, d = 1) => {
    if (d < 0) [n, d] = [-n, -d];
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };
  const add = (a, b) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
  const mul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const div = (a, b) => fr(a.n * b.d, a.d * b.n);
  const isZero = (a) => a.n === 0;
  const show = (a) => (a.d === 1 ? String(a.n) : a.n + '/' + a.d).replace('-', '−');
  const toFr = (M) => M.map((r) => r.map((x) => fr(x)));
  const copy = (M) => M.map((r) => r.slice());

  /** Определитель разложением по первой строке (матрицы до 4 × 4). */
  function det(M) {
    const n = M.length;
    if (n === 0) return fr(1);
    if (n === 1) return M[0][0];
    let s = fr(0);
    for (let j = 0; j < n; j++) {
      if (isZero(M[0][j])) continue;
      const t = mul(M[0][j], det(minorOf(M, 0, j)));
      s = add(s, j % 2 ? fr(-t.n, t.d) : t);
    }
    return s;
  }
  /** Матрица без строки r и столбца c. */
  const minorOf = (M, r, c) => M.filter((_, i) => i !== r).map((row) => row.filter((_, j) => j !== c));
  function mmul(A, B) {
    return A.map((row) => B[0].map((_, k) => row.reduce((s, x, j) => add(s, mul(x, B[j][k])), fr(0))));
  }

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Присоединенная матрица по клеткам',
      t2: 'Правило Крамера по шагам',
      aria1: 'Матрица A с вычеркнутыми строкой и столбцом и заполняемая присоединенная матрица',
      aria2: 'Матрица системы с подсвеченным заменённым столбцом',
      preset: 'Матрица', system: 'Система',
      ex: (k) => 'пример ' + k,
      back: 'Назад', step: 'Шаг', reset: 'Сначала',
      stepNo: 'шаг', detA: '|A|', cell: 'клетка', value: 'значение',
      start: 'Исходная матрица A. Нажмите «Шаг»: клетки A* заполняются по строкам.',
      cellMsg: (i, k, sgn, m, v) => 'Клетка (' + i + ', ' + k + ') матрицы A*: это A' + k + i + ' — вычёркиваем строку ' + k + ' и столбец ' + i + ' матрицы A. Минор M' + k + i + ' = ' + m + ', знак (−1)^' + (k + i) + ' = ' + sgn + ', A' + k + i + ' = ' + v + '.',
      doneInv: (d, inv) => 'A* заполнена. Произведение AA* = ' + d + '·E (теоремы 5.3 и 5.4). Так как |A| = ' + d + ' ≠ 0, A⁻¹ = |A|⁻¹A* = ' + inv + ' (теорема 6.2).',
      doneSing: 'A* заполнена. |A| = 0, поэтому AA* — нулевая матрица; обратной нет. Столбцы A* — решения однородной системы AX = 0.',
      lA: 'A', lAs: 'A*', lP: 'AA*',
      s0: 'Система записана как A | b. Нажмите «Шаг»: сначала определитель системы.',
      sDet: (d) => 'Определитель системы |A| = ' + d + ' ≠ 0 — правило Крамера применимо.',
      sSing: 'Определитель системы |A| = 0: правило Крамера неприменимо. Система либо несовместна, либо имеет бесконечно много решений — исследуйте её методом Гаусса.',
      sK: (k, d) => 'A(' + k + '): столбец ' + k + ' заменён столбцом свободных членов. |A(' + k + ')| = ' + d + '.',
      sDone: (xs, ok) => 'Решение: ' + xs + '. Проверка подстановкой: ' + (ok ? 'все уравнения выполнены.' : 'ошибка!'),
      sys: { a: '2 × 2', b: '3 × 3', c: '|A| = 0' },
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'The adjugate matrix cell by cell',
      t2: 'Cramer’s rule step by step',
      aria1: 'Matrix A with a row and a column struck out, and the adjugate being filled in',
      aria2: 'The system matrix with the replaced column highlighted',
      preset: 'Matrix', system: 'System',
      ex: (k) => 'example ' + k,
      back: 'Back', step: 'Step', reset: 'Restart',
      stepNo: 'step', detA: '|A|', cell: 'cell', value: 'value',
      start: 'The original matrix A. Press “Step”: the cells of A* are filled row by row.',
      cellMsg: (i, k, sgn, m, v) => 'Cell (' + i + ', ' + k + ') of A*: this is A' + k + i + ' — strike out row ' + k + ' and column ' + i + ' of A. Minor M' + k + i + ' = ' + m + ', sign (−1)^' + (k + i) + ' = ' + sgn + ', A' + k + i + ' = ' + v + '.',
      doneInv: (d, inv) => 'A* is complete. The product AA* = ' + d + '·E (theorems 5.3 and 5.4). Since |A| = ' + d + ' ≠ 0, A⁻¹ = |A|⁻¹A* = ' + inv + ' (theorem 6.2).',
      doneSing: 'A* is complete. |A| = 0, so AA* is the zero matrix; there is no inverse. The columns of A* solve the homogeneous system AX = 0.',
      lA: 'A', lAs: 'A*', lP: 'AA*',
      s0: 'The system is written as A | b. Press “Step”: first the determinant of the system.',
      sDet: (d) => 'The determinant of the system |A| = ' + d + ' ≠ 0 — Cramer’s rule applies.',
      sSing: 'The determinant of the system |A| = 0: Cramer’s rule does not apply. The system is either inconsistent or has infinitely many solutions — use Gaussian elimination.',
      sK: (k, d) => 'A(' + k + '): column ' + k + ' is replaced by the column of constants. |A(' + k + ')| = ' + d + '.',
      sDone: (xs, ok) => 'Solution: ' + xs + '. Check by substitution: ' + (ok ? 'all equations hold.' : 'error!'),
      sys: { a: '2 × 2', b: '3 × 3', c: '|A| = 0' },
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Biriktirilgan matritsa katakma-katak',
      t2: 'Kramer qoidasi qadam-baqadam',
      aria1: 'Satri va ustuni o‘chirilgan A matritsa va to‘ldirilayotgan biriktirilgan matritsa',
      aria2: 'Almashtirilgan ustuni ajratilgan sistema matritsasi',
      preset: 'Matritsa', system: 'Sistema',
      ex: (k) => k + '-misol',
      back: 'Orqaga', step: 'Qadam', reset: 'Boshidan',
      stepNo: 'qadam', detA: '|A|', cell: 'katak', value: 'qiymat',
      start: 'Boshlang‘ich A matritsa. «Qadam» tugmasini bosing: A* kataklari satrma-satr to‘ldiriladi.',
      cellMsg: (i, k, sgn, m, v) => 'A* ning (' + i + ', ' + k + ') katagi: bu A' + k + i + ' — A ning ' + k + '-satri va ' + i + '-ustuni o‘chiriladi. Minor M' + k + i + ' = ' + m + ', ishora (−1)^' + (k + i) + ' = ' + sgn + ', A' + k + i + ' = ' + v + '.',
      doneInv: (d, inv) => 'A* to‘ldirildi. AA* = ' + d + '·E (5.3 va 5.4-teoremalar). |A| = ' + d + ' ≠ 0 bo‘lgani uchun A⁻¹ = |A|⁻¹A* = ' + inv + ' (6.2-teorema).',
      doneSing: 'A* to‘ldirildi. |A| = 0, shuning uchun AA* — nol matritsa; teskari matritsa yo‘q. A* ustunlari AX = 0 bir jinsli sistemaning yechimlari.',
      lA: 'A', lAs: 'A*', lP: 'AA*',
      s0: 'Sistema A | b ko‘rinishida yozilgan. «Qadam» tugmasini bosing: avval sistema determinanti.',
      sDet: (d) => 'Sistema determinanti |A| = ' + d + ' ≠ 0 — Kramer qoidasini qo‘llash mumkin.',
      sSing: 'Sistema determinanti |A| = 0: Kramer qoidasi qo‘llanmaydi. Sistema yo birgalikda emas, yo cheksiz ko‘p yechimga ega — uni Gauss usuli bilan tekshiring.',
      sK: (k, d) => 'A(' + k + '): ' + k + '-ustun ozod hadlar ustuni bilan almashtirilgan. |A(' + k + ')| = ' + d + '.',
      sDone: (xs, ok) => 'Yechim: ' + xs + '. O‘rniga qo‘yib tekshirish: ' + (ok ? 'barcha tenglamalar bajariladi.' : 'xato!'),
      sys: { a: '2 × 2', b: '3 × 3', c: '|A| = 0' },
    },
  });

  /* ------------------------- рисование матрицы в SVG ------------------------- */
  /**
   * Рисует матрицу M (дроби или null — пустая клетка) в группе svg начиная с (x0, y0), клетка C.
   * o: { label, struckRow, struckCol, hlCol, hlCell: [i, k], bar: номер столбца, перед которым черта, det: true — черты вместо скобок }
   */
  function drawMatrix(svg, M, x0, y0, C, o = {}) {
    const m = M.length;
    const n = M[0].length;
    const H = C * m;
    const W = C * n;
    if (o.label) {
      const t = S('text', { class: 'cv', x: x0 + W / 2, y: y0 - 14 }, o.label);
      t.style.fontSize = Math.round(C * 0.3) + 'px';
      t.style.fill = 'var(--fg2)';
      svg.appendChild(t);
    }
    if (o.hlCol != null) svg.appendChild(S('rect', { x: x0 + C * o.hlCol + 2, y: y0, width: C - 4, height: H, rx: 4, style: 'fill: var(--accent-soft)' }));
    if (o.hlCell) svg.appendChild(S('rect', { x: x0 + C * o.hlCell[1] + 2, y: y0 + C * o.hlCell[0] + 2, width: C - 4, height: C - 4, rx: 4, style: 'fill: none; stroke: var(--warm); stroke-width: 2' }));
    if (o.struckRow != null) svg.appendChild(S('rect', { x: x0, y: y0 + C * o.struckRow + 2, width: W, height: C - 4, rx: 4, style: 'fill: var(--warm-soft)' }));
    if (o.struckCol != null) svg.appendChild(S('rect', { x: x0 + C * o.struckCol + 2, y: y0, width: C - 4, height: H, rx: 4, style: 'fill: var(--warm-soft)' }));
    const br = (x, dir) => svg.appendChild(S('path', { d: o.det ? 'M' + x + ' ' + y0 + ' V' + (y0 + H) : 'M' + (x + dir * 7) + ' ' + y0 + ' H' + x + ' V' + (y0 + H) + ' H' + (x + dir * 7), class: 'leg' }));
    br(x0 - 3, 1);
    br(x0 + W + 3, -1);
    if (o.bar != null) svg.appendChild(S('path', { d: 'M' + (x0 + C * o.bar) + ' ' + (y0 + 4) + ' V' + (y0 + H - 4), class: 'leg', style: 'stroke-dasharray: 3 3' }));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const v = M[i][j];
        if (!v) continue;
        const txt = show(v);
        const struck = i === o.struckRow || j === o.struckCol;
        const t = S('text', { class: 'cv', x: x0 + C * j + C / 2, y: y0 + C * i + C / 2 }, txt);
        t.style.fontSize = (txt.length > 4 ? Math.round(C * 0.24) : txt.length > 2 ? Math.round(C * 0.29) : Math.round(C * 0.36)) + 'px';
        if (struck) t.style.fill = 'var(--fg4)';
        if (o.hlCell && o.hlCell[0] === i && o.hlCell[1] === j) t.style.fill = 'var(--warm)';
        if (o.hlCol === j) t.style.fill = 'var(--accent)';
        svg.appendChild(t);
      }
    }
    return { w: W, h: H };
  }

  function stepButtons(go, reset) {
    const bBack = F.button('back', T.back, () => go(-1));
    const bStep = F.button('step', T.step, () => go(1));
    const bReset = F.button('reset', T.reset, reset);
    const el = MC.h('div', { class: 'fig-buttons' }, bBack, bStep, bReset);
    el.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    return { el, bBack, bStep };
  }

  /* ---------------------- Рисунок 1: присоединенная матрица ---------------------- */
  const MATS = {
    a: [[1, 2, 0], [0, 1, 1], [1, 0, 1]],
    b: [[2, 1], [5, 3]],
    c: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  };

  /** Шаги: 0 — исходная; затем по клетке A* (по строкам); последний — итог. Каждый шаг хранит копию A*. */
  function adjSteps(src) {
    const A = toFr(src);
    const n = A.length;
    const d = det(A);
    const adj = A.map((r) => r.map(() => null));
    const out = [{ adj: copy(adj), cell: null }];
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < n; k++) {
        const m = det(minorOf(A, k, i));
        const sgn = (k + i) % 2 ? -1 : 1;
        const v = sgn < 0 ? fr(-m.n, m.d) : m;
        adj[i][k] = v;
        out.push({ adj: copy(adj), cell: [i, k], m, sgn, v });
      }
    }
    out.push({ adj: copy(adj), cell: null, final: true });
    return { A, d, n, list: out };
  }

  MC.widget('adjugate', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { p: MATS[cfg.preset] ? cfg.preset : 'a', k: 0, data: null };
    const pSeg = F.seg(Object.keys(MATS).map((key, i) => ({ value: key, label: T.ex(i + 1) })), st.p, (v) => {
      st.p = v;
      load();
    }, T.preset);
    const btn = stepButtons((dd) => {
      st.k = U.clamp(st.k + dd, 0, st.data.list.length - 1);
      draw();
    }, () => {
      st.k = 0;
      draw();
    });
    fig.controls.append(pSeg.el, btn.el);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.stepNo },
      { key: 'd', label: T.detA },
      { key: 'c', label: T.cell },
      { key: 'v', label: T.value },
    ]);
    let svg = null;

    function load() {
      st.data = adjSteps(MATS[st.p]);
      st.k = 0;
      draw();
    }
    function draw() {
      const { A, d, n, list } = st.data;
      const s = list[st.k];
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const blocks = s.final ? 3 : 2;
      const stack = W < 560;
      const C = stack ? Math.min(58, Math.floor((W - 40) / n)) : Math.min(58, Math.floor((W - 40 - 40 * (blocks - 1)) / (n * blocks)));
      const bw = C * n + 12;
      const top = 28;
      const gap = 40;
      const w = stack ? bw + 16 : blocks * bw + (blocks - 1) * gap + 16;
      const h = stack ? blocks * (C * n + top) + 8 : C * n + top + 8;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const pos = (b) => (stack ? [14, top + b * (C * n + top)] : [14 + b * (bw + gap), top]);
      const c = s.cell;
      // в A вычёркиваются строка k и столбец i для клетки (i, k) матрицы A*
      const [x1, y1] = pos(0);
      drawMatrix(svg, A, x1, y1, C, { label: T.lA, struckRow: c ? c[1] : null, struckCol: c ? c[0] : null });
      const [x2, y2] = pos(1);
      drawMatrix(svg, s.adj, x2, y2, C, { label: T.lAs, hlCell: c });
      if (s.final) {
        const [x3, y3] = pos(2);
        drawMatrix(svg, mmul(A, s.adj), x3, y3, C, { label: T.lP });
      }
      fig.plot.appendChild(svg);
      ro.set('k', st.k + ' / ' + (list.length - 1));
      ro.set('d', show(d), isZero(d) ? 'warm' : 'accent');
      ro.set('c', c ? '(' + (c[0] + 1) + ', ' + (c[1] + 1) + ') → A' + (c[1] + 1) + (c[0] + 1) : '—');
      ro.set('v', c ? show(s.v) : '—');
      fig.note.className = 'fig-note' + (s.final ? (isZero(d) ? ' bad' : ' ok') : '');
      if (st.k === 0) fig.note.textContent = T.start;
      else if (c) fig.note.textContent = T.cellMsg(c[0] + 1, c[1] + 1, s.sgn < 0 ? '−1' : '1', show(s.m), show(s.v));
      else if (isZero(d)) fig.note.textContent = T.doneSing;
      else {
        const inv = '[' + s.adj.map((r) => r.map((x) => show(div(x, d))).join(' ')).join('; ') + ']';
        fig.note.textContent = T.doneInv(show(d), inv);
      }
      btn.bBack.disabled = st.k === 0;
      btn.bStep.disabled = st.k === list.length - 1;
    }
    load();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });

  /* ---------------------- Рисунок 2: правило Крамера ---------------------- */
  const SYS = {
    a: { A: [[2, 1], [1, -1]], b: [5, 1] },
    b: { A: [[1, 1, 1], [0, 2, 5], [2, 5, -1]], b: [6, -4, 27] },
    c: { A: [[1, 1], [2, 2]], b: [2, 4] },
  };

  function cramerSteps(sys) {
    const A = toFr(sys.A);
    const b = sys.b.map((x) => fr(x));
    const n = A.length;
    const d = det(A);
    const out = [{ kind: 'start', M: A.map((r, i) => r.concat([b[i]])), bar: n }];
    out.push({ kind: 'det', M: copy(A), d });
    if (isZero(d)) return { n, d, list: out };
    const dk = [];
    for (let k = 0; k < n; k++) {
      const Ak = A.map((r, i) => r.map((x, j) => (j === k ? b[i] : x)));
      dk.push(det(Ak));
      out.push({ kind: 'k', M: Ak, k, dk: dk[k] });
    }
    const xs = dk.map((v) => div(v, d));
    const ok = A.every((r, i) => {
      const s = r.reduce((acc, x, j) => add(acc, mul(x, xs[j])), fr(0));
      return s.n === b[i].n && s.d === b[i].d;
    });
    out.push({ kind: 'done', M: A.map((r, i) => r.concat([b[i]])), bar: n, xs, ok });
    return { n, d, list: out };
  }

  MC.widget('cramer', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { p: SYS[cfg.preset] ? cfg.preset : 'b', k: 0, data: null };
    const pSeg = F.seg(Object.keys(SYS).map((key) => ({ value: key, label: T.sys[key] })), st.p, (v) => {
      st.p = v;
      load();
    }, T.system);
    const btn = stepButtons((dd) => {
      st.k = U.clamp(st.k + dd, 0, st.data.list.length - 1);
      draw();
    }, () => {
      st.k = 0;
      draw();
    });
    fig.controls.append(pSeg.el, btn.el);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.stepNo },
      { key: 'd', label: T.detA },
      { key: 'x', label: 'x' },
    ]);
    let svg = null;

    function load() {
      st.data = cramerSteps(SYS[st.p]);
      st.k = 0;
      draw();
    }
    function draw() {
      const { n, d, list } = st.data;
      const s = list[st.k];
      const cols = s.M[0].length;
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(62, Math.floor((W - 40) / cols));
      const w = C * cols + 30;
      const h = C * n + 36;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.aria2 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const label = s.kind === 'k' ? 'A(' + (s.k + 1) + ')' : s.kind === 'det' ? '|A|' : 'A | b';
      drawMatrix(svg, s.M, 15, 28, C, { label, hlCol: s.kind === 'k' ? s.k : null, bar: s.bar, det: s.kind === 'det' });
      fig.plot.appendChild(svg);
      ro.set('k', st.k + ' / ' + (list.length - 1));
      ro.set('d', st.k >= 1 ? show(d) : '—', st.k >= 1 ? (isZero(d) ? 'warm' : 'accent') : '');
      fig.note.className = 'fig-note';
      if (s.kind === 'start') {
        fig.note.textContent = T.s0;
        ro.set('x', '—');
      } else if (s.kind === 'det') {
        fig.note.textContent = isZero(d) ? T.sSing : T.sDet(show(d));
        if (isZero(d)) fig.note.className = 'fig-note bad';
        ro.set('x', '—');
      } else if (s.kind === 'k') {
        fig.note.textContent = T.sK(s.k + 1, show(s.dk));
        ro.set('x', 'x' + (s.k + 1) + ' = ' + show(s.dk) + ' / ' + show(d) + ' = ' + show(div(s.dk, d)), 'accent');
      } else {
        const xs = s.xs.map((x, i) => 'x' + (i + 1) + ' = ' + show(x)).join(', ');
        fig.note.textContent = T.sDone(xs, s.ok);
        fig.note.className = 'fig-note ' + (s.ok ? 'ok' : 'bad');
        ro.set('x', '(' + s.xs.map(show).join(U.sep()) + ')', 'accent');
      }
      btn.bBack.disabled = st.k === 0;
      btn.bStep.disabled = st.k === list.length - 1;
    }
    load();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });
})();
