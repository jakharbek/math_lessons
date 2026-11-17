/* Урок 7.29 «Обратимые матрицы» (Куликов, гл. 6, § 2):
 * рисунок 1 «Элементарная матрица в действии» — Eᵩ·A меняет строку (свойство 2.3), A·Eᵩ — столбец;
 * рисунок 2 «Обратная матрица по шагам» — правило (A | E) → (E | A⁻¹) из теоремы 2.9 в точных дробях,
 * каждый шаг подписан своей элементарной матрицей. */
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
  const neg = (a) => fr(-a.n, a.d);
  const inv = (a) => fr(a.d, a.n);
  const isZero = (a) => a.n === 0;
  const isOne = (a) => a.n === 1 && a.d === 1;
  const minus = (s) => s.replace('-', '−');
  const show = (a) => minus(a.d === 1 ? String(a.n) : a.n + '/' + a.d);
  const coef = (a) => (a.n < 0 || a.d !== 1 ? '(' + show(a) + ')' : show(a));
  /** Подпись элементарной матрицы в обозначениях Куликова: E_λ(i), E_(i)+λ(k), E_(i)−λ(k). */
  const nameScale = (l, i) => 'E' + sub(coef(l) + '(' + i + ')');
  const nameAdd = (i, l, k) => {
    const abs = l.n < 0 ? neg(l) : l;
    const lam = isOne(abs) ? '' : (abs.d === 1 ? show(abs) : '(' + show(abs) + ')');
    return 'E' + sub('(' + i + ')' + (l.n < 0 ? '−' : '+') + lam + '(' + k + ')');
  };
  // нижний индекс символами Юникода: «E₍₂₎₋₅₍₁₎» читается и без KaTeX
  const SUBS = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '−': '₋', '-': '₋', '(': '₍', ')': '₎', '/': '⁄', i: 'ᵢ' };
  function sub(s) {
    return [...s].map((ch) => SUBS[ch] || ch).join('');
  }

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Элементарная матрица в действии: строка при умножении слева, столбец — справа',
      t2: 'Обратная матрица по шагам: $(A \\mid E) \\to (E \\mid A^{-1})$',
      aria1: 'Элементарная матрица, матрица A и их произведение; изменённая строка или столбец подсвечены',
      aria2: 'Матрица (A | E) на текущем шаге; изменённая строка подсвечена',
      type: 'Тип', tScale: 'умножить строку', tAdd: 'прибавить строку',
      side: 'Умножение', left: 'слева', right: 'справа',
      rowI: 'строка $i$', rowK: 'строка $k$', lam: 'скаляр $\\lambda$',
      matrix: 'матрица', changed: 'изменилось', inverse: 'обратная',
      row: (i) => 'строка ' + i, col: (i) => 'столбец ' + i,
      zero: 'λ = 0: умножение строки на нуль — не элементарное преобразование (в (α) скаляр отличен от нуля). Матрица E₀₍ᵢ₎ имеет нулевую строку и необратима (лемма 2.4); строка (столбец) произведения обнуляется, и восстановить её нельзя.',
      noteScaleL: (i, l, inv) => 'Eᵩ·A: строка ' + i + ' матрицы A умножена на ' + l + ' (свойство 2.3). Обратная к Eᵩ — E' + sub(inv + '(' + i + ')') + ': она умножит строку обратно на ' + inv + '.',
      noteScaleR: (i, l) => 'A·Eᵩ: умножение справа действует на столбцы — столбец ' + i + ' умножен на ' + l + ' (упражнение 7 § 1).',
      noteAddL: (i, k, l) => 'Eᵩ·A: к строке ' + i + ' прибавлена строка ' + k + ', умноженная на ' + l + ' (свойство 2.3). Обратная — та же матрица с −λ вместо λ (свойство 2.1).',
      noteAddR: (i, k, l) => 'A·Eᵩ: λ стоит на месте (' + i + ', ' + k + '), поэтому к столбцу ' + k + ' прибавлен столбец ' + i + ', умноженный на ' + l + ' — индексы «меняются ролями».',
      preset: 'Матрица', ex: (k) => 'пример ' + k,
      back: 'Назад', step: 'Шаг', reset: 'Сначала',
      stepNo: 'шаг', op: 'элементарная матрица', status: 'левая половина',
      stLeft: { start: 'A', work: 'в работе', done: 'E', bad: 'нулевая строка' },
      start: 'Исходная матрица (A | E). Нажмите «Шаг».',
      fix: (i, k) => '(β): ведущий элемент в строке ' + i + ' равен нулю — прибавляем к ней строку ' + k + ' (перестановок строк у Куликова нет).',
      scale: (i, c) => '(α): строка ' + i + ' умножается на ' + c + ' — ведущий элемент становится равен 1.',
      elim: (i, c, k) => '(β): к строке ' + i + ' прибавляется строка ' + k + ', умноженная на ' + c + ' — в столбце ведущей единицы появляется нуль.',
      leftNote: 'Умножение слева на эту матрицу — тот же шаг (свойство 2.3).',
      done: 'Готово: слева E, значит, справа A⁻¹ (теорема 2.9).',
      singular: (j) => 'В столбце ' + j + ' ниже уже обработанных строк одни нули, и в левой половине получилась нулевая строка: строки A линейно зависимы, A необратима (лемма 2.5, теорема 2.8).',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'An elementary matrix at work: a row when multiplying on the left, a column on the right',
      t2: 'The inverse matrix step by step: $(A \\mid E) \\to (E \\mid A^{-1})$',
      aria1: 'An elementary matrix, the matrix A and their product; the changed row or column is highlighted',
      aria2: 'The matrix (A | E) at the current step; the changed row is highlighted',
      type: 'Type', tScale: 'scale a row', tAdd: 'add a row',
      side: 'Multiply', left: 'on the left', right: 'on the right',
      rowI: 'row $i$', rowK: 'row $k$', lam: 'scalar $\\lambda$',
      matrix: 'matrix', changed: 'changed', inverse: 'inverse',
      row: (i) => 'row ' + i, col: (i) => 'column ' + i,
      zero: 'λ = 0: multiplying a row by zero is not an elementary operation (in (α) the scalar is nonzero). The matrix E₀₍ᵢ₎ has a zero row and is not invertible (lemma 2.4); the row (column) of the product becomes zero and cannot be recovered.',
      noteScaleL: (i, l, inv) => 'Eᵩ·A: row ' + i + ' of A is multiplied by ' + l + ' (property 2.3). The inverse of Eᵩ is E' + sub(inv + '(' + i + ')') + ': it multiplies the row back by ' + inv + '.',
      noteScaleR: (i, l) => 'A·Eᵩ: multiplying on the right acts on columns — column ' + i + ' is multiplied by ' + l + ' (exercise 7 of § 1).',
      noteAddL: (i, k, l) => 'Eᵩ·A: row ' + k + ' times ' + l + ' is added to row ' + i + ' (property 2.3). The inverse is the same matrix with −λ instead of λ (property 2.1).',
      noteAddR: (i, k, l) => 'A·Eᵩ: λ sits at position (' + i + ', ' + k + '), so column ' + i + ' times ' + l + ' is added to column ' + k + ' — the indices swap roles.',
      preset: 'Matrix', ex: (k) => 'example ' + k,
      back: 'Back', step: 'Step', reset: 'Restart',
      stepNo: 'step', op: 'elementary matrix', status: 'left half',
      stLeft: { start: 'A', work: 'in progress', done: 'E', bad: 'zero row' },
      start: 'The original matrix (A | E). Press “Step”.',
      fix: (i, k) => '(β): the leading entry of row ' + i + ' is zero — we add row ' + k + ' to it (Kulikov has no row swaps).',
      scale: (i, c) => '(α): row ' + i + ' is multiplied by ' + c + ' — the leading entry becomes 1.',
      elim: (i, c, k) => '(β): row ' + k + ' times ' + c + ' is added to row ' + i + ' — a zero appears in the column of the leading one.',
      leftNote: 'Multiplying on the left by this matrix is the same step (property 2.3).',
      done: 'Done: E on the left, hence A⁻¹ on the right (theorem 2.9).',
      singular: (j) => 'Column ' + j + ' has only zeros below the processed rows, and a zero row has appeared in the left half: the rows of A are linearly dependent, A is not invertible (lemma 2.5, theorem 2.8).',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Elementar matritsa amalda: chapdan ko‘paytirganda satr, o‘ngdan — ustun',
      t2: 'Teskari matritsa qadam-baqadam: $(A \\mid E) \\to (E \\mid A^{-1})$',
      aria1: 'Elementar matritsa, A matritsa va ularning ko‘paytmasi; o‘zgargan satr yoki ustun ajratilgan',
      aria2: 'Joriy qadamdagi (A | E) matritsa; o‘zgargan satr ajratilgan',
      type: 'Turi', tScale: 'satrni ko‘paytirish', tAdd: 'satr qo‘shish',
      side: 'Ko‘paytirish', left: 'chapdan', right: 'o‘ngdan',
      rowI: '$i$-satr', rowK: '$k$-satr', lam: '$\\lambda$ skalyar',
      matrix: 'matritsa', changed: 'o‘zgardi', inverse: 'teskari',
      row: (i) => i + '-satr', col: (i) => i + '-ustun',
      zero: 'λ = 0: satrni nolga ko‘paytirish elementar almashtirish emas ((α) da skalyar noldan farqli). E₀₍ᵢ₎ matritsada nol satr bor va u teskarilanmaydi (2.4-lemma); ko‘paytmaning satri (ustuni) nolga aylanadi va uni tiklab bo‘lmaydi.',
      noteScaleL: (i, l, inv) => 'Eᵩ·A: A ning ' + i + '-satri ' + l + ' ga ko‘paytirildi (2.3-xossa). Eᵩ ga teskari — E' + sub(inv + '(' + i + ')') + ': u satrni qaytadan ' + inv + ' ga ko‘paytiradi.',
      noteScaleR: (i, l) => 'A·Eᵩ: o‘ngdan ko‘paytirish ustunlarga ta’sir qiladi — ' + i + '-ustun ' + l + ' ga ko‘paytirildi (1-§, 7-mashq).',
      noteAddL: (i, k, l) => 'Eᵩ·A: ' + i + '-satrga ' + l + ' ga ko‘paytirilgan ' + k + '-satr qo‘shildi (2.3-xossa). Teskarisi — λ o‘rniga −λ turgan o‘sha matritsa (2.1-xossa).',
      noteAddR: (i, k, l) => 'A·Eᵩ: λ (' + i + ', ' + k + ') o‘rinda turadi, shuning uchun ' + k + '-ustunga ' + l + ' ga ko‘paytirilgan ' + i + '-ustun qo‘shildi — indekslar rollarini almashtiradi.',
      preset: 'Matritsa', ex: (k) => k + '-misol',
      back: 'Orqaga', step: 'Qadam', reset: 'Boshidan',
      stepNo: 'qadam', op: 'elementar matritsa', status: 'chap yarmi',
      stLeft: { start: 'A', work: 'jarayonda', done: 'E', bad: 'nol satr' },
      start: 'Boshlang‘ich (A | E) matritsa. «Qadam» tugmasini bosing.',
      fix: (i, k) => '(β): ' + i + '-satrning yetakchi elementi nol — unga ' + k + '-satrni qo‘shamiz (Kulikovda satrlarni almashtirish yo‘q).',
      scale: (i, c) => '(α): ' + i + '-satr ' + c + ' ga ko‘paytiriladi — yetakchi element 1 ga teng bo‘ladi.',
      elim: (i, c, k) => '(β): ' + i + '-satrga ' + c + ' ga ko‘paytirilgan ' + k + '-satr qo‘shiladi — yetakchi bir ustunida nol hosil bo‘ladi.',
      leftNote: 'Shu matritsaga chapdan ko‘paytirish — xuddi shu qadam (2.3-xossa).',
      done: 'Tayyor: chapda E, demak, o‘ngda A⁻¹ (2.9-teorema).',
      singular: (j) => j + '-ustunda ishlangan satrlardan pastda faqat nollar, chap yarmida nol satr paydo bo‘ldi: A satrlari chiziqli bog‘liq, A teskarilanmaydi (2.5-lemma, 2.8-teorema).',
    },
  });

  /* ------------------------ общая отрисовка матриц ------------------------ */
  /**
   * Рисует в svg матрицу M (массив строк дробей) с левым верхним углом (x, y) и клеткой C.
   * o.sep — номер столбца, перед которым вертикальная черта; o.row / o.col — подсвеченные строка / столбец;
   * o.cell — [i, k] выделенный элемент.
   */
  function drawMatrix(svg, M, x, y, C, o = {}) {
    const m = M.length;
    const n = M[0].length;
    const H = C * m;
    if (o.row != null) svg.appendChild(S('rect', { x: x + 2, y: y + C * o.row + 2, width: C * n - 4, height: C - 4, rx: 4, style: 'fill: var(--accent-soft)' }));
    if (o.col != null) svg.appendChild(S('rect', { x: x + C * o.col + 2, y: y + 2, width: C - 4, height: H - 4, rx: 4, style: 'fill: var(--accent-soft)' }));
    const br = (bx, dir) => svg.appendChild(S('path', { d: 'M' + (bx + dir * 6) + ' ' + y + ' H' + bx + ' V' + (y + H) + ' H' + (bx + dir * 6), class: 'leg' }));
    br(x - 2, 1);
    br(x + C * n + 2, -1);
    if (o.sep != null) svg.appendChild(S('path', { d: 'M' + (x + C * o.sep) + ' ' + (y + 3) + ' V' + (y + H - 3), class: 'leg' }));
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const cx = x + C * j + C / 2;
        const cy = y + C * i + C / 2;
        const hot = o.cell && o.cell[0] === i && o.cell[1] === j;
        if (hot) svg.appendChild(S('circle', { cx, cy, r: C * 0.38, style: 'fill: none; stroke: var(--warm); stroke-width: 2' }));
        const txt = show(M[i][j]);
        const t = S('text', { class: 'cv', x: cx, y: cy }, txt);
        t.style.fontSize = Math.round(C * (txt.length > 4 ? 0.24 : txt.length > 2 ? 0.3 : 0.36)) + 'px';
        if (hot) t.style.fill = 'var(--warm)';
        else if ((o.row != null && o.row === i) || (o.col != null && o.col === j)) t.style.fill = 'var(--accent)';
        svg.appendChild(t);
      }
    }
    return C * n;
  }
  const label = (svg, x, y, txt, size) => {
    const t = S('text', { class: 'cv', x, y }, txt);
    t.style.fontSize = size + 'px';
    svg.appendChild(t);
  };
  const matMul = (A, B) => A.map((r) => B[0].map((_, j) => r.reduce((s, a, k) => add(s, mul(a, B[k][j])), fr(0))));
  const eye = (n) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => fr(i === j ? 1 : 0)));
  const toFr = (x) => {
    // λ с шагом 0,5: точная дробь
    const d = Number.isInteger(x) ? 1 : 2;
    return fr(Math.round(x * d), d);
  };

  /* -------------------- Рисунок 1: элементарная матрица -------------------- */
  const A1 = [[1, 2, 3], [4, 5, 6], [7, 8, 10]].map((r) => r.map((x) => fr(x)));

  MC.widget('elementary-action', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { type: 'add', side: 'left', i: 1, k: 3, lam: 2 };
    const tSeg = F.seg([{ value: 'scale', label: T.tScale }, { value: 'add', label: T.tAdd }], st.type, (v) => {
      st.type = v;
      sync();
      draw();
    }, T.type);
    const sSeg = F.seg([{ value: 'left', label: T.left }, { value: 'right', label: T.right }], st.side, (v) => {
      st.side = v;
      draw();
    }, T.side);
    const iSeg = F.seg([1, 2, 3].map((v) => ({ value: v, label: String(v) })), st.i, (v) => {
      st.i = v;
      if (st.k === v) {
        st.k = v === 3 ? 1 : v + 1;
        kSeg.set(st.k);
      }
      draw();
    }, T.rowI);
    const kSeg = F.seg([1, 2, 3].map((v) => ({ value: v, label: String(v) })), st.k, (v) => {
      st.k = v;
      if (st.i === v) {
        st.i = v === 1 ? 2 : v - 1;
        iSeg.set(st.i);
      }
      draw();
    }, T.rowK);
    const wrap = (lbl, s) => MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich ? F.rich(lbl) : lbl), s.el);
    const iCtl = wrap(T.rowI, iSeg);
    const kCtl = wrap(T.rowK, kSeg);
    const lS = F.slider({ label: T.lam, min: -3, max: 3, step: 0.5, value: st.lam, fmt: (v) => U.fmt(v, 1), oninput: (v) => {
      st.lam = v;
      draw();
    } });
    fig.controls.append(tSeg.el, sSeg.el, iCtl, kCtl, lS.el);
    const ro = F.readout(fig.readout, [
      { key: 'e', label: '$E_\\varphi$' },
      { key: 'ch', label: T.changed },
      { key: 'inv', label: T.inverse },
    ]);
    let svg = null;
    function sync() {
      kCtl.style.display = st.type === 'add' ? '' : 'none';
    }
    function draw() {
      const n = 3;
      const i = st.i - 1;
      const k = st.k - 1;
      const l = toFr(st.lam);
      const E = eye(n);
      let cell;
      if (st.type === 'scale') {
        E[i][i] = l;
        cell = [i, i];
      } else {
        E[i][k] = l;
        cell = [i, k];
      }
      const left = st.side === 'left';
      const P = left ? matMul(E, A1) : matMul(A1, E);
      const changedIdx = st.type === 'scale' ? i : (left ? i : k);
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.max(26, Math.min(48, Math.floor((W - 60) / 10)));
      const gap = Math.round(C * 0.55);
      const w = 9 * C + 4 * gap + 20;
      const h = 3 * C + 34;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const y = 6;
      const fs = Math.round(C * 0.4);
      let x = 10;
      const first = left ? E : A1;
      const second = left ? A1 : E;
      x += drawMatrix(svg, first, x, y, C, left ? { cell } : {});
      label(svg, x + gap / 2 + 2, y + 1.5 * C, '·', fs);
      x += gap + 4;
      x += drawMatrix(svg, second, x, y, C, left ? {} : { cell });
      label(svg, x + gap / 2 + 2, y + 1.5 * C, '=', fs);
      x += gap + 4;
      const lead = left || st.type === 'scale' ? { [left ? 'row' : 'col']: changedIdx } : { col: changedIdx };
      drawMatrix(svg, P, x, y, C, lead);
      const capY = y + 3 * C + 20;
      const cap = Math.round(C * 0.32);
      label(svg, 10 + 1.5 * C, capY, left ? 'Eᵩ' : 'A', cap);
      label(svg, 10 + 4.5 * C + gap + 4, capY, left ? 'A' : 'Eᵩ', cap);
      label(svg, 10 + 7.5 * C + 2 * gap + 8, capY, left ? 'Eᵩ·A' : 'A·Eᵩ', cap);
      fig.plot.appendChild(svg);
      const lam = show(l);
      ro.set('e', st.type === 'scale' ? nameScale(l, st.i) : nameAdd(st.i, l, st.k), 'accent');
      ro.set('ch', st.type === 'scale' ? (left ? T.row(st.i) : T.col(st.i)) : (left ? T.row(st.i) : T.col(st.k)));
      fig.note.className = 'fig-note';
      if (st.type === 'scale' && isZero(l)) {
        ro.set('inv', '—', 'warm');
        fig.note.className = 'fig-note bad';
        fig.note.textContent = T.zero;
        return;
      }
      if (st.type === 'scale') {
        ro.set('inv', nameScale(inv(l), st.i));
        fig.note.textContent = left ? T.noteScaleL(st.i, lam, coef(inv(l))) : T.noteScaleR(st.i, lam);
      } else {
        ro.set('inv', nameAdd(st.i, neg(l), st.k));
        fig.note.textContent = left ? T.noteAddL(st.i, st.k, lam) : T.noteAddR(st.i, st.k, lam);
      }
    }
    sync();
    draw();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });

  /* ---------------------- Рисунок 2: обратная по шагам ---------------------- */
  const PRESETS = {
    a: [[2, 1], [5, 3]],
    b: [[1, 2, 3], [0, 1, 4], [5, 6, 0]],
    c: [[0, 1, 2], [1, 0, 3], [4, -3, 8]],
    d: [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
  };
  const copy = (M) => M.map((r) => r.slice());

  /** Шаги метода Гаусса — Жордана над (A | E): [{M, msg, op, hl, state}]. Первый шаг — копия исходной матрицы. */
  function steps(src) {
    const n = src.length;
    let M = src.map((r, i) => r.map((x) => fr(x)).concat(eye(n)[i]));
    const out = [{ M: copy(M), msg: () => T.start, op: '—', hl: -1, state: 'start' }];
    for (let c = 0; c < n; c++) {
      if (isZero(M[c][c])) {
        const p = M.findIndex((r, r0) => r0 > c && !isZero(r[c]));
        if (p < 0) {
          const last = out[out.length - 1];
          last.after = () => T.singular(c + 1);
          last.state = 'bad';
          return out;
        }
        M[c] = M[c].map((x, j) => add(x, M[p][j]));
        const i1 = c + 1, k1 = p + 1;
        out.push({ M: copy(M), msg: () => T.fix(i1, k1), op: nameAdd(i1, fr(1), k1), hl: c, state: 'work' });
      }
      if (!isOne(M[c][c])) {
        const l = inv(M[c][c]);
        M[c] = M[c].map((x) => mul(x, l));
        const i1 = c + 1;
        out.push({ M: copy(M), msg: () => T.scale(i1, coef(l)), op: nameScale(l, i1), hl: c, state: 'work' });
      }
      for (let r = 0; r < n; r++) {
        if (r === c || isZero(M[r][c])) continue;
        const l = neg(M[r][c]);
        M[r] = M[r].map((x, j) => add(x, mul(l, M[c][j])));
        const i1 = r + 1, k1 = c + 1;
        out.push({ M: copy(M), msg: () => T.elim(i1, coef(l), k1), op: nameAdd(i1, l, k1), hl: r, state: 'work' });
      }
      // нулевая строка слева — матрица вырождена
      const zr = M.findIndex((row) => row.slice(0, n).every(isZero));
      if (zr >= 0) {
        const last = out[out.length - 1];
        last.after = () => T.singular(c + 2 <= n ? c + 2 : n);
        last.state = 'bad';
        return out;
      }
    }
    const last = out[out.length - 1];
    last.after = () => T.done;
    last.state = 'done';
    return out;
  }

  MC.widget('inverse-steps', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { p: PRESETS[cfg.preset] ? cfg.preset : 'a', k: 0, list: [] };
    const pSeg = F.seg(Object.keys(PRESETS).map((key, i) => ({ value: key, label: T.ex(i + 1) })), st.p, (v) => {
      st.p = v;
      load();
    }, T.preset);
    const bBack = F.button('back', T.back, () => go(-1));
    const bStep = F.button('step', T.step, () => go(1));
    const bReset = F.button('reset', T.reset, () => {
      st.k = 0;
      draw();
    });
    const btns = MC.h('div', { class: 'fig-buttons' }, bBack, bStep, bReset);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(pSeg.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.stepNo },
      { key: 'op', label: T.op },
      { key: 's', label: T.status },
    ]);
    let svg = null;
    function load() {
      st.list = steps(PRESETS[st.p]);
      st.k = 0;
      draw();
    }
    function go(d) {
      st.k = U.clamp(st.k + d, 0, st.list.length - 1);
      draw();
    }
    function draw() {
      const s = st.list[st.k];
      const M = s.M;
      const m = M.length;
      const n2 = M[0].length;
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(60, Math.floor((W - 30) / n2));
      const w = C * n2 + 24;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + (C * m + 8), role: 'img', 'aria-label': T.aria2 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      drawMatrix(svg, M, 12, 4, C, { sep: m, row: s.hl >= 0 ? s.hl : null });
      fig.plot.appendChild(svg);
      ro.set('k', st.k + ' / ' + (st.list.length - 1));
      ro.set('op', s.op, s.op === '—' ? '' : 'accent');
      ro.set('s', T.stLeft[s.state], s.state === 'done' ? 'accent' : s.state === 'bad' ? 'warm' : '');
      const last = st.k === st.list.length - 1;
      fig.note.className = 'fig-note' + (last && s.state === 'done' ? ' ok' : last && s.state === 'bad' ? ' bad' : '');
      fig.note.textContent = s.msg() + (s.op !== '—' ? ' ' + T.leftNote : '') + (s.after && last ? ' ' + s.after() : '');
      bBack.disabled = st.k === 0;
      bStep.disabled = last;
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
