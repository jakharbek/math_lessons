/* Урок 7.40 «Линейные отображения» (Куликов, гл. 8, § 1):
 * рисунок 1 «Линейный оператор плоскости задаётся образами базиса» — перетаскиваемые φ(e₁), φ(e₂) и вектор x;
 * образ координатной сетки и единичного квадрата, φ(x) = x₁φ(e₁) + x₂φ(e₂) (формула (1), теорема 1.1);
 * рисунок 2 «Ядро и образ» — оператор ранга 2, 1 или 0, его ядро и образ, прообраз φ⁻¹(φ(x)) = x + Ker φ
 * (теорема 1.4, упражнение 3). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Линейный оператор плоскости задаётся образами базиса',
      t2: 'Ядро и образ линейного оператора',
      aria1: 'Координатная сетка и её образ при линейном операторе; образы базисных векторов и вектора x',
      aria2: 'Ядро и образ линейного оператора плоскости, вектор x, его образ и прообраз этого образа',
      preset: 'оператор',
      own: 'свой',
      proj: 'проектирование',
      rot: 'поворот',
      shear: 'сдвиг',
      degen: 'вырожденный',
      e1: '$\\varphi(\\boldsymbol{e}_1)$', e2: '$\\varphi(\\boldsymbol{e}_2)$', x: '$\\boldsymbol{x}$', fx: '$\\varphi(\\boldsymbol{x})$',
      sum: (x1, x2, r) => 'φ(x) = ' + x1 + '·φ(e₁) + ' + x2 + '·φ(e₂) = ' + r + ' — формула (1): образ любого вектора определяется образами базиса (теорема 1.1).',
      r2: ' Векторы φ(e₁), φ(e₂) линейно независимы: сетка переходит в сетку, ранг φ равен 2, ядро нулевое.',
      r1: ' Векторы φ(e₁), φ(e₂) коллинеарны: вся плоскость сжимается в прямую, ранг φ равен 1, дефект — 1.',
      r0: ' φ(e₁) = φ(e₂) = 0: это нулевой оператор, ранг 0, дефект 2.',
      rank: 'ранг',
      kerDir: 'направление ядра',
      imDir: 'направление образа',
      dimK: '$\\dim\\mathscr{K}er\\,\\varphi$', dimI: '$\\dim\\mathscr{I}m\\,\\varphi$', dsum: 'сумма',
      fib: 'прообраз $\\varphi^{-1}(\\varphi(\\boldsymbol{x}))$',
      n2: 'Ранг 2: ядро — только нулевой вектор, образ — вся плоскость; 0 + 2 = 2 = dim V (теорема 1.4). Оператор инъективен: разные x дают разные φ(x).',
      n1: (s) => 'Ранг 1: ядро — прямая, образ — прямая; 1 + 1 = 2 = dim V (теорема 1.4).' + s,
      n0: 'Ранг 0: нулевой оператор, ядро — вся плоскость, образ — {0}; 2 + 0 = 2 = dim V.',
      inKer: ' Вектор x лежит в ядре: φ(x) = 0.',
      fibNote: ' Все векторы пунктирной прямой x + Ker φ переходят в тот же φ(x) (упражнение 3).',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'A linear operator of the plane is determined by the images of a basis',
      t2: 'The kernel and the image of a linear operator',
      aria1: 'The coordinate grid and its image under a linear operator; images of the basis vectors and of the vector x',
      aria2: 'The kernel and the image of a linear operator of the plane, a vector x, its image and the preimage of that image',
      preset: 'operator',
      own: 'custom',
      proj: 'projection',
      rot: 'rotation',
      shear: 'shear',
      degen: 'degenerate',
      e1: '$\\varphi(\\boldsymbol{e}_1)$', e2: '$\\varphi(\\boldsymbol{e}_2)$', x: '$\\boldsymbol{x}$', fx: '$\\varphi(\\boldsymbol{x})$',
      sum: (x1, x2, r) => 'φ(x) = ' + x1 + '·φ(e₁) + ' + x2 + '·φ(e₂) = ' + r + ' — formula (1): the image of every vector is determined by the images of the basis (theorem 1.1).',
      r2: ' φ(e₁), φ(e₂) are linearly independent: the grid goes to a grid, rank φ = 2, the kernel is zero.',
      r1: ' φ(e₁), φ(e₂) are collinear: the whole plane collapses onto a line, rank φ = 1, nullity 1.',
      r0: ' φ(e₁) = φ(e₂) = 0: this is the zero operator, rank 0, nullity 2.',
      rank: 'rank',
      kerDir: 'kernel direction',
      imDir: 'image direction',
      dimK: '$\\dim\\mathscr{K}er\\,\\varphi$', dimI: '$\\dim\\mathscr{I}m\\,\\varphi$', dsum: 'sum',
      fib: 'preimage $\\varphi^{-1}(\\varphi(\\boldsymbol{x}))$',
      n2: 'Rank 2: the kernel is only the zero vector, the image is the whole plane; 0 + 2 = 2 = dim V (theorem 1.4). The operator is injective: different x give different φ(x).',
      n1: (s) => 'Rank 1: the kernel is a line, the image is a line; 1 + 1 = 2 = dim V (theorem 1.4).' + s,
      n0: 'Rank 0: the zero operator, the kernel is the whole plane, the image is {0}; 2 + 0 = 2 = dim V.',
      inKer: ' The vector x lies in the kernel: φ(x) = 0.',
      fibNote: ' All vectors of the dashed line x + Ker φ go to the same φ(x) (exercise 3).',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Tekislikning chiziqli operatori bazis obrazlari bilan aniqlanadi',
      t2: 'Chiziqli operatorning yadrosi va obrazi',
      aria1: 'Koordinata to‘ri va uning chiziqli operatordagi obrazi; bazis vektorlari va x vektorining obrazlari',
      aria2: 'Tekislik chiziqli operatorining yadrosi va obrazi, x vektor, uning obrazi va shu obrazning proobrazi',
      preset: 'operator',
      own: 'o‘zingizniki',
      proj: 'proyeksiyalash',
      rot: 'burish',
      shear: 'siljitish',
      degen: 'xos',
      e1: '$\\varphi(\\boldsymbol{e}_1)$', e2: '$\\varphi(\\boldsymbol{e}_2)$', x: '$\\boldsymbol{x}$', fx: '$\\varphi(\\boldsymbol{x})$',
      sum: (x1, x2, r) => 'φ(x) = ' + x1 + '·φ(e₁) + ' + x2 + '·φ(e₂) = ' + r + ' — (1) formula: har qanday vektor obrazi bazis obrazlari bilan aniqlanadi (1.1-teorema).',
      r2: ' φ(e₁), φ(e₂) chiziqli erkli: to‘r to‘rga o‘tadi, φ ning rangi 2, yadro nol.',
      r1: ' φ(e₁), φ(e₂) kollinear: butun tekislik to‘g‘ri chiziqqa siqiladi, rang 1, defekt 1.',
      r0: ' φ(e₁) = φ(e₂) = 0: bu nol operator, rang 0, defekt 2.',
      rank: 'rang',
      kerDir: 'yadro yo‘nalishi',
      imDir: 'obraz yo‘nalishi',
      dimK: '$\\dim\\mathscr{K}er\\,\\varphi$', dimI: '$\\dim\\mathscr{I}m\\,\\varphi$', dsum: 'yig‘indi',
      fib: 'proobraz $\\varphi^{-1}(\\varphi(\\boldsymbol{x}))$',
      n2: 'Rang 2: yadro faqat nol vektor, obraz butun tekislik; 0 + 2 = 2 = dim V (1.4-teorema). Operator inyektiv: turli x lar turli φ(x) beradi.',
      n1: (s) => 'Rang 1: yadro to‘g‘ri chiziq, obraz to‘g‘ri chiziq; 1 + 1 = 2 = dim V (1.4-teorema).' + s,
      n0: 'Rang 0: nol operator, yadro butun tekislik, obraz {0}; 2 + 0 = 2 = dim V.',
      inKer: ' x vektor yadroda yotadi: φ(x) = 0.',
      fibNote: ' Punktir to‘g‘ri chiziq x + Ker φ dagi barcha vektorlar o‘sha φ(x) ga o‘tadi (3-mashq).',
    },
  });

  const nrm = (u) => Math.hypot(u[0], u[1]);
  const snap = (x) => Math.round(x * 4) / 4;
  const cl = (x) => (Math.abs(x) < 1e-9 ? 0 : x);

  /** SVG-график с одинаковым масштабом осей; пересоздаётся при смене ширины контейнера. */
  function makePlot(fig, label, box) {
    const st = { p: null, w: 0 };
    st.width = () => U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    st.build = () => {
      const W = st.width();
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
    const r = nrm(P);
    if (r < 0.15) return;
    p.text(P[0], P[1], s, 'lbl ' + cls, { dx: (P[0] / r) * 16 + (P[0] >= 0 ? 4 : -4), dy: -(P[1] / r) * 16 + 5, anchor: P[0] >= 0 ? 'start' : 'end', layer: 'main' });
  }

  /* ---------------- Рисунок 1: оператор задаётся образами базиса ---------------- */
  const PRESETS = {
    eps: [[1, 0], [0, 1]],
    hom: [[1.5, 0], [0, 1.5]],
    proj: [[1, 0], [-1, 0]],
    rot: [[0, 1], [-1, 0]],
    shear: [[1, 0], [1, 1]],
    degen: [[1, 0.5], [2, 1]],
  };

  MC.widget('linmap', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { c1: [1.5, 0.5], c2: [0.5, 1.25], x: [1.5, 1], preset: 'own' };
    const seg = F.seg(
      [
        { value: 'own', label: T.own },
        { value: 'eps', label: '$\\varepsilon$' },
        { value: 'hom', label: '$1{,}5\\,\\varepsilon$' },
        { value: 'proj', label: T.proj },
        { value: 'rot', label: T.rot },
        { value: 'shear', label: T.shear },
        { value: 'degen', label: T.degen },
      ],
      st.preset,
      (v) => {
        st.preset = v;
        if (PRESETS[v]) {
          st.c1 = PRESETS[v][0].slice();
          st.c2 = PRESETS[v][1].slice();
        }
        draw();
      },
      T.preset,
    );
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, T.preset), seg.el));
    const ro = F.readout(fig.readout, [
      { key: 'e1', label: T.e1 },
      { key: 'e2', label: T.e2 },
      { key: 'x', label: T.x },
      { key: 'fx', label: T.fx },
    ]);
    const P = makePlot(fig, T.aria1, { x: [-3.6, 3.6], y: [-2.8, 3.2] });
    let h1 = null;
    let h2 = null;
    let hx = null;
    const lim = (pt) => [snap(U.clamp(pt.x, -3.25, 3.25)), snap(U.clamp(pt.y, -2.5, 3))];
    const own = () => {
      if (st.preset !== 'own') {
        st.preset = 'own';
        seg.set('own');
      }
    };

    function draw() {
      if (P.build() || !h1) {
        h1 = P.p.handle(st.c1[0], st.c1[1], (pt) => {
          st.c1 = lim(pt);
          own();
          draw();
        }, 'accent');
        h2 = P.p.handle(st.c2[0], st.c2[1], (pt) => {
          st.c2 = lim(pt);
          own();
          draw();
        }, 'warm');
        hx = P.p.handle(st.x[0], st.x[1], (pt) => {
          st.x = lim(pt);
          draw();
        }, '');
      }
      const p = P.p;
      p.clear('main');
      const { c1, c2, x } = st;
      const A = (v) => [v[0] * c1[0] + v[1] * c2[0], v[0] * c1[1] + v[1] * c2[1]];
      // образ координатной сетки: прямые x₁ = k и x₂ = k переходят в прямые (или в точки/одну прямую)
      for (let k = -6; k <= 6; k++) {
        const a1 = A([k, -8]);
        const b1 = A([k, 8]);
        const a2 = A([-8, k]);
        const b2 = A([8, k]);
        p.seg(a1[0], a1[1], b1[0], b1[1], 'curve faint thin', 'main');
        p.seg(a2[0], a2[1], b2[0], b2[1], 'curve faint thin', 'main');
      }
      // образ единичного квадрата
      p.polygon([[0, 0], c1, [c1[0] + c2[0], c1[1] + c2[1]], c2], 'poly', 'main');
      // исходный базис
      p.arrow(0, 0, 1, 0, 'ink ghost-arrow', 'main');
      p.arrow(0, 0, 0, 1, 'ink ghost-arrow', 'main');
      const fx = A(x);
      // разложение φ(x) = x₁φ(e₁) + x₂φ(e₂)
      const k1 = [x[0] * c1[0], x[0] * c1[1]];
      p.path([[0, 0], k1, fx], 'curve teal dash thin', 'main');
      p.arrow(0, 0, c1[0], c1[1], 'accent', 'main');
      p.arrow(0, 0, c2[0], c2[1], 'warm', 'main');
      p.arrow(0, 0, x[0], x[1], 'ink', 'main');
      p.arrow(0, 0, fx[0], fx[1], 'teal', 'main');
      tag(p, c1, 'φ(e₁)', 'accent');
      tag(p, c2, 'φ(e₂)', 'warm');
      tag(p, x, 'x', 'ink');
      tag(p, fx, 'φ(x)', 'ink');
      h1.place(c1[0], c1[1]);
      h2.place(c2[0], c2[1]);
      hx.place(x[0], x[1]);

      ro.set('e1', U.pt(c1[0], c1[1]), 'accent');
      ro.set('e2', U.pt(c2[0], c2[1]), 'warm');
      ro.set('x', U.pt(x[0], x[1]));
      ro.set('fx', U.pt(cl(fx[0]), cl(fx[1])));
      const det = c1[0] * c2[1] - c1[1] * c2[0];
      const zero = nrm(c1) < 1e-9 && nrm(c2) < 1e-9;
      const rk = zero ? T.r0 : Math.abs(det) < 1e-9 ? T.r1 : T.r2;
      fig.note.className = 'fig-note ok';
      fig.note.textContent = T.sum(U.fmt(x[0], 2), U.fmt(x[1], 2), U.pt(cl(fx[0]), cl(fx[1]))) + rk;
    }
    draw();
    window.addEventListener('resize', () => {
      if (P.width() !== P.w) {
        h1 = null;
        draw();
      }
    });
  });

  /* ---------------- Рисунок 2: ядро и образ, теорема 1.4 ---------------- */
  MC.widget('kerim', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { rank: 1, ka: 135, ia: 30, x: [1.5, 1.25] };
    const seg = F.seg([{ value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0' }], st.rank, (v) => {
      st.rank = v;
      draw();
    }, T.rank);
    const sK = F.slider({ label: T.kerDir, min: 0, max: 175, step: 5, value: st.ka, fmt: (v) => U.fmt(v, 0) + '°', oninput: (v) => {
      st.ka = v;
      draw();
    } });
    const sI = F.slider({ label: T.imDir, min: 0, max: 175, step: 5, value: st.ia, fmt: (v) => U.fmt(v, 0) + '°', oninput: (v) => {
      st.ia = v;
      draw();
    } });
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, T.rank), seg.el), sK.el, sI.el);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.dimK },
      { key: 'i', label: T.dimI },
      { key: 's', label: T.dsum },
      { key: 'fx', label: T.fx },
    ]);
    const P = makePlot(fig, T.aria2, { x: [-3.6, 3.6], y: [-2.8, 3.2] });
    let hx = null;

    /** Оператор: ранг 2 — φ(e₁) = (1; 0,5), φ(e₂) = (−0,5; 1); ранг 1 — φ(x) = ⟨n, x⟩·m, n ⟂ ядру; ранг 0 — нулевой. */
    function op() {
      if (st.rank === 2) return (v) => [v[0] - 0.5 * v[1], 0.5 * v[0] + v[1]];
      if (st.rank === 0) return () => [0, 0];
      const a = (st.ka * Math.PI) / 180;
      const b = (st.ia * Math.PI) / 180;
      const n = [-Math.sin(a), Math.cos(a)];
      const m = [Math.cos(b), Math.sin(b)];
      return (v) => {
        const t = n[0] * v[0] + n[1] * v[1];
        return [t * m[0], t * m[1]];
      };
    }

    function draw() {
      if (P.build() || !hx) {
        hx = P.p.handle(st.x[0], st.x[1], (pt) => {
          st.x = [snap(U.clamp(pt.x, -3.25, 3.25)), snap(U.clamp(pt.y, -2.5, 3))];
          draw();
        }, '');
      }
      sK.input.disabled = st.rank !== 1;
      sI.input.disabled = st.rank !== 1;
      const p = P.p;
      p.clear('main');
      const A = op();
      const x = st.x;
      const fx = A(x);
      const L = 12;
      const a = (st.ka * Math.PI) / 180;
      const b = (st.ia * Math.PI) / 180;
      const kd = [Math.cos(a), Math.sin(a)];
      const id = [Math.cos(b), Math.sin(b)];
      // образы точек решётки: в ранге 1 все они ложатся на прямую образа
      for (let i = -3; i <= 3; i++) {
        for (let j = -2; j <= 3; j++) {
          const q = A([i, j]);
          p.dot(q[0], q[1], 'accent small', 3.5, 'main');
        }
      }
      if (st.rank === 1) {
        p.seg(-L * kd[0], -L * kd[1], L * kd[0], L * kd[1], 'curve warm', 'main');
        p.seg(-L * id[0], -L * id[1], L * id[0], L * id[1], 'curve accent', 'main');
        // прообраз φ⁻¹(φ(x)) = x + Ker φ
        p.seg(x[0] - L * kd[0], x[1] - L * kd[1], x[0] + L * kd[0], x[1] + L * kd[1], 'curve dash thin', 'main');
        const kt = [2.6 * kd[0], 2.6 * kd[1]];
        const it = [2.6 * id[0], 2.6 * id[1]];
        p.text(kt[0], kt[1], 'Ker φ', 'lbl warm', { dx: 6, dy: -6, layer: 'main' });
        p.text(it[0], it[1], 'Im φ', 'lbl accent', { dx: 6, dy: 14, layer: 'main' });
      } else if (st.rank === 0) {
        p.dot(0, 0, 'accent', 5, 'main');
      }
      p.dot(0, 0, 'warm', st.rank === 2 ? 5 : 3.5, 'main');
      p.arrow(0, 0, x[0], x[1], 'ink', 'main');
      if (nrm(fx) > 1e-9) p.arrow(0, 0, fx[0], fx[1], 'teal', 'main');
      tag(p, x, 'x', 'ink');
      tag(p, fx, 'φ(x)', 'ink');
      hx.place(x[0], x[1]);

      const k = 2 - st.rank;
      ro.set('k', String(k), 'warm');
      ro.set('i', String(st.rank), 'accent');
      ro.set('s', k + ' + ' + st.rank + ' = 2');
      ro.set('fx', U.pt(cl(fx[0]), cl(fx[1])));
      fig.note.className = 'fig-note ok';
      if (st.rank === 2) fig.note.textContent = T.n2;
      else if (st.rank === 0) fig.note.textContent = T.n0;
      else fig.note.textContent = T.n1(nrm(fx) < 1e-9 ? T.inKer : T.fibNote);
    }
    draw();
    window.addEventListener('resize', () => {
      if (P.width() !== P.w) {
        hx = null;
        draw();
      }
    });
  });
})();
