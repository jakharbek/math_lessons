/* Урок 7.43 «Обратимые операторы» (Куликов, гл. 8, § 4):
 * рисунок 1 «Обратимый и вырожденный оператор плоскости» — матрица M(φ) (столбцы — координаты φ(e₁), φ(e₂)),
 * образ единичного квадрата и сетки, определитель, ранг, дефект, ядро и M(φ⁻¹) (теорема 4.1);
 * рисунок 2 «Произведение операторов и его обратный» — квадрат → ψ → φ → φ⁻¹ → ψ⁻¹,
 * (φψ)⁻¹ = ψ⁻¹φ⁻¹ (упражнение 1), M(φψ) = M(φ)M(ψ) против M(ψφ) (теорема 3.3, некоммутативность). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Обратимый и вырожденный оператор плоскости',
      t2: 'Произведение операторов и его обратный',
      aria1: 'Единичный квадрат и его образ при линейном операторе, образы базисных векторов, образ сетки и ядро вырожденного оператора',
      aria2: 'Единичный квадрат проходит через операторы ψ, φ, затем через φ⁻¹ и ψ⁻¹ и возвращается на место',
      rot: 'поворот', shear: 'сдвиг', stretch: 'растяжение', degen: 'вырожденный', refl: 'отражение',
      preset: 'готовые матрицы', applyInv: 'применить $\\varphi^{-1}$',
      det: '$\\det M(\\varphi)$', rank: 'ранг $\\varphi$', defect: 'дефект $\\varphi$', minv: '$M(\\varphi^{-1})$, строки',
      noInv: 'нет',
      okNote: (d) => 'Определитель ' + d + ' ≠ 0: ядро {0}, дефект 0, ранг 2 — по теореме 4.1 оператор обратим. Образ квадрата — невырожденный параллелограмм площади |det|.',
      okInv: ' Применён φ⁻¹: (φ⁻¹φ)(квадрат) — снова единичный квадрат, φ⁻¹φ = ε.',
      degNote: 'Определитель 0: плоскость сплющена в прямую, ядро (бирюзовая прямая) ненулевое, дефект 1, ранг 1. Все условия (a)–(f) теоремы 4.1 нарушены, φ⁻¹ не существует.',
      zeroNote: 'Нулевой оператор: вся плоскость переходит в точку 0, ядро — вся плоскость, дефект 2, ранг 0.',
      phi: '$\\varphi$', psi: '$\\psi$',
      step: 'шаг', reset: 'сначала', cmp: 'сравнить с $\\psi\\varphi$',
      stepLbl: 'шаг', mpp: '$M(\\varphi\\psi)$, строки', mqp: '$M(\\psi\\varphi)$, строки',
      st: [
        'Шаг 0: единичный квадрат и базис e₁, e₂.',
        'Шаг 1: применён ψ — получен ψ(квадрат).',
        'Шаг 2: применён φ — получен φ(ψ(квадрат)) = (φψ)(квадрат).',
        'Шаг 3: применён φ⁻¹ — вернулись к ψ(квадрат).',
        'Шаг 4: применён ψ⁻¹ — квадрат на месте: (φψ)⁻¹ = ψ⁻¹φ⁻¹, отмена идёт в обратном порядке.',
      ],
      same: ' Здесь M(φψ) = M(ψφ): эти операторы перестановочны.',
      diff: ' M(φψ) ≠ M(ψφ): порядок сомножителей важен.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'An invertible and a degenerate operator of the plane',
      t2: 'A product of operators and its inverse',
      aria1: 'The unit square and its image under a linear operator, images of the basis vectors, the image of the grid and the kernel of a degenerate operator',
      aria2: 'The unit square passes through the operators ψ, φ, then through φ⁻¹ and ψ⁻¹ and returns to its place',
      rot: 'rotation', shear: 'shear', stretch: 'stretch', degen: 'degenerate', refl: 'reflection',
      preset: 'ready matrices', applyInv: 'apply $\\varphi^{-1}$',
      det: '$\\det M(\\varphi)$', rank: 'rank $\\varphi$', defect: 'defect $\\varphi$', minv: '$M(\\varphi^{-1})$, rows',
      noInv: 'none',
      okNote: (d) => 'The determinant is ' + d + ' ≠ 0: kernel {0}, defect 0, rank 2 — by Theorem 4.1 the operator is invertible. The image of the square is a non-degenerate parallelogram of area |det|.',
      okInv: ' φ⁻¹ applied: (φ⁻¹φ)(square) is the unit square again, φ⁻¹φ = ε.',
      degNote: 'The determinant is 0: the plane is squashed onto a line, the kernel (teal line) is non-zero, defect 1, rank 1. All conditions (a)–(f) of Theorem 4.1 fail; φ⁻¹ does not exist.',
      zeroNote: 'The zero operator: the whole plane goes to the point 0, the kernel is the whole plane, defect 2, rank 0.',
      phi: '$\\varphi$', psi: '$\\psi$',
      step: 'step', reset: 'restart', cmp: 'compare with $\\psi\\varphi$',
      stepLbl: 'step', mpp: '$M(\\varphi\\psi)$, rows', mqp: '$M(\\psi\\varphi)$, rows',
      st: [
        'Step 0: the unit square and the basis e₁, e₂.',
        'Step 1: ψ applied — we get ψ(square).',
        'Step 2: φ applied — we get φ(ψ(square)) = (φψ)(square).',
        'Step 3: φ⁻¹ applied — back to ψ(square).',
        'Step 4: ψ⁻¹ applied — the square is back: (φψ)⁻¹ = ψ⁻¹φ⁻¹, undoing goes in reverse order.',
      ],
      same: ' Here M(φψ) = M(ψφ): these operators commute.',
      diff: ' M(φψ) ≠ M(ψφ): the order of factors matters.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Tekislikning teskarilanuvchi va xos operatori',
      t2: 'Operatorlar ko‘paytmasi va unga teskari operator',
      aria1: 'Birlik kvadrat va uning chiziqli operatordagi obrazi, bazis vektorlar obrazlari, to‘r obrazi va xos operator yadrosi',
      aria2: 'Birlik kvadrat ψ, φ operatorlardan, so‘ng φ⁻¹ va ψ⁻¹ dan o‘tib, joyiga qaytadi',
      rot: 'burish', shear: 'siljitish', stretch: 'cho‘zish', degen: 'xos', refl: 'akslantirish',
      preset: 'tayyor matritsalar', applyInv: '$\\varphi^{-1}$ ni qo‘llash',
      det: '$\\det M(\\varphi)$', rank: '$\\varphi$ rangi', defect: '$\\varphi$ defekti', minv: '$M(\\varphi^{-1})$, satrlar',
      noInv: 'yo‘q',
      okNote: (d) => 'Determinant ' + d + ' ≠ 0: yadro {0}, defekt 0, rang 2 — 4.1-teoremaga ko‘ra operator teskarilanuvchi. Kvadrat obrazi — yuzi |det| ga teng xos bo‘lmagan parallelogramm.',
      okInv: ' φ⁻¹ qo‘llandi: (φ⁻¹φ)(kvadrat) — yana birlik kvadrat, φ⁻¹φ = ε.',
      degNote: 'Determinant 0: tekislik to‘g‘ri chiziqqa siqildi, yadro (feruza to‘g‘ri chiziq) noldan farqli, defekt 1, rang 1. 4.1-teoremaning (a)–(f) shartlari bajarilmaydi, φ⁻¹ mavjud emas.',
      zeroNote: 'Nol operator: butun tekislik 0 nuqtaga o‘tadi, yadro — butun tekislik, defekt 2, rang 0.',
      phi: '$\\varphi$', psi: '$\\psi$',
      step: 'qadam', reset: 'boshidan', cmp: '$\\psi\\varphi$ bilan solishtirish',
      stepLbl: 'qadam', mpp: '$M(\\varphi\\psi)$, satrlar', mqp: '$M(\\psi\\varphi)$, satrlar',
      st: [
        '0-qadam: birlik kvadrat va e₁, e₂ bazis.',
        '1-qadam: ψ qo‘llandi — ψ(kvadrat) hosil bo‘ldi.',
        '2-qadam: φ qo‘llandi — φ(ψ(kvadrat)) = (φψ)(kvadrat) hosil bo‘ldi.',
        '3-qadam: φ⁻¹ qo‘llandi — ψ(kvadrat) ga qaytdik.',
        '4-qadam: ψ⁻¹ qo‘llandi — kvadrat joyida: (φψ)⁻¹ = ψ⁻¹φ⁻¹, bekor qilish teskari tartibda boradi.',
      ],
      same: ' Bu yerda M(φψ) = M(ψφ): bu operatorlar o‘rin almashinuvchi.',
      diff: ' M(φψ) ≠ M(ψφ): ko‘paytuvchilar tartibi muhim.',
    },
  });

  // Матрица 2×2 хранится по строкам: [a11, a12, a21, a22]; по Куликову её столбцы — координаты φ(e₁), φ(e₂).
  const app = (m, p) => [m[0] * p[0] + m[1] * p[1], m[2] * p[0] + m[3] * p[1]];
  const mul = (a, b) => [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]];
  const det = (m) => m[0] * m[3] - m[1] * m[2];
  const inv = (m) => {
    const d = det(m);
    return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d];
  };
  const cl = (x) => (Math.abs(x) < 1e-9 ? 0 : x);
  // матрица по строкам: «(a₁₁; a₁₂) (a₂₁; a₂₂)» — разделитель координат по языку
  const mstr = (m) => U.pt(cl(m[0]), cl(m[1])) + ' ' + U.pt(cl(m[2]), cl(m[3]));
  const SQ = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const plotW = (fig) => U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);

  /** Общий каркас: SVG-график с одинаковым масштабом осей, пересоздаётся при смене ширины. */
  function makePlot(fig, label, box) {
    const st = { p: null, w: 0 };
    st.build = () => {
      const W = plotW(fig);
      if (W === st.w && st.p) return false;
      st.w = W;
      fig.plot.replaceChildren();
      st.p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.85 : 0.6)), x: box.x, y: box.y, equal: true, label });
      st.p.axes({ xLabel: 'x₁', yLabel: 'x₂' });
      return true;
    };
    return st;
  }

  /** Образ сетки x = k, y = k (k = −R…R) при матрице m. */
  function grid(p, m, R) {
    for (let k = -R; k <= R; k++) {
      const a = app(m, [k, -R]);
      const b = app(m, [k, R]);
      const c = app(m, [-R, k]);
      const d = app(m, [R, k]);
      p.seg(a[0], a[1], b[0], b[1], 'tgrid' + (k === 0 ? ' axisline' : ''), 'main');
      p.seg(c[0], c[1], d[0], d[1], 'tgrid' + (k === 0 ? ' axisline' : ''), 'main');
    }
  }

  /** Подпись у конца стрелки с отступом наружу. */
  function tag(p, P, s, cls) {
    const r = Math.hypot(P[0], P[1]);
    if (r < 0.15) return;
    p.text(P[0], P[1], s, 'lbl ' + cls, { dx: (P[0] / r) * 12 + (P[0] >= 0 ? 2 : -2), dy: -(P[1] / r) * 12 + 5, anchor: P[0] >= 0 ? 'start' : 'end', layer: 'main' });
  }

  /* ------------------- Рисунок 1: обратимый и вырожденный оператор ------------------- */
  MC.widget('inv-op', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const PRE = { rot: [0, -1, 1, 0], shear: [1, 1, 0, 1], stretch: [2, 0, 0, 0.5], degen: [1, 2, 0.5, 1] };
    const st = { m: [2, 1, 1, 1], inv: false };
    const names = ['a_{11}', 'a_{12}', 'a_{21}', 'a_{22}'];
    const sl = names.map((nm, i) => F.slider({ label: '$' + nm + '$', min: -2, max: 2, step: 0.25, value: st.m[i], fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.m[i] = v;
      pre.set(null);
      draw();
    } }));
    const pre = F.seg(['rot', 'shear', 'stretch', 'degen'].map((k) => ({ value: k, label: T[k] })), null, (k) => {
      st.m = PRE[k].slice();
      sl.forEach((s, i) => s.set(st.m[i]));
      draw();
    }, T.preset);
    const ck = F.check(T.applyInv, false, (v) => {
      st.inv = v;
      draw();
    });
    fig.controls.append(...sl.map((s) => s.el), MC.h('div', { class: 'ctl' }, MC.h('span', null, T.preset), pre.el), ck.el);
    const ro = F.readout(fig.readout, [
      { key: 'det', label: T.det },
      { key: 'rank', label: T.rank },
      { key: 'def', label: T.defect },
      { key: 'inv', label: T.minv },
    ]);
    const P = makePlot(fig, T.aria1, { x: [-3.5, 3.5], y: [-2.8, 2.8] });

    function draw() {
      P.build();
      const p = P.p;
      p.clear('main');
      const m = st.m;
      const d = cl(det(m));
      const zero = m.every((v) => v === 0);
      const ok = d !== 0;
      const show = ok && st.inv ? mul(inv(m), m) : m;
      grid(p, show, 4);
      p.polygon(SQ, 'poly faint', 'main');
      const img = SQ.map((q) => app(show, q));
      p.polygon(img, ok ? 'poly' : 'curve accent', 'main');
      if (!ok && !zero) {
        // ядро: прямая, перпендикулярная ненулевой строке матрицы
        const k = m[0] !== 0 || m[1] !== 0 ? [-m[1], m[0]] : [-m[3], m[2]];
        const r = Math.hypot(k[0], k[1]);
        const u = [k[0] / r, k[1] / r];
        p.seg(-9 * u[0], -9 * u[1], 9 * u[0], 9 * u[1], 'curve teal', 'main');
        const lp = [2.2 * u[0], 2.2 * u[1]];
        p.text(lp[0], lp[1], 'Ker φ', 'lbl ink', { dx: 6, dy: -6, layer: 'main' });
      }
      const f1 = app(show, [1, 0]);
      const f2 = app(show, [0, 1]);
      p.arrow(0, 0, f1[0], f1[1], 'accent', 'main');
      p.arrow(0, 0, f2[0], f2[1], 'warm', 'main');
      const sfx = ok && st.inv ? '' : 'φ';
      tag(p, f1, sfx ? 'φ(e₁)' : 'e₁', 'accent');
      tag(p, f2, sfx ? 'φ(e₂)' : 'e₂', 'warm');

      const rank = zero ? 0 : ok ? 2 : 1;
      ro.set('det', U.fmt(d, 3), ok ? 'accent' : 'warm');
      ro.set('rank', String(rank));
      ro.set('def', String(2 - rank), ok ? '' : 'warm');
      ro.set('inv', ok ? mstr(inv(m)) : T.noInv);
      fig.note.className = 'fig-note' + (ok ? ' ok' : '');
      fig.note.textContent = zero ? T.zeroNote : ok ? T.okNote(U.fmt(d, 3)) + (st.inv ? T.okInv : '') : T.degNote;
    }
    draw();
    window.addEventListener('resize', () => {
      if (plotW(fig) !== P.w) draw();
    });
  });

  /* ------------------- Рисунок 2: (φψ)⁻¹ = ψ⁻¹φ⁻¹ ------------------- */
  MC.widget('compose-inv', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const OPS = { rot: [0, -1, 1, 0], shear: [1, 1, 0, 1], stretch: [2, 0, 0, 1], refl: [1, 0, 0, -1] };
    const keys = ['rot', 'shear', 'stretch', 'refl'];
    const st = { phi: 'rot', psi: 'shear', step: 0, cmp: false };
    const opts = keys.map((k) => ({ value: k, label: T[k] }));
    const sPhi = F.seg(opts, st.phi, (v) => {
      st.phi = v;
      st.step = 0;
      draw();
    }, T.phi);
    const sPsi = F.seg(opts, st.psi, (v) => {
      st.psi = v;
      st.step = 0;
      draw();
    }, T.psi);
    const bStep = F.button(null, T.step, () => {
      st.step = (st.step + 1) % 5;
      draw();
    });
    const bReset = F.button(null, T.reset, () => {
      st.step = 0;
      draw();
    });
    const ck = F.check(T.cmp, false, (v) => {
      st.cmp = v;
      draw();
    });
    fig.controls.append(
      MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.phi)), sPhi.el),
      MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.psi)), sPsi.el),
      MC.h('div', { class: 'ctl' }, bStep, bReset),
      ck.el,
    );
    const ro = F.readout(fig.readout, [
      { key: 'step', label: T.stepLbl },
      { key: 'pp', label: T.mpp },
      { key: 'qp', label: T.mqp },
    ]);
    const P = makePlot(fig, T.aria2, { x: [-4.5, 4.5], y: [-2.6, 2.6] });

    function draw() {
      P.build();
      const p = P.p;
      p.clear('main');
      const A = OPS[st.phi];
      const B = OPS[st.psi];
      const AB = mul(A, B);
      const BA = mul(B, A);
      const I = [1, 0, 0, 1];
      // накопленная матрица после каждого шага: E, ψ, φψ, φ⁻¹φψ = ψ, ψ⁻¹ψ = E
      const chain = [I, B, AB, mul(inv(A), AB), mul(inv(B), mul(inv(A), AB))];
      const cur = chain[st.step];
      p.polygon(SQ, 'poly faint', 'main');
      if (st.cmp) {
        const q = SQ.map((v) => app(BA, v));
        p.path(q.concat([q[0]]), 'curve warm dash', 'main');
      }
      if (st.step > 0) {
        const prev = SQ.map((v) => app(chain[st.step - 1], v));
        p.path(prev.concat([prev[0]]), 'curve faint', 'main');
      }
      p.polygon(SQ.map((v) => app(cur, v)), 'poly', 'main');
      const f1 = app(cur, [1, 0]);
      const f2 = app(cur, [0, 1]);
      p.arrow(0, 0, f1[0], f1[1], 'accent', 'main');
      p.arrow(0, 0, f2[0], f2[1], 'warm', 'main');
      if (st.step === 0 || st.step === 4) {
        tag(p, f1, 'e₁', 'accent');
        tag(p, f2, 'e₂', 'warm');
      }
      ro.set('step', st.step + ' / 4');
      ro.set('pp', mstr(AB), 'accent');
      const same = AB.every((v, i) => Math.abs(v - BA[i]) < 1e-9);
      ro.set('qp', mstr(BA), same ? 'accent' : 'warm');
      fig.note.className = 'fig-note' + (st.step === 4 ? ' ok' : '');
      fig.note.textContent = T.st[st.step] + (same ? T.same : T.diff);
    }
    draw();
    window.addEventListener('resize', () => {
      if (plotW(fig) !== P.w) draw();
    });
  });
})();
