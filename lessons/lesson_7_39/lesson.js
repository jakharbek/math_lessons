/* Урок 7.39 «Евклидовы векторные пространства» (Куликов, гл. 7, § 6):
 * рисунок 1 «Норма и неравенства Коши — Буняковского и треугольника» — два перетаскиваемых вектора,
 * |ab| ≤ ‖a‖·‖b‖ и ‖a + b‖ ≤ ‖a‖ + ‖b‖ (теорема 6.2), вектор a + λb наименьшей нормы (упражнение 5);
 * рисунок 2 «Ортонормированный базис и координаты-проекции» — ортогональный базис b₁, b₂, его нормировка
 * e_i = ‖b_i‖⁻¹b_i (теорема 6.3), координаты αᵢ = aeᵢ и ‖a‖² = α₁² + α₂² (свойства 6.3, 6.4). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Норма, неравенства Коши — Буняковского и треугольника',
      t2: 'Ортонормированный базис и координаты-проекции',
      aria1: 'Векторы a и b, их сумма a + b и параллелограмм на них; прямая a + λb и её ближайший к началу вектор',
      aria2: 'Ортогональный или ортонормированный базис, вектор a и его проекции на базисные направления',
      minNorm: 'наименьшая норма $\\boldsymbol{a} + \\lambda\\boldsymbol{b}$',
      na: '$\\|\\boldsymbol{a}\\|$', nb: '$\\|\\boldsymbol{b}\\|$', ab: '$\\boldsymbol{ab}$', nanb: '$\\|\\boldsymbol{a}\\|\\cdot\\|\\boldsymbol{b}\\|$',
      nsum: '$\\|\\boldsymbol{a} + \\boldsymbol{b}\\|$', sumn: '$\\|\\boldsymbol{a}\\| + \\|\\boldsymbol{b}\\|$',
      cs: (ab, p) => 'Коши — Буняковский: |a·b| = ' + ab + ' ≤ ' + p + '.',
      tri: (s, t) => ' Треугольник: ' + s + ' ≤ ' + t + '.',
      eq: ' Векторы на одной прямой — в (3) равенство (упражнение 10).',
      cos: (c) => ' Косинус угла: ' + c + '.',
      zero: 'Один из векторов нулевой: обе части (3) равны нулю.',
      minNote: (l, ca, cb) => ' Наименьшая норма при λ = ' + l + ': c·b = ' + cb + ', а c·a = ' + ca + ' — вектор c ортогонален к b, а не к a.',
      rot: 'поворот', len1: 'длина $\\boldsymbol{b}_1$', len2: 'длина $\\boldsymbol{b}_2$',
      basis: 'базис', og: 'ортогональный', on: 'ортонормированный',
      coord: (i) => '$\\alpha_' + i + '$', projB: (i) => '$\\boldsymbol{ab}_' + i + '$', projE: (i) => '$\\boldsymbol{ae}_' + i + '$',
      sq: '$\\alpha_1^2 + \\alpha_2^2$', na2: '$\\|\\boldsymbol{a}\\|^2$',
      noteOn: 'Базис ортонормированный: координаты совпадают с проекциями αᵢ = aeᵢ (свойство 6.4), и α₁² + α₂² = ‖a‖² (свойство 6.3).',
      noteOg: (r1, r2) => 'Базис ортогональный, ‖b₁‖ = ' + r1 + ', ‖b₂‖ = ' + r2 + ': координаты αᵢ = abᵢ / ‖bᵢ‖², и α₁² + α₂² ≠ ‖a‖², пока длины не равны 1. Переключите на «ортонормированный».',
      noteOg1: 'Длины векторов равны 1 — этот ортогональный базис уже ортонормированный.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Norm, the Cauchy–Bunyakovsky and triangle inequalities',
      t2: 'An orthonormal basis and coordinates as projections',
      aria1: 'Vectors a and b, their sum a + b and the parallelogram on them; the line a + λb and its vector closest to the origin',
      aria2: 'An orthogonal or orthonormal basis, a vector a and its projections on the basis directions',
      minNorm: 'least norm $\\boldsymbol{a} + \\lambda\\boldsymbol{b}$',
      na: '$\\|\\boldsymbol{a}\\|$', nb: '$\\|\\boldsymbol{b}\\|$', ab: '$\\boldsymbol{ab}$', nanb: '$\\|\\boldsymbol{a}\\|\\cdot\\|\\boldsymbol{b}\\|$',
      nsum: '$\\|\\boldsymbol{a} + \\boldsymbol{b}\\|$', sumn: '$\\|\\boldsymbol{a}\\| + \\|\\boldsymbol{b}\\|$',
      cs: (ab, p) => 'Cauchy–Bunyakovsky: |a·b| = ' + ab + ' ≤ ' + p + '.',
      tri: (s, t) => ' Triangle: ' + s + ' ≤ ' + t + '.',
      eq: ' The vectors are collinear — equality in (3) (exercise 10).',
      cos: (c) => ' Cosine of the angle: ' + c + '.',
      zero: 'One of the vectors is zero: both sides of (3) are zero.',
      minNote: (l, ca, cb) => ' Least norm at λ = ' + l + ': c·b = ' + cb + ', while c·a = ' + ca + ' — c is orthogonal to b, not to a.',
      rot: 'rotation', len1: 'length of $\\boldsymbol{b}_1$', len2: 'length of $\\boldsymbol{b}_2$',
      basis: 'basis', og: 'orthogonal', on: 'orthonormal',
      coord: (i) => '$\\alpha_' + i + '$', projB: (i) => '$\\boldsymbol{ab}_' + i + '$', projE: (i) => '$\\boldsymbol{ae}_' + i + '$',
      sq: '$\\alpha_1^2 + \\alpha_2^2$', na2: '$\\|\\boldsymbol{a}\\|^2$',
      noteOn: 'The basis is orthonormal: the coordinates equal the projections αᵢ = aeᵢ (property 6.4), and α₁² + α₂² = ‖a‖² (property 6.3).',
      noteOg: (r1, r2) => 'The basis is orthogonal, ‖b₁‖ = ' + r1 + ', ‖b₂‖ = ' + r2 + ': the coordinates are αᵢ = abᵢ / ‖bᵢ‖², and α₁² + α₂² ≠ ‖a‖² unless the lengths are 1. Switch to “orthonormal”.',
      noteOg1: 'Both lengths are 1 — this orthogonal basis is already orthonormal.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Norma, Koshi — Bunyakovskiy va uchburchak tengsizliklari',
      t2: 'Ortonormal bazis va koordinatalar — proyeksiyalar',
      aria1: 'a va b vektorlar, ularning yig‘indisi a + b va parallelogramm; a + λb to‘g‘ri chiziq va uning boshga eng yaqin vektori',
      aria2: 'Ortogonal yoki ortonormal bazis, a vektor va uning bazis yo‘nalishlariga proyeksiyalari',
      minNorm: 'eng kichik norma $\\boldsymbol{a} + \\lambda\\boldsymbol{b}$',
      na: '$\\|\\boldsymbol{a}\\|$', nb: '$\\|\\boldsymbol{b}\\|$', ab: '$\\boldsymbol{ab}$', nanb: '$\\|\\boldsymbol{a}\\|\\cdot\\|\\boldsymbol{b}\\|$',
      nsum: '$\\|\\boldsymbol{a} + \\boldsymbol{b}\\|$', sumn: '$\\|\\boldsymbol{a}\\| + \\|\\boldsymbol{b}\\|$',
      cs: (ab, p) => 'Koshi — Bunyakovskiy: |a·b| = ' + ab + ' ≤ ' + p + '.',
      tri: (s, t) => ' Uchburchak: ' + s + ' ≤ ' + t + '.',
      eq: ' Vektorlar bir to‘g‘ri chiziqda — (3) da tenglik (10-mashq).',
      cos: (c) => ' Burchak kosinusi: ' + c + '.',
      zero: 'Vektorlardan biri nol: (3) ning ikkala tomoni nolga teng.',
      minNote: (l, ca, cb) => ' Eng kichik norma λ = ' + l + ' da: c·b = ' + cb + ', c·a = ' + ca + ' — c vektor a ga emas, b ga ortogonal.',
      rot: 'burish', len1: '$\\boldsymbol{b}_1$ uzunligi', len2: '$\\boldsymbol{b}_2$ uzunligi',
      basis: 'bazis', og: 'ortogonal', on: 'ortonormal',
      coord: (i) => '$\\alpha_' + i + '$', projB: (i) => '$\\boldsymbol{ab}_' + i + '$', projE: (i) => '$\\boldsymbol{ae}_' + i + '$',
      sq: '$\\alpha_1^2 + \\alpha_2^2$', na2: '$\\|\\boldsymbol{a}\\|^2$',
      noteOn: 'Bazis ortonormal: koordinatalar proyeksiyalarga teng αᵢ = aeᵢ (6.4-xossa), va α₁² + α₂² = ‖a‖² (6.3-xossa).',
      noteOg: (r1, r2) => 'Bazis ortogonal, ‖b₁‖ = ' + r1 + ', ‖b₂‖ = ' + r2 + ': koordinatalar αᵢ = abᵢ / ‖bᵢ‖², uzunliklar 1 bo‘lmaguncha α₁² + α₂² ≠ ‖a‖². «ortonormal» ga o‘tkazing.',
      noteOg1: 'Ikkala uzunlik 1 ga teng — bu ortogonal bazis allaqachon ortonormal.',
    },
  });

  const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
  const nrm = (u) => Math.hypot(u[0], u[1]);
  const snap = (x) => Math.round(x * 4) / 4;
  const cl = (x) => (Math.abs(x) < 1e-9 ? 0 : x); // убрать шум округления (−2,2e−16 → 0)

  /** Общий каркас: SVG-график с одинаковым масштабом осей, пересоздаётся при смене ширины. */
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

  /** Подпись у конца стрелки с отступом наружу. */
  function tag(p, P, s, cls) {
    if (nrm(P) < 0.15) return;
    const r = nrm(P);
    p.text(P[0], P[1], s, 'lbl ' + cls, { dx: (P[0] / r) * 12 + (P[0] >= 0 ? 2 : -2), dy: -(P[1] / r) * 12 + 5, anchor: P[0] >= 0 ? 'start' : 'end', layer: 'main' });
  }

  /* ------------------- Рисунок 1: норма, Коши — Буняковский, треугольник ------------------- */
  MC.widget('norm-cs', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { a: [2, 1], b: [0.5, 2], min: false };
    const ck = F.check(T.minNorm, false, (v) => {
      st.min = v;
      draw();
    });
    fig.controls.append(ck.el);
    const ro = F.readout(fig.readout, [
      { key: 'na', label: T.na },
      { key: 'nb', label: T.nb },
      { key: 'ab', label: T.ab },
      { key: 'nanb', label: T.nanb },
      { key: 'nsum', label: T.nsum },
      { key: 'sumn', label: T.sumn },
    ]);
    const P = makePlot(fig, T.aria1, { x: [-4, 4], y: [-3, 3.6] });
    let hA = null;
    let hB = null;
    const lim = (pt) => [snap(U.clamp(pt.x, -3.75, 3.75)), snap(U.clamp(pt.y, -2.75, 3.25))];

    function draw() {
      if (P.build() || !hA) {
        hA = P.p.handle(st.a[0], st.a[1], (pt) => {
          st.a = lim(pt);
          draw();
        }, 'accent');
        hB = P.p.handle(st.b[0], st.b[1], (pt) => {
          st.b = lim(pt);
          draw();
        }, 'warm');
      }
      const p = P.p;
      p.clear('main');
      const a = st.a;
      const b = st.b;
      const s = [a[0] + b[0], a[1] + b[1]];
      p.polygon([[0, 0], a, s, b], 'poly faint', 'main');
      if (st.min && nrm(b) > 1e-9) {
        const l0 = -dot(a, b) / dot(b, b);
        const c = [a[0] + l0 * b[0], a[1] + l0 * b[1]];
        const T1 = 12;
        p.seg(a[0] - T1 * b[0], a[1] - T1 * b[1], a[0] + T1 * b[0], a[1] + T1 * b[1], 'guide', 'main');
        if (nrm(c) > 1e-9) {
          // прямой угол между c и b в начале координат
          const u = [c[0] / nrm(c), c[1] / nrm(c)];
          const v = [b[0] / nrm(b), b[1] / nrm(b)];
          const k = 0.22;
          p.path([[u[0] * k, u[1] * k], [u[0] * k + v[0] * k, u[1] * k + v[1] * k], [v[0] * k, v[1] * k]], 'curve faint', 'main');
        }
        p.arrow(0, 0, c[0], c[1], 'teal', 'main');
        tag(p, c, 'c', 'ink');
      }
      p.arrow(0, 0, s[0], s[1], 'ink', 'main');
      p.arrow(0, 0, a[0], a[1], 'accent', 'main');
      p.arrow(0, 0, b[0], b[1], 'warm', 'main');
      tag(p, a, 'a', 'accent');
      tag(p, b, 'b', 'warm');
      tag(p, s, 'a + b', 'ink');
      hA.place(a[0], a[1]);
      hB.place(b[0], b[1]);

      const na = nrm(a);
      const nb = nrm(b);
      const ab = dot(a, b);
      const ns = nrm(s);
      ro.set('na', U.fmt(na, 3));
      ro.set('nb', U.fmt(nb, 3));
      ro.set('ab', U.fmt(ab, 3), 'accent');
      ro.set('nanb', U.fmt(na * nb, 3), 'accent');
      ro.set('nsum', U.fmt(ns, 3));
      ro.set('sumn', U.fmt(na + nb, 3));
      let msg;
      if (na < 1e-9 || nb < 1e-9) msg = T.zero;
      else {
        msg = T.cs(U.fmt(Math.abs(ab), 3), U.fmt(na * nb, 3)) + T.tri(U.fmt(ns, 3), U.fmt(na + nb, 3)) + T.cos(U.fmt(ab / (na * nb), 3));
        if (Math.abs(a[0] * b[1] - a[1] * b[0]) < 1e-9) msg += T.eq;
        if (st.min) {
          const l0 = -ab / dot(b, b);
          const c = [a[0] + l0 * b[0], a[1] + l0 * b[1]];
          msg += T.minNote(U.fmt(l0, 3), U.fmt(cl(dot(c, a)), 3), U.fmt(cl(dot(c, b)), 3));
        }
      }
      fig.note.className = 'fig-note ok';
      fig.note.textContent = msg;
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== P.w) {
        hA = null;
        draw();
      }
    });
  });

  /* ------------------- Рисунок 2: ортонормированный базис и проекции ------------------- */
  MC.widget('orthonormal', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { th: 30, r1: 1.5, r2: 0.75, mode: 'og', a: [1.5, 2] };
    const sRot = F.slider({ label: T.rot, min: 0, max: 180, step: 5, value: st.th, fmt: (v) => U.fmt(v, 0) + '°', oninput: (v) => {
      st.th = v;
      draw();
    } });
    const sL1 = F.slider({ label: T.len1, min: 0.5, max: 2, step: 0.25, value: st.r1, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.r1 = v;
      draw();
    } });
    const sL2 = F.slider({ label: T.len2, min: 0.5, max: 2, step: 0.25, value: st.r2, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.r2 = v;
      draw();
    } });
    const mSeg = F.seg([{ value: 'og', label: T.og }, { value: 'on', label: T.on }], st.mode, (v) => {
      st.mode = v;
      draw();
    }, T.basis);
    const mLab = MC.h('div', { class: 'ctl' }, MC.h('span', null, T.basis), mSeg.el);
    fig.controls.append(sRot.el, sL1.el, sL2.el, mLab);
    const ro = F.readout(fig.readout, [
      { key: 'c1', label: T.coord(1) },
      { key: 'c2', label: T.coord(2) },
      { key: 'p1', label: T.projB(1) },
      { key: 'p2', label: T.projB(2) },
      { key: 'sq', label: T.sq },
      { key: 'na', label: T.na2 },
    ]);
    const P = makePlot(fig, T.aria2, { x: [-3.5, 3.5], y: [-2.6, 3.2] });
    let hA = null;

    function draw() {
      if (P.build() || !hA) {
        hA = P.p.handle(st.a[0], st.a[1], (pt) => {
          st.a = [snap(U.clamp(pt.x, -3.25, 3.25)), snap(U.clamp(pt.y, -2.25, 3))];
          draw();
        }, 'accent');
      }
      const p = P.p;
      p.clear('main');
      const t = (st.th * Math.PI) / 180;
      const d1 = [Math.cos(t), Math.sin(t)];
      const d2 = [-Math.sin(t), Math.cos(t)];
      const on = st.mode === 'on';
      const r1 = on ? 1 : st.r1;
      const r2 = on ? 1 : st.r2;
      const u1 = [d1[0] * r1, d1[1] * r1];
      const u2 = [d2[0] * r2, d2[1] * r2];
      const a = st.a;
      const al1 = dot(a, u1) / (r1 * r1);
      const al2 = dot(a, u2) / (r2 * r2);
      // оси базиса
      const L = 9;
      p.seg(-L * d1[0], -L * d1[1], L * d1[0], L * d1[1], 'guide', 'main');
      p.seg(-L * d2[0], -L * d2[1], L * d2[0], L * d2[1], 'guide', 'main');
      // разложение a = α₁u₁ + α₂u₂: компоненты и проекции (перпендикуляры на оси)
      const c1 = [al1 * u1[0], al1 * u1[1]];
      const c2 = [al2 * u2[0], al2 * u2[1]];
      p.seg(a[0], a[1], c1[0], c1[1], 'curve faint dash', 'main');
      p.seg(a[0], a[1], c2[0], c2[1], 'curve faint dash', 'main');
      p.seg(0, 0, c1[0], c1[1], 'curve accent thin', 'main');
      p.seg(0, 0, c2[0], c2[1], 'curve warm thin', 'main');
      p.arrow(0, 0, u1[0], u1[1], 'accent', 'main');
      p.arrow(0, 0, u2[0], u2[1], 'warm', 'main');
      p.arrow(0, 0, a[0], a[1], 'ink', 'main');
      tag(p, u1, on ? 'e₁' : 'b₁', 'accent');
      tag(p, u2, on ? 'e₂' : 'b₂', 'warm');
      tag(p, a, 'a', 'ink');
      hA.place(a[0], a[1]);

      const pr1 = dot(a, u1);
      const pr2 = dot(a, u2);
      ro.set('c1', U.fmt(al1, 3), 'accent');
      ro.set('c2', U.fmt(al2, 3), 'warm');
      ro.set('p1', U.fmt(pr1, 3), Math.abs(pr1 - al1) < 5e-4 ? 'accent' : '');
      ro.set('p2', U.fmt(pr2, 3), Math.abs(pr2 - al2) < 5e-4 ? 'warm' : '');
      ro.set('sq', U.fmt(al1 * al1 + al2 * al2, 3));
      ro.set('na', U.fmt(dot(a, a), 3));
      fig.note.className = 'fig-note' + (on ? ' ok' : '');
      fig.note.textContent = on ? T.noteOn : st.r1 === 1 && st.r2 === 1 ? T.noteOg1 : T.noteOg(U.fmt(st.r1, 2), U.fmt(st.r2, 2));
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== P.w) {
        hA = null;
        draw();
      }
    });
  });
})();
