/* Урок 7.31 «Определители» (Куликов, гл. 6, § 4):
 * рисунок 1 «Определитель 3 × 3 по подстановкам» — шесть слагаемых суммы по S_3, клетки a_{kτ(k)}, знак и
 * накопленная сумма; рисунок 2 «Определитель 2 × 2 как площадь со знаком» — параллелограмм на столбцах,
 * перестановка столбцов (свойство 4.2), умножение столбца (4.4), прибавление кратного другого столбца (4.6). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  const minus = (s) => String(s).replace(/-/g, '−');
  const num = (v) => minus(String(v));

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Определитель $3 \\times 3$ как сумма по подстановкам $S_3$',
      t2: 'Определитель $2 \\times 2$ как площадь со знаком',
      aria1: 'Матрица 3 на 3: выделены клетки, которые выбирает текущая подстановка',
      aria2: 'Векторы-столбцы матрицы и натянутый на них параллелограмм',
      preset: 'Матрица',
      ex: (k) => 'пример ' + k,
      back: 'Назад', next: 'Дальше', reset: 'Сначала',
      stepNo: 'шаг', perm: 'подстановка $\\tau$', sign: 'знак', term: 'слагаемое', sum: 'сумма',
      even: 'чётная', odd: 'нечётная',
      start: 'Нажмите «Дальше»: по очереди переберём все 6 подстановок $S_3$. Сначала три чётные (знак +), потом три нечётные (знак −).',
      stepMsg: (perm, par, sg, prod, val, sum) => 'τ = ' + perm + ' — ' + par + ', знак ' + sg + '. Слагаемое: ' + sg + prod + ' = ' + val + '. Сумма пока: ' + sum + '.',
      done: (d) => 'Все 6 слагаемых сложены: определитель равен ' + d + '.',
      doneZero: 'Все 6 слагаемых сложены: определитель равен 0. Строки 1 и 3 одинаковы, поэтому слагаемые сокращаются парами (свойство 4.3).',
      swap: 'Поменять столбцы',
      dbl: 'Умножить $A^1$ на 2',
      lam: 'к $A^1$ прибавить $\\lambda A^2$',
      det: '$\\det$', area: 'площадь', orient: 'ориентация',
      pos: 'против часовой', neg: 'по часовой', zero: 'векторы коллинеарны',
      note: (d, sw, db, l) => 'det = ' + d + '. ' + (sw ? 'Столбцы переставлены — знак сменился (свойство 4.2). ' : '') + (db ? 'Первый столбец умножен на 2 — определитель удвоился (свойство 4.4). ' : '') + (l !== 0 ? 'Прибавление λA² к первому столбцу сдвигает параллелограмм вдоль A², но не меняет определитель (свойство 4.6). ' : ''),
      noteZero: 'Столбцы коллинеарны (линейно зависимы), параллелограмм вырожден: определитель равен 0 (свойство 4.7).',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'A $3 \\times 3$ determinant as a sum over the permutations $S_3$',
      t2: 'A $2 \\times 2$ determinant as a signed area',
      aria1: 'A 3 by 3 matrix: the cells chosen by the current permutation are highlighted',
      aria2: 'The column vectors of the matrix and the parallelogram they span',
      preset: 'Matrix',
      ex: (k) => 'example ' + k,
      back: 'Back', next: 'Next', reset: 'Restart',
      stepNo: 'step', perm: 'permutation $\\tau$', sign: 'sign', term: 'term', sum: 'sum',
      even: 'even', odd: 'odd',
      start: 'Press “Next”: we go through all 6 permutations of $S_3$. First the three even ones (sign +), then the three odd ones (sign −).',
      stepMsg: (perm, par, sg, prod, val, sum) => 'τ = ' + perm + ' — ' + par + ', sign ' + sg + '. Term: ' + sg + prod + ' = ' + val + '. Sum so far: ' + sum + '.',
      done: (d) => 'All 6 terms are added: the determinant equals ' + d + '.',
      doneZero: 'All 6 terms are added: the determinant equals 0. Rows 1 and 3 are equal, so the terms cancel in pairs (property 4.3).',
      swap: 'Swap columns',
      dbl: 'Multiply $A^1$ by 2',
      lam: 'add $\\lambda A^2$ to $A^1$',
      det: '$\\det$', area: 'area', orient: 'orientation',
      pos: 'counterclockwise', neg: 'clockwise', zero: 'collinear vectors',
      note: (d, sw, db, l) => 'det = ' + d + '. ' + (sw ? 'The columns are swapped — the sign changed (property 4.2). ' : '') + (db ? 'The first column is doubled — the determinant doubled (property 4.4). ' : '') + (l !== 0 ? 'Adding λA² to the first column shears the parallelogram along A² but does not change the determinant (property 4.6). ' : ''),
      noteZero: 'The columns are collinear (linearly dependent) and the parallelogram is degenerate: the determinant is 0 (property 4.7).',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: '$3 \\times 3$ determinant $S_3$ o‘rniga qo‘yishlar bo‘yicha yig‘indi sifatida',
      t2: '$2 \\times 2$ determinant ishorali yuz sifatida',
      aria1: '3 ga 3 matritsa: joriy o‘rniga qo‘yish tanlagan kataklar ajratilgan',
      aria2: 'Matritsa ustun-vektorlari va ularga tortilgan parallelogramm',
      preset: 'Matritsa',
      ex: (k) => k + '-misol',
      back: 'Orqaga', next: 'Keyingi', reset: 'Boshidan',
      stepNo: 'qadam', perm: 'o‘rniga qo‘yish $\\tau$', sign: 'ishora', term: 'qo‘shiluvchi', sum: 'yig‘indi',
      even: 'juft', odd: 'toq',
      start: '«Keyingi» tugmasini bosing: $S_3$ ning barcha 6 ta o‘rniga qo‘yishini ko‘rib chiqamiz. Avval uchta juft (ishora +), keyin uchta toq (ishora −).',
      stepMsg: (perm, par, sg, prod, val, sum) => 'τ = ' + perm + ' — ' + par + ', ishora ' + sg + '. Qo‘shiluvchi: ' + sg + prod + ' = ' + val + '. Hozirgi yig‘indi: ' + sum + '.',
      done: (d) => 'Barcha 6 qo‘shiluvchi qo‘shildi: determinant ' + d + ' ga teng.',
      doneZero: 'Barcha 6 qo‘shiluvchi qo‘shildi: determinant 0 ga teng. 1- va 3-satrlar bir xil, shuning uchun qo‘shiluvchilar juft-juft qisqaradi (4.3-xossa).',
      swap: 'Ustunlarni almashtirish',
      dbl: '$A^1$ ni 2 ga ko‘paytirish',
      lam: '$A^1$ ga $\\lambda A^2$ qo‘shish',
      det: '$\\det$', area: 'yuz', orient: 'yo‘nalish',
      pos: 'soat miliga teskari', neg: 'soat mili bo‘yicha', zero: 'vektorlar kollinear',
      note: (d, sw, db, l) => 'det = ' + d + '. ' + (sw ? 'Ustunlar almashtirildi — ishora o‘zgardi (4.2-xossa). ' : '') + (db ? 'Birinchi ustun 2 ga ko‘paytirildi — determinant ikki barobar oshdi (4.4-xossa). ' : '') + (l !== 0 ? 'Birinchi ustunga λA² qo‘shish parallelogrammni A² bo‘ylab siljitadi, lekin determinantni o‘zgartirmaydi (4.6-xossa). ' : ''),
      noteZero: 'Ustunlar kollinear (chiziqli bog‘liq), parallelogramm aynigan: determinant 0 ga teng (4.7-xossa).',
    },
  });

  /* ---------------------- Рисунок 1: шесть слагаемых ---------------------- */
  const PRESETS = {
    a: [[2, 1, 3], [0, 4, 1], [5, 2, 0]],
    b: [[1, 2, 3], [4, 5, 6], [7, 8, 10]],
    c: [[1, 2, 3], [4, 5, 6], [1, 2, 3]],
  };
  // порядок слагаемых — как в формуле книги для n = 3 (с. 227): τ(1), τ(2), τ(3) (номера столбцов, с нуля)
  const PERMS = [
    { p: [0, 1, 2], s: 1 },
    { p: [2, 0, 1], s: 1 },
    { p: [1, 2, 0], s: 1 },
    { p: [2, 1, 0], s: -1 },
    { p: [0, 2, 1], s: -1 },
    { p: [1, 0, 2], s: -1 },
  ];
  const permText = (p) => '(1 2 3 → ' + p.map((c) => c + 1).join(' ') + ')';

  MC.widget('det-terms', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { p: PRESETS[cfg.preset] ? cfg.preset : 'a', k: 0 };
    const pSeg = F.seg(Object.keys(PRESETS).map((key, i) => ({ value: key, label: T.ex(i + 1) })), st.p, (v) => {
      st.p = v;
      st.k = 0;
      draw();
    }, T.preset);
    const bBack = F.button('back', T.back, () => go(-1));
    const bNext = F.button('step', T.next, () => go(1));
    const bReset = F.button('reset', T.reset, () => {
      st.k = 0;
      draw();
    });
    const btns = MC.h('div', { class: 'fig-buttons' }, bBack, bNext, bReset);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(pSeg.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.stepNo },
      { key: 'perm', label: T.perm },
      { key: 'sign', label: T.sign },
      { key: 'term', label: T.term },
      { key: 'sum', label: T.sum },
    ]);
    let svg = null;

    function go(d) {
      st.k = U.clamp(st.k + d, 0, PERMS.length);
      draw();
    }
    const termOf = (M, t) => t.s * t.p.reduce((acc, c, r) => acc * M[r][c], 1);

    function draw() {
      const M = PRESETS[st.p];
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(70, Math.floor((W - 40) / 3));
      const H = C * 3;
      const w = C * 3 + 28;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + (H + 8), role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const x0 = 14;
      const y0 = 4;
      const cur = st.k > 0 ? PERMS[st.k - 1] : null;
      const br = (x, dir) => svg.appendChild(S('path', { d: 'M' + (x + dir * 7) + ' ' + y0 + ' H' + x + ' V' + (y0 + H) + ' H' + (x + dir * 7), class: 'leg' }));
      br(x0 - 2, 1);
      br(x0 + C * 3 + 2, -1);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const cx = x0 + C * j + C / 2;
          const cy = y0 + C * i + C / 2;
          const on = cur && cur.p[i] === j;
          if (on) {
            svg.appendChild(S('rect', { x: x0 + C * j + 3, y: y0 + C * i + 3, width: C - 6, height: C - 6, rx: 4, style: 'fill: ' + (cur.s > 0 ? 'var(--accent-soft)' : 'var(--warm-soft)') + '; stroke: ' + (cur.s > 0 ? 'var(--accent)' : 'var(--warm)') + '; stroke-width: 1.5' }));
          }
          const t = S('text', { class: 'cv', x: cx, y: cy }, num(M[i][j]));
          t.style.fontSize = Math.round(C * 0.34) + 'px';
          if (on) t.style.fill = cur.s > 0 ? 'var(--accent)' : 'var(--warm)';
          svg.appendChild(t);
        }
      }
      fig.plot.appendChild(svg);
      let sum = 0;
      for (let q = 0; q < st.k; q++) sum += termOf(M, PERMS[q]);
      ro.set('k', st.k + ' / 6');
      if (cur) {
        const val = termOf(M, cur);
        const prod = cur.p.map((c, r) => (M[r][c] < 0 ? '(' + num(M[r][c]) + ')' : num(M[r][c]))).join('·');
        const sg = cur.s > 0 ? '+' : '−';
        ro.set('perm', permText(cur.p));
        ro.set('sign', sg + '1', cur.s > 0 ? 'accent' : 'warm');
        ro.set('term', num(val));
        fig.note.className = 'fig-note' + (st.k === PERMS.length ? ' ok' : '');
        let msg = T.stepMsg(permText(cur.p), cur.s > 0 ? T.even : T.odd, sg, prod, num(val), num(sum));
        if (st.k === PERMS.length) msg += ' ' + (sum === 0 && st.p === 'c' ? T.doneZero : T.done(num(sum)));
        fig.note.replaceChildren(F.rich(msg));
      } else {
        ro.set('perm', '—');
        ro.set('sign', '—');
        ro.set('term', '—');
        fig.note.className = 'fig-note';
        fig.note.replaceChildren(F.rich(T.start));
      }
      ro.set('sum', num(sum), st.k === PERMS.length ? 'accent' : '');
      bBack.disabled = st.k === 0;
      bNext.disabled = st.k === PERMS.length;
    }
    draw();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });

  /* ---------------------- Рисунок 2: площадь со знаком ---------------------- */
  MC.widget('det-area', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { a11: 3, a21: 1, a12: 1, a22: 2, lam: 0, swap: false, dbl: false };
    const mk = (key, label) => F.slider({ label, min: -2, max: 3, step: 0.5, value: st[key], fmt: (v) => U.fmt(v, 1), oninput: (v) => {
      st[key] = v;
      draw();
    } });
    const s11 = mk('a11', '$\\alpha_{11}$');
    const s21 = mk('a21', '$\\alpha_{21}$');
    const s12 = mk('a12', '$\\alpha_{12}$');
    const s22 = mk('a22', '$\\alpha_{22}$');
    const sl = F.slider({ label: T.lam, min: -1, max: 1, step: 0.25, value: 0, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.lam = v;
      draw();
    } });
    const cSwap = F.check(T.swap, false, (v) => {
      st.swap = v;
      draw();
    });
    const cDbl = F.check(T.dbl, false, (v) => {
      st.dbl = v;
      draw();
    });
    fig.controls.append(s11.el, s21.el, s12.el, s22.el, sl.el, cSwap.el, cDbl.el);
    const ro = F.readout(fig.readout, [
      { key: 'm', label: 'A' },
      { key: 'det', label: T.det },
      { key: 'area', label: T.area },
      { key: 'or', label: T.orient },
    ]);
    let p = null;
    let lastKey = '';

    function cols() {
      let u = [st.a11, st.a21];
      let v = [st.a12, st.a22];
      if (st.swap) [u, v] = [v, u];
      // порядок как в подписи: сначала прибавление λA², потом умножение A¹ на 2
      u = [u[0] + st.lam * v[0], u[1] + st.lam * v[1]];
      if (st.dbl) u = [2 * u[0], 2 * u[1]];
      return [u, v];
    }
    function build(R) {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
      const key = W + ':' + R;
      if (key === lastKey && p) return;
      lastKey = key;
      fig.plot.replaceChildren();
      const h = Math.round(W * (W < 500 ? 0.9 : 0.62));
      const ry = (R * h) / W;
      p = new MC.Plot(fig.plot, { width: W, height: h, x: [-R, R], y: [-ry, ry], equal: true, label: T.aria2 });
      p.axes({ xLabel: 'x', yLabel: 'y' });
    }
    const r2 = (x) => Math.round(x * 100) / 100;
    function draw() {
      const [u, v] = cols();
      const ext = Math.max(Math.abs(u[0]), Math.abs(u[1]), Math.abs(v[0]), Math.abs(v[1]), Math.abs(u[0] + v[0]), Math.abs(u[1] + v[1]));
      const R = Math.max(5, Math.ceil(ext * 1.1) + 1);
      build(R);
      p.clear();
      const d = r2(u[0] * v[1] - u[1] * v[0]);
      const quad = [[0, 0], u, [u[0] + v[0], u[1] + v[1]], v];
      p.polygon(quad, d < 0 ? 'area warm' : 'area');
      p.path([...quad, [0, 0]], 'curve faint');
      p.arrow(0, 0, u[0], u[1], 'accent');
      p.arrow(0, 0, v[0], v[1], 'warm');
      p.text(u[0], u[1], 'A¹', 'lbl accent', { dx: 8, dy: -8 });
      p.text(v[0], v[1], 'A²', 'lbl warm', { dx: 8, dy: -8 });
      ro.set('m', '[' + U.fmt(r2(u[0]), 2) + '  ' + U.fmt(r2(v[0]), 2) + ' ; ' + U.fmt(r2(u[1]), 2) + '  ' + U.fmt(r2(v[1]), 2) + ']');
      ro.set('det', U.fmt(d, 2), d < 0 ? 'warm' : d > 0 ? 'accent' : '');
      ro.set('area', U.fmt(Math.abs(d), 2));
      ro.set('or', d > 0 ? T.pos : d < 0 ? T.neg : T.zero);
      fig.note.className = 'fig-note' + (d === 0 ? ' ok' : '');
      fig.note.textContent = d === 0 ? T.noteZero : T.note(U.fmt(d, 2), st.swap, st.dbl, st.lam);
    }
    draw();
    window.addEventListener('resize', draw);
  });
})();
