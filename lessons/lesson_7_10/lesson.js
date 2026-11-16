/* Урок 7.10 «Кольца»: рисунок 1 — таблицы сложения и умножения кольца Z_n (и булева кольца P({a, b}))
 * с делителями нуля и обратимыми элементами; рисунок 2 — кольцо 2×2-матриц: некоммутативность,
 * делители нуля, подкольца (Куликов, гл. 3, § 4). */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Кольцо $\\mathbf{Z}_n$: таблицы сложения и умножения',
      title2: 'Кольцо $2\\times 2$-матриц над $\\mathbf{Z}$',
      ring: 'Кольцо',
      op: 'Таблица',
      n: 'модуль $n$',
      zn: '$\\mathbf{Z}_n$',
      bool: '$P(\\{a, b\\})$',
      add: 'сложение',
      mul: 'умножение',
      zd: 'делители нуля',
      units: 'обратимые',
      domain: 'область целостности',
      comm: 'коммутативно',
      yes: 'да',
      no: 'нет',
      none: 'нет',
      tableAria: 'Таблица операции кольца',
      cellAria: (a, b) => 'Клетка ' + a + ', ' + b,
      introZn: (n) => 'Кольцо вычетов по модулю ' + n + ': сложение и умножение «по кругу» из ' + n + ' чисел. ',
      introBool: 'Булево кольцо подмножеств {a, b}: сложение — симметрическая разность Δ, умножение — пересечение ∩, нуль — ∅, единица — {a,b}. ',
      domainYes: 'Делителей нуля нет: это область целостности. ',
      domainNo: (list) => 'Делители нуля: ' + list + ' — красные нули в таблице умножения стоят вне нулевой строки и нулевого столбца. ',
      hint: 'Нажмите на клетку — разберу её.',
      cellAdd: (a, b, r) => a + ' + ' + b + ' = ' + r + '. ',
      cellMul: (a, b, r) => a + ' · ' + b + ' = ' + r + '. ',
      cellZd: (a, b) => 'Оба множителя ненулевые, а произведение — нуль: ' + a + ' и ' + b + ' — делители нуля. ',
      cellNeg: (a, r) => 'Противоположный к ' + a + ' — ' + r + ' (в строке ' + a + ' нуль стоит в столбце ' + r + '). ',
      cellInv: (a, r) => 'Обратный к ' + a + ' по умножению — ' + r + '. ',
      cellNoInv: (a) => 'Обратного к ' + a + ' нет: единица в строке ' + a + ' не встречается. ',
      preset: 'Пара матриц',
      pNc: '$AB \\ne BA$',
      pZd: 'делители нуля',
      pTri: 'верхнетреугольные',
      pS: 'вида $\\left[\\begin{smallmatrix} a & b\\\\ -b & a\\end{smallmatrix}\\right]$',
      rnd: 'Случайные',
      eqAB: '$AB = BA$',
      zeroAB: '$AB = 0$',
      inSub: 'в подкольце',
      nc: (ab, ba) => 'Умножение некоммутативно: AB и BA различаются. ',
      cm: 'Эти две матрицы перестановочны: AB = BA (так бывает, но не для всех пар). ',
      zdNote: 'A ≠ 0 и B ≠ 0, а AB = 0 — делители нуля, как в упражнении 3. ',
      triNote: 'Обе матрицы верхнетреугольные, и сумма, и произведения снова верхнетреугольные — пример 2 подраздела «Подкольца». ',
      sNote: 'Обе матрицы вида [a b; −b a]; произведения снова такого вида — пример 3 подраздела «Подкольца». ',
      subYes: 'да',
      subNo: 'нет',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'The ring $\\mathbf{Z}_n$: addition and multiplication tables',
      title2: 'The ring of $2\\times 2$ matrices over $\\mathbf{Z}$',
      ring: 'Ring',
      op: 'Table',
      n: 'modulus $n$',
      zn: '$\\mathbf{Z}_n$',
      bool: '$P(\\{a, b\\})$',
      add: 'addition',
      mul: 'multiplication',
      zd: 'zero divisors',
      units: 'invertible',
      domain: 'integral domain',
      comm: 'commutative',
      yes: 'yes',
      no: 'no',
      none: 'none',
      tableAria: 'Ring operation table',
      cellAria: (a, b) => 'Cell ' + a + ', ' + b,
      introZn: (n) => 'Residues modulo ' + n + ': addition and multiplication “around a circle” of ' + n + ' numbers. ',
      introBool: 'Boolean ring of subsets of {a, b}: addition is the symmetric difference Δ, multiplication is ∩, zero is ∅, one is {a,b}. ',
      domainYes: 'No zero divisors: an integral domain. ',
      domainNo: (list) => 'Zero divisors: ' + list + ' — the red zeros of the multiplication table lie outside the zero row and column. ',
      hint: 'Click a cell for an explanation.',
      cellAdd: (a, b, r) => a + ' + ' + b + ' = ' + r + '. ',
      cellMul: (a, b, r) => a + ' · ' + b + ' = ' + r + '. ',
      cellZd: (a, b) => 'Both factors are nonzero but the product is zero: ' + a + ' and ' + b + ' are zero divisors. ',
      cellNeg: (a, r) => 'The opposite of ' + a + ' is ' + r + '. ',
      cellInv: (a, r) => 'The multiplicative inverse of ' + a + ' is ' + r + '. ',
      cellNoInv: (a) => a + ' has no inverse: 1 never appears in row ' + a + '. ',
      preset: 'Pair of matrices',
      pNc: '$AB \\ne BA$',
      pZd: 'zero divisors',
      pTri: 'upper triangular',
      pS: 'of the form $\\left[\\begin{smallmatrix} a & b\\\\ -b & a\\end{smallmatrix}\\right]$',
      rnd: 'Random',
      eqAB: '$AB = BA$',
      zeroAB: '$AB = 0$',
      inSub: 'in the subring',
      nc: () => 'Multiplication is not commutative: AB and BA differ. ',
      cm: 'These two matrices commute: AB = BA (it happens, but not for every pair). ',
      zdNote: 'A ≠ 0 and B ≠ 0 but AB = 0 — zero divisors, as in exercise 3. ',
      triNote: 'Both matrices are upper triangular; the sum and the products are upper triangular again. ',
      sNote: 'Both matrices have the form [a b; −b a]; so do the products. ',
      subYes: 'yes',
      subNo: 'no',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: '$\\mathbf{Z}_n$ halqasi: qo‘shish va ko‘paytirish jadvallari',
      title2: '$\\mathbf{Z}$ ustidagi $2\\times 2$-matritsalar halqasi',
      ring: 'Halqa',
      op: 'Jadval',
      n: 'modul $n$',
      zn: '$\\mathbf{Z}_n$',
      bool: '$P(\\{a, b\\})$',
      add: 'qo‘shish',
      mul: 'ko‘paytirish',
      zd: 'nolning bo‘luvchilari',
      units: 'teskarilanuvchi',
      domain: 'butunlik sohasi',
      comm: 'kommutativ',
      yes: 'ha',
      no: 'yo‘q',
      none: 'yo‘q',
      tableAria: 'Halqa amali jadvali',
      cellAria: (a, b) => 'Katak ' + a + ', ' + b,
      introZn: (n) => n + ' moduli bo‘yicha chegirmalar halqasi. ',
      introBool: '{a, b} qism to‘plamlari bul halqasi: qo‘shish — Δ, ko‘paytirish — ∩, nol — ∅, bir — {a,b}. ',
      domainYes: 'Nolning bo‘luvchilari yo‘q: butunlik sohasi. ',
      domainNo: (list) => 'Nolning bo‘luvchilari: ' + list + '. ',
      hint: 'Katakni bosing — tushuntiraman.',
      cellAdd: (a, b, r) => a + ' + ' + b + ' = ' + r + '. ',
      cellMul: (a, b, r) => a + ' · ' + b + ' = ' + r + '. ',
      cellZd: (a, b) => 'Ikkala ko‘paytuvchi noldan farqli, ko‘paytma esa nol: ' + a + ' va ' + b + ' — nolning bo‘luvchilari. ',
      cellNeg: (a, r) => a + ' ga qarama-qarshi element — ' + r + '. ',
      cellInv: (a, r) => a + ' ga teskari element — ' + r + '. ',
      cellNoInv: (a) => a + ' ning teskarisi yo‘q. ',
      preset: 'Matritsalar juftligi',
      pNc: '$AB \\ne BA$',
      pZd: 'nolning bo‘luvchilari',
      pTri: 'yuqori uchburchak',
      pS: '$\\left[\\begin{smallmatrix} a & b\\\\ -b & a\\end{smallmatrix}\\right]$ ko‘rinishidagi',
      rnd: 'Tasodifiy',
      eqAB: '$AB = BA$',
      zeroAB: '$AB = 0$',
      inSub: 'qism halqada',
      nc: () => 'Ko‘paytirish kommutativ emas: AB va BA har xil. ',
      cm: 'Bu ikki matritsa o‘rin almashinuvchi: AB = BA. ',
      zdNote: 'A ≠ 0 va B ≠ 0, lekin AB = 0 — nolning bo‘luvchilari. ',
      triNote: 'Ikkala matritsa yuqori uchburchak; yig‘indi va ko‘paytmalar ham shunday. ',
      sNote: 'Ikkala matritsa [a b; −b a] ko‘rinishida; ko‘paytmalar ham shunday. ',
      subYes: 'ha',
      subNo: 'yo‘q',
    },
  });

  /* ---------- Рисунок 1: таблицы кольца ---------- */
  const SETS = ['∅', '{a}', '{b}', '{a,b}']; // биты: a — 1, b — 2

  /** Кольцо как набор: N элементов, сложение, умножение, нуль, единица, подписи. */
  function ringOf(kind, n) {
    if (kind === 'bool') return { N: 4, add: (a, b) => a ^ b, mul: (a, b) => a & b, zero: 0, one: 3, name: (i) => SETS[i] };
    return { N: n, add: (a, b) => (a + b) % n, mul: (a, b) => (a * b) % n, zero: 0, one: 1 % n, name: (i) => String(i) };
  }

  /** Делители нуля, обратимые элементы, противоположные — по определениям Куликова. */
  function analyse(R) {
    const els = [...Array(R.N).keys()];
    const zd = els.filter((a) => a !== R.zero && els.some((b) => b !== R.zero && (R.mul(a, b) === R.zero || R.mul(b, a) === R.zero)));
    const inv = els.map((a) => els.find((b) => R.mul(a, b) === R.one && R.mul(b, a) === R.one));
    const neg = els.map((a) => els.find((b) => R.add(a, b) === R.zero));
    let comm = true;
    for (const a of els) for (const b of els) if (R.mul(a, b) !== R.mul(b, a)) comm = false;
    const domain = comm && R.zero !== R.one && zd.length === 0;
    return { zd, inv, neg, comm, domain };
  }

  MC.widget('ring-tables', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { kind: cfg.kind || 'zn', n: cfg.n || 6, op: cfg.op || 'mul', sel: null };
    const kindSeg = F.seg([{ value: 'zn', label: T.zn }, { value: 'bool', label: T.bool }], st.kind, (v) => {
      st.kind = v;
      st.sel = null;
      nS.el.style.display = v === 'zn' ? '' : 'none';
      build();
    }, T.ring);
    const opSeg = F.seg([{ value: 'add', label: T.add }, { value: 'mul', label: T.mul }], st.op, (v) => {
      st.op = v;
      st.sel = null;
      build();
    }, T.op);
    const nS = F.slider({ label: T.n, min: 2, max: 12, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.sel = null;
      build();
    } });
    nS.el.style.display = st.kind === 'zn' ? '' : 'none';
    fig.controls.append(kindSeg.el, opSeg.el, nS.el);
    const ro = F.readout(fig.readout, [
      { key: 'comm', label: T.comm },
      { key: 'zd', label: T.zd },
      { key: 'units', label: T.units },
      { key: 'domain', label: T.domain },
    ]);
    let svg = null;
    let R = null;
    let A = null;

    function build() {
      R = ringOf(st.kind, st.n);
      A = analyse(R);
      const N = R.N;
      const C = N > 8 ? 44 : N > 6 ? 52 : 60;
      const size = C * (N + 1);
      const f = st.op === 'add' ? R.add : R.mul;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = Math.max(size, 300) + 'px';
      const long = st.kind === 'bool';
      const fs = (s) => (long ? (s.length > 3 ? 13 : 16) : N > 8 ? 16 : 19) + 'px';
      const corner = S('text', { class: 'cv corner', x: C / 2, y: C / 2 }, st.op === 'add' ? '+' : '·');
      svg.appendChild(corner);
      for (let i = 0; i < N; i++) {
        const h1 = S('text', { class: 'cv ch', x: C * (i + 1) + C / 2, y: C / 2 }, R.name(i));
        const h2 = S('text', { class: 'cv ch', x: C / 2, y: C * (i + 1) + C / 2 }, R.name(i));
        h1.style.fontSize = h2.style.fontSize = fs(R.name(i));
        svg.append(h1, h2);
      }
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const v = f(i, j);
          const x = C * (j + 1);
          const y = C * (i + 1);
          const bad = st.op === 'mul' && i !== R.zero && j !== R.zero && v === R.zero;
          const on = st.sel && st.sel[0] === i && st.sel[1] === j;
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(R.name(i), R.name(j)) });
          g.appendChild(S('rect', { class: 'cell' + (bad ? ' bad' : '') + (on ? ' on' : ''), x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 }));
          const t = S('text', { class: 'cv' + (bad ? ' bad' : ''), x: x + C / 2, y: y + C / 2 }, R.name(v));
          t.style.fontSize = fs(R.name(v));
          const special = st.op === 'mul' ? v === R.one : v === R.zero;
          if (special && !bad) t.style.fill = 'var(--accent)';
          g.appendChild(t);
          const pick = () => {
            st.sel = [i, j];
            build();
          };
          g.addEventListener('click', pick);
          g.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              pick();
            }
          });
          svg.appendChild(g);
        }
      }
      fig.plot.appendChild(svg);
      const list = (arr) => (arr.length ? arr.map(R.name).join(', ') : T.none);
      ro.set('comm', A.comm ? T.yes : T.no, A.comm ? 'accent' : 'warm');
      ro.set('zd', list(A.zd), A.zd.length ? 'warm' : 'accent');
      ro.set('units', list([...Array(N).keys()].filter((a) => A.inv[a] !== undefined)));
      ro.set('domain', A.domain ? T.yes : T.no, A.domain ? 'accent' : 'warm');
      explain();
    }

    function explain() {
      let s = st.kind === 'bool' ? T.introBool : T.introZn(st.n);
      s += A.zd.length ? T.domainNo(A.zd.map(R.name).join(', ')) : T.domainYes;
      if (!st.sel) {
        fig.note.textContent = s + T.hint;
        return;
      }
      const [a, b] = st.sel;
      const na = R.name(a);
      const nb = R.name(b);
      if (st.op === 'add') {
        s = T.cellAdd(na, nb, R.name(R.add(a, b))) + T.cellNeg(na, R.name(A.neg[a]));
      } else {
        const v = R.mul(a, b);
        s = T.cellMul(na, nb, R.name(v));
        if (a !== R.zero && b !== R.zero && v === R.zero) s += T.cellZd(na, nb);
        s += A.inv[a] !== undefined ? T.cellInv(na, R.name(A.inv[a])) : T.cellNoInv(na);
      }
      fig.note.textContent = s;
    }

    build();
  });

  /* ---------- Рисунок 2: кольцо 2×2-матриц ---------- */
  const mul2 = (X, Y) => [
    [X[0][0] * Y[0][0] + X[0][1] * Y[1][0], X[0][0] * Y[0][1] + X[0][1] * Y[1][1]],
    [X[1][0] * Y[0][0] + X[1][1] * Y[1][0], X[1][0] * Y[0][1] + X[1][1] * Y[1][1]],
  ];
  const add2 = (X, Y) => X.map((r, i) => r.map((v, j) => v + Y[i][j]));
  const eq2 = (X, Y) => X.every((r, i) => r.every((v, j) => v === Y[i][j]));
  const isZero = (X) => X.every((r) => r.every((v) => v === 0));
  const inTri = (X) => X[1][0] === 0;
  const inS = (X) => X[0][0] === X[1][1] && X[1][0] === -X[0][1];
  const PRE = {
    nc: { A: [[1, 1], [0, 1]], B: [[1, 0], [1, 1]] },
    zd: { A: [[1, 0], [0, 0]], B: [[0, 0], [0, 1]] },
    tri: { A: [[1, 2], [0, 3]], B: [[2, -1], [0, 1]] },
    s: { A: [[1, 2], [-2, 1]], B: [[3, -1], [1, 3]] },
  };

  MC.widget('matrix-ring', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { p: cfg.preset || 'nc', A: null, B: null };
    const load = (k) => {
      st.p = k;
      st.A = PRE[k].A.map((r) => r.slice());
      st.B = PRE[k].B.map((r) => r.slice());
    };
    load(st.p);
    const seg = F.seg([
      { value: 'nc', label: T.pNc },
      { value: 'zd', label: T.pZd },
      { value: 'tri', label: T.pTri },
      { value: 's', label: T.pS },
    ], st.p, (v) => {
      load(v);
      draw();
    }, T.preset);
    let seed = 7;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return (seed % 7) - 3;
    };
    const btn = F.button(null, T.rnd, () => {
      const gen = () => {
        if (st.p === 'tri') return [[rnd(), rnd()], [0, rnd()]];
        if (st.p === 's') {
          const a = rnd();
          const b = rnd();
          return [[a, b], [-b, a]];
        }
        return [[rnd(), rnd()], [rnd(), rnd()]];
      };
      st.A = gen();
      st.B = gen();
      draw();
    });
    fig.controls.append(seg.el, btn);
    const ro = F.readout(fig.readout, [
      { key: 'comm', label: T.eqAB },
      { key: 'zero', label: T.zeroAB },
      { key: 'sub', label: T.inSub },
    ]);
    let svg = null;
    function draw() {
      const { A, B } = st;
      const AB = mul2(A, B);
      const BA = mul2(B, A);
      const items = [['A', A], ['B', B], ['A + B', add2(A, B)], ['AB', AB], ['BA', BA]];
      const C = 34;
      const W = fig.plot.clientWidth || 640;
      const per = W < 520 ? 3 : 5;
      const cellW = C * 2 + 40;
      const rows = Math.ceil(items.length / per);
      const width = per * cellW;
      const height = rows * (C * 2 + 44);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + width + ' ' + height, role: 'img', 'aria-label': T.title2.replace(/\$/g, '') });
      svg.style.maxWidth = width + 'px';
      items.forEach(([n, X], k) => {
        const x0 = (k % per) * cellW + 20;
        const y0 = Math.floor(k / per) * (C * 2 + 44) + 28;
        const lbl = S('text', { class: 'cv ch', x: x0 + C, y: y0 - 14 }, n);
        lbl.style.fontSize = '15px';
        svg.appendChild(lbl);
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const diff = (n === 'AB' || n === 'BA') && AB[i][j] !== BA[i][j];
            svg.appendChild(S('rect', { class: 'cell' + (diff ? ' bad' : ''), x: x0 + j * C + 1, y: y0 + i * C + 1, width: C - 2, height: C - 2, rx: 4 }));
            const v = X[i][j];
            const t = S('text', { class: 'cv' + (diff ? ' bad' : ''), x: x0 + j * C + C / 2, y: y0 + i * C + C / 2 }, v < 0 ? '−' + -v : String(v));
            t.style.fontSize = '16px';
            svg.appendChild(t);
          }
        }
      });
      fig.plot.appendChild(svg);
      const comm = eq2(AB, BA);
      ro.set('comm', comm ? T.yes : T.no, comm ? 'accent' : 'warm');
      const z = isZero(AB) && !isZero(A) && !isZero(B);
      ro.set('zero', isZero(AB) ? T.yes : T.no, z ? 'warm' : '');
      let sub = '—';
      if (st.p === 'tri') sub = [AB, BA, add2(A, B)].every(inTri) ? T.subYes : T.subNo;
      if (st.p === 's') sub = [AB, BA, add2(A, B)].every(inS) ? T.subYes : T.subNo;
      ro.set('sub', sub, sub === T.subYes ? 'accent' : '');
      let s = comm ? T.cm : T.nc();
      if (z) s += T.zdNote;
      if (st.p === 'tri') s += T.triNote;
      if (st.p === 's') s += T.sNote;
      fig.note.textContent = s;
    }

    draw();
  });

  if (typeof module !== 'undefined') module.exports = { ringOf, analyse, mul2 };
})();
