/* Урок 7.44 «Собственные векторы и собственные значения. Характеристические уравнения» (Куликов, гл. 8, § 5):
 * рисунок 1 «Собственные направления» — единичный вектор x поворачивается, рядом его образ Ax; когда Ax
 * лежит на прямой x, вектор собственный (Ax = λx); характеристический многочлен λ² − (tr A)λ + |A| и его корни;
 * рисунок 2 «Диагонализация: T⁻¹AT» — сетка в стандартном базисе и в базисе из собственных векторов при
 * плавном переходе от E к A; в собственном базисе клетки только растягиваются (теоремы 5.9, 5.10). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Собственные направления: где $A\\boldsymbol{x}$ лежит на прямой $\\boldsymbol{x}$',
      t2: 'Диагонализация: $T^{-1}AT$ в базисе из собственных векторов',
      aria1: 'Единичный вектор x, его образ Ax и прямые собственных векторов матрицы A',
      aria2: 'Сетка плоскости и её образ при плавном переходе от единичной матрицы к матрице A',
      mat: 'матрица', angle: 'угол $\\boldsymbol{x}$', step: 'шаг $t$', grid: 'сетка',
      std: 'стандартная', eig: 'собственная', show: 'показать собственные прямые',
      pSym: 'симметрическая', pEx: 'пример книги', pRot: 'поворот', pShear: 'сдвиг', pHom: 'гомотетия',
      char: 'характ. многочлен', roots: 'корни', ratio: '$|A\\boldsymbol{x}| / |\\boldsymbol{x}|$', ang: 'угол между $\\boldsymbol{x}$ и $A\\boldsymbol{x}$',
      l1: '$\\lambda_1$', l2: '$\\lambda_2$', x1: '$X_1$', x2: '$X_2$', dm: '$T^{-1}AT$',
      none: 'нет действительных',
      hit: (l) => 'Вектор x собственный: Ax = ' + l + '·x — образ лежит на той же прямой.',
      miss: 'Ax не лежит на прямой x — вектор не собственный. Поворачивайте x, пока стрелки не окажутся на одной прямой.',
      rotNote: 'Поворот на 90°: ни один ненулевой вектор не остаётся на своей прямой — действительных собственных значений нет (пример 3 книги).',
      homNote: 'Гомотетия: каждый ненулевой вектор собственный, λ = 1,5 (пример 1 книги).',
      shearNote: 'Сдвиг: λ = 1 двукратный, собственные векторы — только на оси x₁; базиса из собственных векторов нет (упражнение 21).',
      dStd: (t) => 'Стандартная сетка: клетки перекашиваются. При t = ' + t + ' матрица равна (1 − t)E + tA.',
      dEig: 'Собственная сетка: её линии остаются на месте, клетки только растягиваются по осям X₁ и X₂ — в этом базисе матрица оператора диагональна.',
      dNo: 'У этой матрицы нет двух независимых собственных векторов: собственную сетку построить нельзя (упражнение 21).',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Eigendirections: where $A\\boldsymbol{x}$ lies on the line of $\\boldsymbol{x}$',
      t2: 'Diagonalization: $T^{-1}AT$ in a basis of eigenvectors',
      aria1: 'A unit vector x, its image Ax and the lines of eigenvectors of the matrix A',
      aria2: 'A grid of the plane and its image as the matrix moves smoothly from the identity to A',
      mat: 'matrix', angle: 'angle of $\\boldsymbol{x}$', step: 'step $t$', grid: 'grid',
      std: 'standard', eig: 'eigen', show: 'show eigenlines',
      pSym: 'symmetric', pEx: 'book example', pRot: 'rotation', pShear: 'shear', pHom: 'homothety',
      char: 'char. polynomial', roots: 'roots', ratio: '$|A\\boldsymbol{x}| / |\\boldsymbol{x}|$', ang: 'angle between $\\boldsymbol{x}$ and $A\\boldsymbol{x}$',
      l1: '$\\lambda_1$', l2: '$\\lambda_2$', x1: '$X_1$', x2: '$X_2$', dm: '$T^{-1}AT$',
      none: 'no real ones',
      hit: (l) => 'x is an eigenvector: Ax = ' + l + '·x — the image lies on the same line.',
      miss: 'Ax is off the line of x — not an eigenvector. Turn x until the two arrows are on one line.',
      rotNote: 'Rotation by 90°: no nonzero vector stays on its line — there are no real eigenvalues (the book’s example 3).',
      homNote: 'Homothety: every nonzero vector is an eigenvector, λ = 1.5 (the book’s example 1).',
      shearNote: 'Shear: λ = 1 is double, eigenvectors lie only on the x₁-axis; there is no basis of eigenvectors (exercise 21).',
      dStd: (t) => 'Standard grid: the cells get skewed. At t = ' + t + ' the matrix is (1 − t)E + tA.',
      dEig: 'Eigen grid: its lines stay in place, the cells are only stretched along X₁ and X₂ — in this basis the operator’s matrix is diagonal.',
      dNo: 'This matrix has no two independent eigenvectors: an eigen grid cannot be built (exercise 21).',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Xos yo‘nalishlar: $A\\boldsymbol{x}$ qayerda $\\boldsymbol{x}$ to‘g‘ri chizig‘ida yotadi',
      t2: 'Diagonallashtirish: xos vektorlar bazisida $T^{-1}AT$',
      aria1: 'Birlik x vektor, uning Ax tasviri va A matritsaning xos vektorlari to‘g‘ri chiziqlari',
      aria2: 'Tekislik to‘ri va birlik matritsadan A ga ravon o‘tishdagi tasviri',
      mat: 'matritsa', angle: '$\\boldsymbol{x}$ burchagi', step: '$t$ qadam', grid: 'to‘r',
      std: 'standart', eig: 'xos', show: 'xos to‘g‘ri chiziqlarni ko‘rsatish',
      pSym: 'simmetrik', pEx: 'kitob misoli', pRot: 'burish', pShear: 'siljitish', pHom: 'gomotetiya',
      char: 'xarakt. ko‘phad', roots: 'ildizlar', ratio: '$|A\\boldsymbol{x}| / |\\boldsymbol{x}|$', ang: '$\\boldsymbol{x}$ va $A\\boldsymbol{x}$ orasidagi burchak',
      l1: '$\\lambda_1$', l2: '$\\lambda_2$', x1: '$X_1$', x2: '$X_2$', dm: '$T^{-1}AT$',
      none: 'haqiqiylari yo‘q',
      hit: (l) => 'x — xos vektor: Ax = ' + l + '·x — tasvir o‘sha to‘g‘ri chiziqda yotadi.',
      miss: 'Ax x ning to‘g‘ri chizig‘ida emas — vektor xos emas. Ikki strelka bir to‘g‘ri chiziqqa tushguncha x ni buring.',
      rotNote: '90° ga burish: hech bir nolmas vektor o‘z to‘g‘ri chizig‘ida qolmaydi — haqiqiy xos qiymatlar yo‘q (kitobning 3-misoli).',
      homNote: 'Gomotetiya: har bir nolmas vektor xos, λ = 1,5 (kitobning 1-misoli).',
      shearNote: 'Siljitish: λ = 1 ikki karrali, xos vektorlar faqat x₁ o‘qida; xos vektorlardan bazis yo‘q (21-mashq).',
      dStd: (t) => 'Standart to‘r: kataklar qiyshayadi. t = ' + t + ' da matritsa (1 − t)E + tA ga teng.',
      dEig: 'Xos to‘r: chiziqlari joyida qoladi, kataklar faqat X₁ va X₂ o‘qlari bo‘yicha cho‘ziladi — bu bazisda operator matritsasi diagonal.',
      dNo: 'Bu matritsada ikkita chiziqli erkli xos vektor yo‘q: xos to‘rni qurib bo‘lmaydi (21-mashq).',
    },
  });

  const nrm = (u) => Math.hypot(u[0], u[1]);
  const mul = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
  const cl = (x) => (Math.abs(x) < 1e-9 ? 0 : x);

  /** Собственные значения и векторы действительной 2×2-матрицы. */
  function eig(A) {
    const tr = A[0][0] + A[1][1];
    const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
    const D = tr * tr - 4 * det;
    if (D < -1e-12) return { tr, det, real: false };
    const s = Math.sqrt(Math.max(D, 0));
    const ls = [(tr + s) / 2, (tr - s) / 2];
    const vecs = [];
    ls.forEach((l) => {
      const a = A[0][0] - l;
      const b = A[0][1];
      const c = A[1][0];
      const d = A[1][1] - l;
      let v;
      if (Math.abs(a) + Math.abs(b) > 1e-9) v = [-b, a];
      else if (Math.abs(c) + Math.abs(d) > 1e-9) v = [-d, c];
      else v = null; // A = lE
      if (v) {
        const r = nrm(v);
        const sg = Math.abs(v[0]) > 1e-9 ? Math.sign(v[0]) : Math.sign(v[1]);
        vecs.push([cl((sg * v[0]) / r), cl((sg * v[1]) / r)]);
      } else vecs.push(null);
    });
    return { tr, det, real: true, ls, vecs, D };
  }

  const PRESETS = {
    sym: [[2, 1], [1, 2]],
    ex: [[1, 1], [2, 1]],
    rot: [[0, -1], [1, 0]],
    shear: [[1, 1], [0, 1]],
    hom: [[1.5, 0], [0, 1.5]],
  };

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

  function tag(p, P, s, cls) {
    const r = nrm(P);
    if (r < 0.15) return;
    p.text(P[0], P[1], s, 'lbl ' + cls, { dx: (P[0] / r) * 12 + (P[0] >= 0 ? 2 : -2), dy: -(P[1] / r) * 12 + 5, anchor: P[0] >= 0 ? 'start' : 'end', layer: 'main' });
  }

  const polyStr = (e) => 'λ² ' + (e.tr >= 0 ? '− ' : '+ ') + U.fmt(Math.abs(e.tr), 2) + 'λ ' + (e.det >= 0 ? '+ ' : '− ') + U.fmt(Math.abs(e.det), 2);

  /* ------------------- Рисунок 1: собственные направления ------------------- */
  MC.widget('eigen-dirs', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { key: 'sym', th: 20, lines: true };
    const sSeg = F.seg([
      { value: 'sym', label: T.pSym }, { value: 'ex', label: T.pEx }, { value: 'rot', label: T.pRot },
      { value: 'shear', label: T.pShear }, { value: 'hom', label: T.pHom },
    ], st.key, (v) => {
      st.key = v;
      draw();
    }, T.mat);
    const sAng = F.slider({ label: T.angle, min: 0, max: 180, step: 1, value: st.th, fmt: (v) => U.fmt(v, 0) + '°', oninput: (v) => {
      st.th = v;
      draw();
    } });
    const ck = F.check(T.show, true, (v) => {
      st.lines = v;
      draw();
    });
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, T.mat), sSeg.el), sAng.el, ck.el);
    const ro = F.readout(fig.readout, [
      { key: 'char', label: T.char },
      { key: 'roots', label: T.roots },
      { key: 'ratio', label: T.ratio },
      { key: 'ang', label: T.ang },
    ]);
    const P = makePlot(fig, T.aria1, { x: [-3.6, 3.6], y: [-3, 3.4] });

    function draw() {
      P.build();
      const p = P.p;
      p.clear('main');
      const A = PRESETS[st.key];
      const e = eig(A);
      // единичная окружность и её образ (эллипс)
      const circ = [];
      const img = [];
      for (let k = 0; k <= 96; k++) {
        const t = (2 * Math.PI * k) / 96;
        const v = [Math.cos(t), Math.sin(t)];
        circ.push(v);
        img.push(mul(A, v));
      }
      p.path(circ, 'curve faint', 'main');
      p.path(img, 'curve faint dash', 'main');
      if (st.lines && e.real) {
        e.vecs.forEach((v) => {
          if (v) p.seg(-9 * v[0], -9 * v[1], 9 * v[0], 9 * v[1], 'guide', 'main');
        });
      }
      const t = (st.th * Math.PI) / 180;
      const x = [Math.cos(t), Math.sin(t)];
      const Ax = mul(A, x);
      p.seg(-9 * x[0], -9 * x[1], 9 * x[0], 9 * x[1], 'curve faint thin', 'main');
      p.arrow(0, 0, Ax[0], Ax[1], 'warm', 'main');
      p.arrow(0, 0, x[0], x[1], 'accent', 'main');
      tag(p, x, 'x', 'accent');
      tag(p, Ax, 'Ax', 'warm');

      ro.set('char', polyStr(e));
      ro.set('roots', e.real ? (Math.abs(e.ls[0] - e.ls[1]) < 1e-9 ? U.fmt(e.ls[0], 3) + ' (×2)' : U.fmt(e.ls[0], 3) + '; ' + U.fmt(e.ls[1], 3)) : T.none);
      const r = nrm(Ax);
      ro.set('ratio', U.fmt(r, 3));
      const cross = x[0] * Ax[1] - x[1] * Ax[0];
      const dt = x[0] * Ax[0] + x[1] * Ax[1];
      const ang = (Math.atan2(Math.abs(cross), dt) * 180) / Math.PI;
      ro.set('ang', U.fmt(ang, 1) + '°', Math.abs(cross) < 0.02 ? 'accent' : '');
      let msg;
      let ok = false;
      if (st.key === 'rot') msg = T.rotNote;
      else if (st.key === 'hom') {
        msg = T.homNote;
        ok = true;
      } else if (Math.abs(cross) < 0.02) {
        msg = T.hit(U.fmt(cl(dt), 2));
        ok = true;
      } else msg = T.miss;
      if (st.key === 'shear' && !ok) msg += ' ' + T.shearNote;
      fig.note.className = 'fig-note' + (ok ? ' ok' : '');
      fig.note.textContent = msg;
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== P.w) draw();
    });
  });

  /* ------------------- Рисунок 2: диагонализация ------------------- */
  const DPRE = {
    a: [[2, 3], [1, 4]],
    b: [[3, 2], [2, 3]],
    c: [[1, 1], [0, -1]],
    d: [[1, 1], [0, 1]],
  };
  const DLAB = { a: '16 (b)', b: '17 (c)', c: '17 (a)', d: '21' };

  MC.widget('diagonalize', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { key: 'a', t: 1, mode: 'std' };
    const mSeg = F.seg(Object.keys(DPRE).map((k) => ({ value: k, label: DLAB[k] })), st.key, (v) => {
      st.key = v;
      draw();
    }, T.mat);
    const gSeg = F.seg([{ value: 'std', label: T.std }, { value: 'eig', label: T.eig }], st.mode, (v) => {
      st.mode = v;
      draw();
    }, T.grid);
    const sT = F.slider({ label: T.step, min: 0, max: 1, step: 0.05, value: st.t, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.t = v;
      draw();
    } });
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, T.mat), mSeg.el), MC.h('div', { class: 'ctl' }, MC.h('span', null, T.grid), gSeg.el), sT.el);
    const ro = F.readout(fig.readout, [
      { key: 'l1', label: T.l1 },
      { key: 'l2', label: T.l2 },
      { key: 'x1', label: T.x1 },
      { key: 'x2', label: T.x2 },
      { key: 'dm', label: T.dm },
    ]);
    const P = makePlot(fig, T.aria2, { x: [-6, 6], y: [-5, 5.6] });

    function draw() {
      P.build();
      const p = P.p;
      p.clear('main');
      const A = DPRE[st.key];
      const t = st.t;
      const M = [[1 - t + t * A[0][0], t * A[0][1]], [t * A[1][0], 1 - t + t * A[1][1]]];
      const e = eig(A);
      const diag = e.real && e.vecs[0] && e.vecs[1] && Math.abs(e.vecs[0][0] * e.vecs[1][1] - e.vecs[0][1] * e.vecs[1][0]) > 1e-6;
      let b1 = [1, 0];
      let b2 = [0, 1];
      const eigMode = st.mode === 'eig' && diag;
      if (eigMode) {
        b1 = e.vecs[0];
        b2 = e.vecs[1];
      }
      const N = 3;
      for (let i = -N; i <= N; i++) {
        const a0 = [i * b1[0] - N * b2[0], i * b1[1] - N * b2[1]];
        const a1 = [i * b1[0] + N * b2[0], i * b1[1] + N * b2[1]];
        const c0 = [i * b2[0] - N * b1[0], i * b2[1] - N * b1[1]];
        const c1 = [i * b2[0] + N * b1[0], i * b2[1] + N * b1[1]];
        p.seg(a0[0], a0[1], a1[0], a1[1], 'guide', 'main');
        p.seg(c0[0], c0[1], c1[0], c1[1], 'guide', 'main');
        const A0 = mul(M, a0);
        const A1 = mul(M, a1);
        const C0 = mul(M, c0);
        const C1 = mul(M, c1);
        p.seg(A0[0], A0[1], A1[0], A1[1], 'curve faint thin', 'main');
        p.seg(C0[0], C0[1], C1[0], C1[1], 'curve faint thin', 'main');
      }
      const s = [b1[0] + b2[0], b1[1] + b2[1]];
      p.polygon([[0, 0], mul(M, b1), mul(M, s), mul(M, b2)], 'poly', 'main');
      const Mb1 = mul(M, b1);
      const Mb2 = mul(M, b2);
      p.arrow(0, 0, Mb1[0], Mb1[1], 'accent', 'main');
      p.arrow(0, 0, Mb2[0], Mb2[1], 'warm', 'main');
      tag(p, Mb1, eigMode ? 'X₁' : 'e₁', 'accent');
      tag(p, Mb2, eigMode ? 'X₂' : 'e₂', 'warm');

      if (diag) {
        ro.set('l1', U.fmt(e.ls[0], 3), 'accent');
        ro.set('l2', U.fmt(e.ls[1], 3), 'warm');
        ro.set('x1', U.pt(e.vecs[0][0], e.vecs[0][1], 2), 'accent');
        ro.set('x2', U.pt(e.vecs[1][0], e.vecs[1][1], 2), 'warm');
        ro.set('dm', 'diag(' + U.fmt(e.ls[0], 3) + ', ' + U.fmt(e.ls[1], 3) + ')');
      } else {
        ro.set('l1', e.real ? U.fmt(e.ls[0], 3) : '—');
        ro.set('l2', e.real ? U.fmt(e.ls[1], 3) : '—');
        ro.set('x1', '—');
        ro.set('x2', '—');
        ro.set('dm', '—');
      }
      let msg;
      if (!diag) msg = T.dNo;
      else msg = st.mode === 'eig' ? T.dEig : T.dStd(U.fmt(t, 2));
      fig.note.className = 'fig-note' + (diag && st.mode === 'eig' ? ' ok' : '');
      fig.note.textContent = msg;
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== P.w) draw();
    });
  });
})();
