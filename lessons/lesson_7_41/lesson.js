/* Урок 7.41 «Представление линейных операторов матрицами» (Куликов, гл. 8, § 2):
 * рисунок 1 «Матрица оператора и его действие на плоскость» — столбцы M(φ) = образы e₁, e₂, образ сетки и
 * единичного квадрата, M(φ(x)) = M(φ)M(x) (теорема 2.3), ранг оператора = ранг матрицы (теорема 2.6);
 * рисунок 2 «Одно отображение — разные матрицы» — второй базис e′₁, e′₂, матрица перехода T,
 * M′(x) = T⁻¹M(x) (теорема 2.8), M′(φ) = T⁻¹M(φ)T (теорема 2.10), инварианты подобия — след и определитель. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Матрица оператора и его действие на плоскость',
      t2: 'Одно отображение — разные матрицы',
      aria1: 'Образы базисных векторов, образ сетки и единичного квадрата при линейном операторе, вектор x и его образ',
      aria2: 'Второй базис плоскости и его сетка, вектор x и его образ при операторе',
      op: 'оператор',
      shear: 'сдвиг', rot: 'поворот', stretch: 'растяжение', degen: 'вырожденный', refl: 'отражение',
      mx: '$M(\\boldsymbol{x})$', mfx: '$M(\\varphi(\\boldsymbol{x}))$', rank: 'ранг', det: '$|M(\\varphi)|$',
      mpx: "$M'(\\boldsymbol{x})$", trM: '$\\mathrm{след}\\ M(\\varphi)$', trMp: "$\\mathrm{след}\\ M'(\\varphi)$",
      detMp: "$|M'(\\varphi)|$", eig: 'собственный базис',
      r2: 'Ранг 2: оператор обратим, образ — вся плоскость (теорема 2.6: ранг оператора = ранг матрицы).',
      r1: 'Ранг 1: столбцы матрицы пропорциональны, плоскость сплющивается в прямую — образ оператора одномерен.',
      r0: 'Ранг 0: нулевая матрица, всё отображается в начало координат.',
      notBasis: 'Векторы e′₁ и e′₂ лежат на одной прямой — это не базис, матрица T необратима (предложение 2.7).',
      noEig: 'У поворота на 90° нет собственных векторов над полем действительных чисел: никакая прямая не остаётся на месте, диагонального базиса нет.',
      diag: ' Матрица M′(φ) диагональна: базисные векторы e′₁, e′₂ оператор только растягивает.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'The matrix of an operator and its action on the plane',
      t2: 'One map — different matrices',
      aria1: 'Images of the basis vectors, image of the grid and of the unit square under a linear operator, a vector x and its image',
      aria2: 'A second basis of the plane and its grid, a vector x and its image under the operator',
      op: 'operator',
      shear: 'shear', rot: 'rotation', stretch: 'stretch', degen: 'degenerate', refl: 'reflection',
      mx: '$M(\\boldsymbol{x})$', mfx: '$M(\\varphi(\\boldsymbol{x}))$', rank: 'rank', det: '$|M(\\varphi)|$',
      mpx: "$M'(\\boldsymbol{x})$", trM: '$\\mathrm{tr}\\ M(\\varphi)$', trMp: "$\\mathrm{tr}\\ M'(\\varphi)$",
      detMp: "$|M'(\\varphi)|$", eig: 'eigenbasis',
      r2: 'Rank 2: the operator is invertible, its image is the whole plane (theorem 2.6: rank of the operator = rank of the matrix).',
      r1: 'Rank 1: the columns are proportional, the plane is squashed onto a line — the image is one-dimensional.',
      r0: 'Rank 0: the zero matrix, everything goes to the origin.',
      notBasis: 'The vectors e′₁ and e′₂ lie on one line — not a basis, the matrix T is not invertible (proposition 2.7).',
      noEig: 'A 90° rotation has no real eigenvectors: no line stays in place, so there is no diagonal basis.',
      diag: ' M′(φ) is diagonal: the operator only stretches the basis vectors e′₁, e′₂.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Operator matritsasi va uning tekislikka ta’siri',
      t2: 'Bitta akslantirish — turli matritsalar',
      aria1: 'Chiziqli operatorda bazis vektorlarining, to‘rning va birlik kvadratning tasvirlari, x vektor va uning tasviri',
      aria2: 'Tekislikning ikkinchi bazisi va uning to‘ri, x vektor va uning operatordagi tasviri',
      op: 'operator',
      shear: 'siljitish', rot: 'burish', stretch: 'cho‘zish', degen: 'aynigan', refl: 'aks ettirish',
      mx: '$M(\\boldsymbol{x})$', mfx: '$M(\\varphi(\\boldsymbol{x}))$', rank: 'rang', det: '$|M(\\varphi)|$',
      mpx: "$M'(\\boldsymbol{x})$", trM: '$\\mathrm{iz}\\ M(\\varphi)$', trMp: "$\\mathrm{iz}\\ M'(\\varphi)$",
      detMp: "$|M'(\\varphi)|$", eig: 'xos bazis',
      r2: 'Rang 2: operator teskarilanuvchi, tasvir — butun tekislik (2.6-teorema: operator rangi = matritsa rangi).',
      r1: 'Rang 1: ustunlar proporsional, tekislik to‘g‘ri chiziqqa siqiladi — tasvir bir o‘lchovli.',
      r0: 'Rang 0: nol matritsa, hammasi koordinatalar boshiga o‘tadi.',
      notBasis: 'e′₁ va e′₂ vektorlar bir to‘g‘ri chiziqda — bu bazis emas, T matritsa teskarilanmaydi (2.7-taklif).',
      noEig: '90° ga burishning haqiqiy xos vektorlari yo‘q: hech bir to‘g‘ri chiziq o‘z joyida qolmaydi, diagonal bazis yo‘q.',
      diag: ' M′(φ) diagonal: operator e′₁, e′₂ bazis vektorlarini faqat cho‘zadi.',
    },
  });

  const snap = (x) => Math.round(x * 2) / 2;
  const cl = (x) => (Math.abs(x) < 1e-9 ? 0 : x);
  const mul = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
  const mm = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const det = (A) => A[0][0] * A[1][1] - A[0][1] * A[1][0];
  const inv = (A) => {
    const d = det(A);
    return [[A[1][1] / d, -A[0][1] / d], [-A[1][0] / d, A[0][0] / d]];
  };
  const rank = (A) => (Math.abs(det(A)) > 1e-9 ? 2 : A.flat().some((v) => Math.abs(v) > 1e-9) ? 1 : 0);
  /** Число для TeX: десятичный разделитель по языку, обычный минус. */
  const tn = (x) => U.fmt(cl(x), 3).replace('−', '-').replace(',', '{,}');
  const bm = (A) => '\\begin{bmatrix}' + tn(A[0][0]) + ' & ' + tn(A[0][1]) + '\\\\ ' + tn(A[1][0]) + ' & ' + tn(A[1][1]) + '\\end{bmatrix}';
  const col = (v) => U.pt(cl(v[0]), cl(v[1]));

  function makePlot(fig, label, box) {
    const st = { p: null, w: 0 };
    st.build = () => {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
      if (W === st.w && st.p) return false;
      st.w = W;
      fig.plot.replaceChildren();
      st.p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.62)), x: box.x, y: box.y, equal: true, label });
      st.p.axes({ xLabel: 'x₁', yLabel: 'x₂' });
      return true;
    };
    return st;
  }

  function tag(p, P, s, cls, far) {
    const r = Math.hypot(P[0], P[1]);
    if (r < 0.15) return;
    const k = far ? 18 : 12;
    p.text(P[0], P[1], s, 'lbl ' + cls, { dx: (P[0] / r) * k + (P[0] >= 0 ? 2 : -2), dy: -(P[1] / r) * k + 5, anchor: P[0] >= 0 ? 'start' : 'end', layer: 'main' });
  }

  /** Сетка {a·u + b·v}: линии с шагом 1 в пределах ±N. */
  function grid(p, u, v, N, cls) {
    for (let k = -N; k <= N; k++) {
      p.seg(k * u[0] - N * v[0], k * u[1] - N * v[1], k * u[0] + N * v[0], k * u[1] + N * v[1], cls, 'main');
      p.seg(k * v[0] - N * u[0], k * v[1] - N * u[1], k * v[0] + N * u[0], k * v[1] + N * u[1], cls, 'main');
    }
  }

  /* ------------------- Рисунок 1: матрица оператора, образ сетки, ранг ------------------- */
  MC.widget('op-grid', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const PRE = {
      shear: [[1, 2], [0, 3]],
      rot: [[0, -1], [1, 0]],
      stretch: [[2, 0], [0, 0.5]],
      degen: [[1, 2], [2, 4]],
    };
    const st = { A: PRE.shear.map((r) => r.slice()), x: [1, -1] };
    const sl = {};
    const keys = [['a11', 0, 0, '$\\alpha_{11}$'], ['a21', 1, 0, '$\\alpha_{21}$'], ['a12', 0, 1, '$\\alpha_{12}$'], ['a22', 1, 1, '$\\alpha_{22}$']];
    const sync = () => keys.forEach(([k, i, j]) => sl[k].set(st.A[i][j]));
    const seg = F.seg(['shear', 'rot', 'stretch', 'degen'].map((k) => ({ value: k, label: T[k] })), 'shear', (v) => {
      st.A = PRE[v].map((r) => r.slice());
      sync();
      draw();
    }, T.op);
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, T.op), seg.el));
    keys.forEach(([k, i, j, lab]) => {
      sl[k] = F.slider({ label: lab, min: -3, max: 4, step: 0.5, value: st.A[i][j], fmt: (v) => U.fmt(v, 1), oninput: (v) => {
        st.A[i][j] = v;
        seg.set(null);
        draw();
      } });
      fig.controls.append(sl[k].el);
    });
    const ro = F.readout(fig.readout, [
      { key: 'mx', label: T.mx },
      { key: 'mfx', label: T.mfx },
      { key: 'det', label: T.det },
      { key: 'rank', label: T.rank },
    ]);
    const mat = MC.h('p', { class: 'fig-note' });
    fig.readout.after(mat);
    const P = makePlot(fig, T.aria1, { x: [-5, 5], y: [-4, 6] });
    let hX = null;

    function draw() {
      if (P.build() || !hX) {
        hX = P.p.handle(st.x[0], st.x[1], (pt) => {
          st.x = [snap(U.clamp(pt.x, -4, 4)), snap(U.clamp(pt.y, -3, 4))];
          draw();
        }, '');
      }
      const p = P.p;
      p.clear('main');
      const A = st.A;
      const c1 = [A[0][0], A[1][0]];
      const c2 = [A[0][1], A[1][1]];
      grid(p, c1, c2, 6, 'guide');
      p.polygon([[0, 0], c1, [c1[0] + c2[0], c1[1] + c2[1]], c2], 'poly', 'main');
      const fx = mul(A, st.x);
      p.arrow(0, 0, c1[0], c1[1], 'accent', 'main');
      p.arrow(0, 0, c2[0], c2[1], 'warm', 'main');
      p.arrow(0, 0, st.x[0], st.x[1], 'ink', 'main');
      p.arrow(0, 0, fx[0], fx[1], 'teal', 'main');
      tag(p, c1, 'φ(e₁)', 'accent');
      tag(p, c2, 'φ(e₂)', 'warm');
      tag(p, st.x, 'x', 'ink', true);
      tag(p, fx, 'φ(x)', 'ink');
      hX.place(st.x[0], st.x[1]);
      const r = rank(A);
      ro.set('mx', col(st.x));
      ro.set('mfx', col(fx), 'accent');
      ro.set('det', U.fmt(cl(det(A)), 3));
      ro.set('rank', String(r), r < 2 ? 'warm' : '');
      mat.replaceChildren(F.rich('$M(\\varphi) = ' + bm(A) + ',\\quad ' + bm(A) + '\\begin{bmatrix}' + tn(st.x[0]) + '\\\\ ' + tn(st.x[1]) + '\\end{bmatrix} = \\begin{bmatrix}' + tn(fx[0]) + '\\\\ ' + tn(fx[1]) + '\\end{bmatrix}$'));
      fig.note.className = 'fig-note' + (r === 2 ? ' ok' : '');
      fig.note.textContent = r === 2 ? T.r2 : r === 1 ? T.r1 : T.r0;
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== P.w) {
        hX = null;
        draw();
      }
    });
  });

  /* ------------------- Рисунок 2: смена базиса, M′(φ) = T⁻¹M(φ)T ------------------- */
  MC.widget('change-basis', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const PRE = {
      shear: { A: [[1, 2], [0, 3]], eig: [[1, 0], [1, 1]] },
      rot: { A: [[0, -1], [1, 0]], eig: null },
      refl: { A: [[0, 1], [1, 0]], eig: [[1, 1], [-1, 1]] },
    };
    const st = { op: 'shear', e1: [1, 0.5], e2: [-0.5, 1], x: [2, 1], noEig: false };
    const seg = F.seg(['shear', 'rot', 'refl'].map((k) => ({ value: k, label: T[k] })), st.op, (v) => {
      st.op = v;
      st.noEig = false;
      draw();
    }, T.op);
    const bEig = F.button(null, T.eig, () => {
      const e = PRE[st.op].eig;
      st.noEig = !e;
      if (e) {
        st.e1 = e[0].slice();
        st.e2 = e[1].slice();
      }
      draw();
    });
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, T.op), seg.el), bEig);
    const ro = F.readout(fig.readout, [
      { key: 'mx', label: T.mx },
      { key: 'mpx', label: T.mpx },
      { key: 'tr', label: T.trM },
      { key: 'trp', label: T.trMp },
      { key: 'det', label: T.det },
      { key: 'detp', label: T.detMp },
    ]);
    const mat = MC.h('p', { class: 'fig-note' });
    fig.readout.after(mat);
    const P = makePlot(fig, T.aria2, { x: [-4.5, 4.5], y: [-3.5, 4.5] });
    let h = null;
    const lim = (pt) => [snap(U.clamp(pt.x, -4, 4)), snap(U.clamp(pt.y, -3, 4))];

    function draw() {
      if (P.build() || !h) {
        h = [
          P.p.handle(st.e1[0], st.e1[1], (pt) => {
            st.e1 = lim(pt);
            st.noEig = false;
            draw();
          }, 'accent'),
          P.p.handle(st.e2[0], st.e2[1], (pt) => {
            st.e2 = lim(pt);
            st.noEig = false;
            draw();
          }, 'warm'),
          P.p.handle(st.x[0], st.x[1], (pt) => {
            st.x = lim(pt);
            draw();
          }, ''),
        ];
      }
      const p = P.p;
      p.clear('main');
      const A = PRE[st.op].A;
      const Tm = [[st.e1[0], st.e2[0]], [st.e1[1], st.e2[1]]];
      const ok = Math.abs(det(Tm)) > 1e-9;
      if (ok) grid(p, st.e1, st.e2, 8, 'guide');
      const fx = mul(A, st.x);
      p.seg(0, 0, fx[0], fx[1], 'curve teal dash', 'main');
      p.arrow(0, 0, fx[0], fx[1], 'teal', 'main');
      p.arrow(0, 0, st.e1[0], st.e1[1], 'accent', 'main');
      p.arrow(0, 0, st.e2[0], st.e2[1], 'warm', 'main');
      p.arrow(0, 0, st.x[0], st.x[1], 'ink', 'main');
      tag(p, st.e1, 'e′₁', 'accent', true);
      tag(p, st.e2, 'e′₂', 'warm', true);
      tag(p, st.x, 'x', 'ink', true);
      tag(p, fx, 'φ(x)', 'ink');
      h[0].place(st.e1[0], st.e1[1]);
      h[1].place(st.e2[0], st.e2[1]);
      h[2].place(st.x[0], st.x[1]);
      ro.set('mx', col(st.x));
      ro.set('tr', U.fmt(A[0][0] + A[1][1], 3));
      ro.set('det', U.fmt(det(A), 3));
      if (!ok) {
        ['mpx', 'trp', 'detp'].forEach((k) => ro.set(k, '—'));
        mat.replaceChildren(F.rich('$T = ' + bm(Tm) + ',\\quad |T| = 0$'));
        fig.note.className = 'fig-note';
        fig.note.textContent = T.notBasis;
        return;
      }
      const Ti = inv(Tm);
      const Mp = mm(mm(Ti, A), Tm);
      ro.set('mpx', col(mul(Ti, st.x)), 'accent');
      ro.set('trp', U.fmt(cl(Mp[0][0] + Mp[1][1]), 3), 'accent');
      ro.set('detp', U.fmt(cl(det(Mp)), 3), 'accent');
      mat.replaceChildren(F.rich('$T = ' + bm(Tm) + ',\\quad M(\\varphi) = ' + bm(A) + ',\\quad M\'(\\varphi) = T^{-1}M(\\varphi)T = ' + bm(Mp) + '$'));
      const isDiag = Math.abs(Mp[0][1]) < 1e-9 && Math.abs(Mp[1][0]) < 1e-9;
      fig.note.className = 'fig-note' + (isDiag ? ' ok' : '');
      fig.note.textContent = st.noEig ? T.noEig : isDiag ? T.diag.trim() : '';
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== P.w) {
        h = null;
        draw();
      }
    });
  });
})();
