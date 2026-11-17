/* Урок 7.32 «Миноры и алгебраические дополнения. Теоремы об определителях» (Куликов, гл. 6, § 5):
 * рисунок 1 «Разложение определителя по строке или столбцу» — миноры, знаки (−1)^(i+k), слагаемые
 * α·A и их сумма (теорема 5.3), «чужие» дополнения дают 0 (теорема 5.4); рисунок 2 «Определитель
 * произведения как площадь» — параллелограммы столбцов B и AB, |AB| = |A||B| (теорема 5.8). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Разложение определителя по строке или столбцу',
      t2: 'Определитель произведения как площадь',
      aria1: 'Матрица: выбранный ряд подсвечен, строка и столбец текущего элемента вычеркнуты, остаётся минор',
      aria2: 'Единичный квадрат, параллелограмм столбцов матрицы B и параллелограмм столбцов матрицы AB',
      preset: 'Матрица', ex: (k) => 'пример ' + k,
      mode: 'Ряд', row: 'строка', col: 'столбец', num: 'Номер',
      back: 'Назад', next: 'Дальше', alien: 'чужие дополнения',
      el: 'элемент', minor: 'минор', sign: 'знак', cof: 'дополнение', term: 'слагаемое',
      lineName: (row, k) => (row ? k + '-я строка' : k + '-й столбец'),
      sum: (line, s, d) => 'Разложение по ряду «' + line + '»: ' + s + ' = ' + d + ' = |A| (теорема 5.3).',
      sumAlien: (line, other, s) => 'Элементы ряда «' + line + '», дополнения ряда «' + other + '»: ' + s + ' = 0 — теорема 5.4.',
      zero: 'Нулевые элементы можно не считать: их слагаемые равны нулю, поэтому выгодно разлагать по ряду с нулями.',
      single: 'В этом ряду одна ненулевая клетка — по лемме 5.2 определитель равен одному слагаемому.',
      pB: 'Матрица $B$',
      bE: 'E', bS: 'сдвиг', bD: 'растяжение',
      detA: '$|A|$', detB: '$|B|$', detAB: '$|AB|$', prod: '$|A|\\cdot|B|$',
      noteAr: (a, b, ab) => 'Площадь оранжевого параллелограмма (столбцы AB) = |' + ab + '|, синего (столбцы B) = |' + b + '|: отношение равно |det A| = |' + a + '|.',
      orient: 'Знак |AB| отрицательный: отображение A меняет ориентацию (обход вершин — по часовой стрелке).',
      degen: 'det A = 0: строки A пропорциональны, параллелограмм AB схлопнулся в отрезок — теорема 5.9.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Expanding a determinant along a row or a column',
      t2: 'The determinant of a product as an area',
      aria1: 'The matrix: the chosen line is highlighted, the row and column of the current entry are crossed out, the minor remains',
      aria2: 'The unit square, the parallelogram of the columns of B and the parallelogram of the columns of AB',
      preset: 'Matrix', ex: (k) => 'example ' + k,
      mode: 'Line', row: 'row', col: 'column', num: 'Number',
      back: 'Back', next: 'Next', alien: 'alien cofactors',
      el: 'entry', minor: 'minor', sign: 'sign', cof: 'cofactor', term: 'term',
      lineName: (row, k) => (row ? 'row ' + k : 'column ' + k),
      sum: (line, s, d) => 'Expansion along ' + line + ': ' + s + ' = ' + d + ' = |A| (theorem 5.3).',
      sumAlien: (line, other, s) => 'Entries of ' + line + ', cofactors of ' + other + ': ' + s + ' = 0 — theorem 5.4.',
      zero: 'Zero entries need not be computed: their terms vanish, so expand along a line with zeros.',
      single: 'This line has a single non-zero entry — by lemma 5.2 the determinant is a single term.',
      pB: 'Matrix $B$',
      bE: 'E', bS: 'shear', bD: 'stretch',
      detA: '$|A|$', detB: '$|B|$', detAB: '$|AB|$', prod: '$|A|\\cdot|B|$',
      noteAr: (a, b, ab) => 'Area of the orange parallelogram (columns of AB) = |' + ab + '|, of the blue one (columns of B) = |' + b + '|: the ratio is |det A| = |' + a + '|.',
      orient: '|AB| is negative: the map A reverses orientation (the vertices go clockwise).',
      degen: 'det A = 0: the rows of A are proportional and the parallelogram AB collapses to a segment — theorem 5.9.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Determinantni satr yoki ustun bo‘yicha yoyish',
      t2: 'Ko‘paytma determinanti yuza sifatida',
      aria1: 'Matritsa: tanlangan qator ajratilgan, joriy elementning satri va ustuni o‘chirilgan, minor qoladi',
      aria2: 'Birlik kvadrat, B ustunlari parallelogrammi va AB ustunlari parallelogrammi',
      preset: 'Matritsa', ex: (k) => k + '-misol',
      mode: 'Qator', row: 'satr', col: 'ustun', num: 'Raqam',
      back: 'Orqaga', next: 'Keyingi', alien: 'begona to‘ldiruvchilar',
      el: 'element', minor: 'minor', sign: 'ishora', cof: 'to‘ldiruvchi', term: 'qo‘shiluvchi',
      lineName: (row, k) => k + (row ? '-satr' : '-ustun'),
      sum: (line, s, d) => '«' + line + '» bo‘yicha yoyish: ' + s + ' = ' + d + ' = |A| (5.3-teorema).',
      sumAlien: (line, other, s) => '«' + line + '» elementlari, «' + other + '» to‘ldiruvchilari: ' + s + ' = 0 — 5.4-teorema.',
      zero: 'Nol elementlarni hisoblash shart emas: ularning qo‘shiluvchilari nolga teng, shuning uchun nollari ko‘p qator bo‘yicha yoyish qulay.',
      single: 'Bu qatorda bitta nolmas katak — 5.2-lemmaga ko‘ra determinant bitta qo‘shiluvchiga teng.',
      pB: '$B$ matritsa',
      bE: 'E', bS: 'siljish', bD: 'cho‘zish',
      detA: '$|A|$', detB: '$|B|$', detAB: '$|AB|$', prod: '$|A|\\cdot|B|$',
      noteAr: (a, b, ab) => 'To‘q sariq parallelogramm (AB ustunlari) yuzi = |' + ab + '|, ko‘k (B ustunlari) yuzi = |' + b + '|: nisbat |det A| = |' + a + '| ga teng.',
      orient: '|AB| manfiy: A akslantirish orientatsiyani o‘zgartiradi (uchlar soat mili bo‘yicha aylanadi).',
      degen: 'det A = 0: A satrlari proporsional, AB parallelogrammi kesmaga aylandi — 5.9-teorema.',
    },
  });

  const minus = (x) => String(x).replace('-', '−');
  const par = (x) => (x < 0 ? '(' + minus(x) + ')' : minus(x));

  /* --------------------- точный определитель (целые числа) --------------------- */
  const minorOf = (M, i, k) => M.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== k));
  function det(M) {
    const n = M.length;
    if (n === 0) return 1;
    if (n === 1) return M[0][0];
    let s = 0;
    for (let k = 0; k < n; k++) if (M[0][k] !== 0) s += (k % 2 ? -1 : 1) * M[0][k] * det(minorOf(M, 0, k));
    return s;
  }
  const cof = (M, i, k) => ((i + k) % 2 ? -1 : 1) * det(minorOf(M, i, k));

  /* ---------------------- Рисунок 1: разложение по ряду ---------------------- */
  const PRESETS = {
    a: [[2, 1, 3], [0, -1, 4], [1, 2, 5]],
    b: [[1, 2, 0, 3], [0, 4, 1, 0], [2, 0, 0, 1], [1, 1, 0, 2]],
    c: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  };

  MC.widget('cofactor-expand', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { p: PRESETS[cfg.preset] ? cfg.preset : 'a', row: true, line: 0, j: 0, alien: false };
    const M = () => PRESETS[st.p];
    const pSeg = F.seg(Object.keys(PRESETS).map((key, i) => ({ value: key, label: T.ex(i + 1) })), st.p, (v) => {
      st.p = v;
      st.line = 0;
      st.j = 0;
      buildNum();
      draw();
    }, T.preset);
    const mSeg = F.seg([{ value: 'r', label: T.row }, { value: 'c', label: T.col }], 'r', (v) => {
      st.row = v === 'r';
      st.j = 0;
      draw();
    }, T.mode);
    const numBox = MC.h('div');
    let nSeg = null;
    function buildNum() {
      const n = M().length;
      nSeg = F.seg(Array.from({ length: n }, (_, k) => ({ value: k, label: String(k + 1) })), st.line, (v) => {
        st.line = v;
        st.j = 0;
        draw();
      }, T.num);
      numBox.replaceChildren(nSeg.el);
    }
    const bBack = F.button('back', T.back, () => step(-1));
    const bNext = F.button('step', T.next, () => step(1));
    const btns = MC.h('div', { class: 'fig-buttons' }, bBack, bNext);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    const aC = F.check(T.alien, false, (v) => {
      st.alien = v;
      draw();
    });
    fig.controls.append(pSeg.el, mSeg.el, numBox, btns, aC.el);
    const ro = F.readout(fig.readout, [
      { key: 'el', label: T.el },
      { key: 'minor', label: T.minor },
      { key: 'sign', label: T.sign },
      { key: 'cof', label: T.cof },
      { key: 'term', label: T.term },
    ]);
    let svg = null;

    function step(d) {
      const n = M().length;
      st.j = (st.j + d + n) % n;
      draw();
    }
    // позиция (строка, столбец) j-го элемента ряда line
    const pos = (line, j) => (st.row ? [line, j] : [j, line]);

    function draw() {
      const A = M();
      const n = A.length;
      const other = (st.line + 1) % n; // ряд «чужих» дополнений
      const cofLine = st.alien ? other : st.line;
      const [ei, ek] = pos(st.line, st.j); // элемент
      const [ci, ck] = pos(cofLine, st.j); // чьё дополнение
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(70, Math.floor((W - 40) / n));
      const H = C * n;
      const w = C * n + 28;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + (H + 8), role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const x0 = 14;
      const y0 = 4;
      // выбранный ряд элементов
      const lr = st.row ? { x: x0, y: y0 + C * st.line, width: C * n, height: C } : { x: x0 + C * st.line, y: y0, width: C, height: H };
      svg.appendChild(S('rect', Object.assign({ rx: 4, style: 'fill: var(--accent-soft)' }, lr)));
      if (st.alien) {
        const orr = st.row ? { x: x0, y: y0 + C * other, width: C * n, height: C } : { x: x0 + C * other, y: y0, width: C, height: H };
        svg.appendChild(S('rect', Object.assign({ rx: 4, style: 'fill: none; stroke: var(--warm); stroke-width: 1.5; stroke-dasharray: 5 4' }, orr)));
      }
      const br = (x, dir) => svg.appendChild(S('path', { d: 'M' + (x + dir * 7) + ' ' + y0 + ' H' + x + ' V' + (y0 + H) + ' H' + (x + dir * 7), class: 'leg' }));
      br(x0 - 2, 1);
      br(x0 + C * n + 2, -1);
      for (let i = 0; i < n; i++) {
        for (let k = 0; k < n; k++) {
          const cx = x0 + C * k + C / 2;
          const cy = y0 + C * i + C / 2;
          const crossed = i === ci || k === ck;
          if (i === ei && k === ek) svg.appendChild(S('circle', { cx, cy, r: C * 0.36, style: 'fill: none; stroke: var(--accent); stroke-width: 2' }));
          const t = S('text', { class: 'cv' + (crossed && !(i === ei && k === ek) ? ' ch' : ''), x: cx, y: cy }, minus(A[i][k]));
          t.style.fontSize = Math.round(C * 0.34) + 'px';
          if (i === ei && k === ek) t.style.fill = 'var(--accent)';
          svg.appendChild(t);
          // знак (−1)^(i+k) в углу клеток, чьи дополнения берутся
          const inCofLine = st.row ? i === cofLine : k === cofLine;
          if (inCofLine) {
            const sg = S('text', { x: x0 + C * k + C - 6, y: y0 + C * i + 12, style: 'font-size: 12px; fill: var(--warm); text-anchor: end' }, (i + k) % 2 ? '−' : '+');
            svg.appendChild(sg);
          }
        }
      }
      // линии вычеркивания
      svg.appendChild(S('path', { d: 'M' + (x0 + 4) + ' ' + (y0 + C * ci + C / 2) + ' H' + (x0 + C * n - 4), style: 'stroke: var(--warm); stroke-width: 1.5; opacity: .7' }));
      svg.appendChild(S('path', { d: 'M' + (x0 + C * ck + C / 2) + ' ' + (y0 + 4) + ' V' + (y0 + H - 4), style: 'stroke: var(--warm); stroke-width: 1.5; opacity: .7' }));
      fig.plot.appendChild(svg);

      const a = A[ei][ek];
      const m = det(minorOf(A, ci, ck));
      const c = cof(A, ci, ck);
      ro.set('el', 'α' + sub(ei + 1, ek + 1) + ' = ' + minus(a), 'accent');
      ro.set('minor', 'M' + sub(ci + 1, ck + 1) + ' = ' + minus(m));
      ro.set('sign', (ci + ck) % 2 ? '−1' : '+1', 'warm');
      ro.set('cof', 'A' + sub(ci + 1, ck + 1) + ' = ' + minus(c));
      ro.set('term', par(a) + '·' + par(c) + ' = ' + minus(a * c));
      // сумма по ряду
      const parts = [];
      let total = 0;
      let nz = 0;
      for (let j = 0; j < n; j++) {
        const [i1, k1] = pos(st.line, j);
        const [i2, k2] = pos(cofLine, j);
        const x = A[i1][k1];
        const y = cof(A, i2, k2);
        if (x !== 0) nz++;
        total += x * y;
        parts.push(par(x) + '·' + par(y));
      }
      const line = T.lineName(st.row, st.line + 1);
      let msg = st.alien ? T.sumAlien(line, T.lineName(st.row, other + 1), parts.join(' + ')) : T.sum(line, parts.join(' + '), minus(total));
      if (!st.alien && nz === 1) msg += ' ' + T.single;
      else if (!st.alien && nz < n) msg += ' ' + T.zero;
      fig.note.className = 'fig-note ok';
      fig.note.textContent = msg;
    }
    const SUB = '₀₁₂₃₄₅₆₇₈₉';
    function sub(i, k) {
      return String(i).replace(/\d/g, (d) => SUB[d]) + String(k).replace(/\d/g, (d) => SUB[d]);
    }
    buildNum();
    draw();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });

  /* ---------------------- Рисунок 2: |AB| = |A||B| как площадь ---------------------- */
  const BS = {
    e: [[1, 0], [0, 1]],
    s: [[1, 1], [0, 1]],
    d: [[2, 0], [1, 1]],
  };
  const mul2 = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const det2 = (M) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
  const cols = (M) => [[M[0][0], M[1][0]], [M[0][1], M[1][1]]];

  MC.widget('det-area', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { A: [[2, 0.5], [0.5, 1.5]], b: 's' };
    const mk = (i, k, label) => F.slider({ label, min: -2, max: 2, step: 0.5, value: st.A[i][k], fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.A[i][k] = v;
      draw();
    } });
    const s11 = mk(0, 0, '$\\alpha_{11}$');
    const s12 = mk(0, 1, '$\\alpha_{12}$');
    const s21 = mk(1, 0, '$\\alpha_{21}$');
    const s22 = mk(1, 1, '$\\alpha_{22}$');
    const bSeg = F.seg([{ value: 'e', label: T.bE }, { value: 's', label: T.bS }, { value: 'd', label: T.bD }], st.b, (v) => {
      st.b = v;
      draw();
    }, T.pB);
    const bLab = MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.pB)), bSeg.el);
    fig.controls.append(s11.el, s12.el, s21.el, s22.el, bLab);
    const ro = F.readout(fig.readout, [
      { key: 'a', label: T.detA },
      { key: 'b', label: T.detB },
      { key: 'ab', label: T.detAB },
      { key: 'p', label: T.prod },
    ]);
    let p = null;
    let lastW = 0;
    function build() {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
      if (W === lastW && p) return;
      lastW = W;
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.6)), x: [-3, 3], y: [-3, 3], equal: true, label: T.aria2 });
      ext = '';
    }
    let ext = '';
    /** Окно графика подстраивается под фигуры (с запасом и с началом координат), шаг — целые числа. */
    function fit(pts) {
      const xs = [0, 1].concat(pts.map((q) => q[0]));
      const ys = [0, 1].concat(pts.map((q) => q[1]));
      const x = [Math.floor(Math.min(...xs) - 0.6), Math.ceil(Math.max(...xs) + 0.6)];
      const y = [Math.floor(Math.min(...ys) - 0.6), Math.ceil(Math.max(...ys) + 0.6)];
      const key = x.concat(y).join(',');
      if (key === ext) return;
      ext = key;
      p.setDomain(x, y);
      p.axes({ xLabel: 'x', yLabel: 'y' });
    }
    const para = ([u, v], cls, style) => {
      const g = p.polygon([[0, 0], u, [u[0] + v[0], u[1] + v[1]], v], cls);
      if (style && g) g.setAttribute('style', style);
      return g;
    };
    function draw() {
      build();
      p.clear();
      const A = st.A;
      const B = BS[st.b];
      const AB = mul2(A, B);
      const dA = det2(A);
      const dB = det2(B);
      const dAB = det2(AB);
      const [u, v] = cols(AB);
      const [bu, bv] = cols(B);
      fit([u, v, [u[0] + v[0], u[1] + v[1]], bu, bv, [bu[0] + bv[0], bu[1] + bv[1]]]);
      para(cols([[1, 0], [0, 1]]), 'poly faint');
      para(cols(B), 'poly');
      para(cols(AB), 'poly', 'fill: var(--warm-soft); stroke: var(--warm); stroke-width: 2');
      p.arrow(0, 0, u[0], u[1], 'warm');
      p.arrow(0, 0, v[0], v[1], 'warm');
      p.arrow(0, 0, bu[0], bu[1], 'accent');
      p.arrow(0, 0, bv[0], bv[1], 'accent');
      p.text(u[0], u[1], 'AB¹', 'lbl warm', { dx: 6, dy: -6 });
      p.text(v[0], v[1], 'AB²', 'lbl warm', { dx: 6, dy: -6 });
      ro.set('a', U.fmt(dA, 3), dA === 0 ? 'warm' : '');
      ro.set('b', U.fmt(dB, 3));
      ro.set('ab', U.fmt(dAB, 3), 'accent');
      ro.set('p', U.fmt(dA * dB, 3), 'accent');
      let msg = T.noteAr(U.fmt(dA, 3), U.fmt(dB, 3), U.fmt(dAB, 3));
      if (Math.abs(dA) < 1e-12) msg = T.degen;
      else if (dAB < 0) msg += ' ' + T.orient;
      fig.note.className = 'fig-note' + (Math.abs(dA) < 1e-12 ? '' : ' ok');
      fig.note.textContent = msg;
    }
    draw();
    window.addEventListener('resize', () => {
      if (Math.round(U.clamp(fig.plot.clientWidth, 300, 720)) !== lastW) draw();
    });
  });
})();
