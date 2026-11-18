/* Урок 7.38 «Векторные пространства со скалярным умножением» (Куликов, гл. 7, § 5):
 * рисунок 1 «Процесс ортогонализации» — шаги b₁ = c₁, проекция λ₁b₁, b₂ = c₂ − λ₁b₁ для трёх скалярных
 * умножений на плоскости (стандартное, взвешенное 2α₁β₁ + α₂β₂, вырожденное α₁β₁ − α₂β₂; теорема 5.4);
 * рисунок 2 «Разложение a = λb + x» — проекция на прямую L(b) и составляющая из L⊥ (теорема 5.6). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Процесс ортогонализации',
      t2: 'Разложение $\\boldsymbol{a} = \\lambda\\boldsymbol{b} + \\boldsymbol{x}$',
      aria1: 'Плоскость: векторы c₁, c₂ и строящиеся по ним ортогональные векторы b₁, b₂',
      aria2: 'Плоскость: прямая L(b), её ортогональное дополнение, вектор a, проекция λb и составляющая x',
      prod: 'Умножение', std: 'стандартное', w: 'взвешенное', ind: 'вырожденное',
      back: 'Назад', next: 'Дальше',
      stepL: (k) => 'Шаг ' + k + ' из 3',
      bb: '$\\boldsymbol{b}_1 \\cdot \\boldsymbol{b}_1$', cb: '$\\boldsymbol{c}_2 \\cdot \\boldsymbol{b}_1$', lam: '$\\lambda_1$',
      b2: '$\\boldsymbol{b}_2$', b12: '$\\boldsymbol{b}_1 \\cdot \\boldsymbol{b}_2$',
      s0: 'Шаг 0: исходная система c₁, c₂. Перетаскивайте концы векторов.',
      s1: 'Шаг 1: b₁ = c₁ — система из одного ненулевого вектора ортогональна.',
      s2: (l) => 'Шаг 2: проекция λ₁b₁ вектора c₂ на прямую L(b₁), λ₁ = (c₂·b₁)/(b₁·b₁) = ' + l + '.',
      s3: 'Шаг 3: b₂ = c₂ − λ₁b₁, и b₁·b₂ = 0 — ортогональный базис плоскости (следствие 5.3).',
      skew: ' Для этого умножения ортогональные векторы на чертеже не перпендикулярны.',
      zero1: 'c₁ = 0: процесс начинают с ненулевого вектора.',
      degen: 'b₁·b₁ = 0: делить нельзя — умножение вырожденное (в смысле Куликова), процесс ломается.',
      dep: 'b₂ = 0: c₂ пропорционален c₁ — система зависима, процесс дал нулевой вектор.',
      lamL: '$\\lambda$', proj: '$\\lambda\\boldsymbol{b}$', xL: '$\\boldsymbol{x}$', xb: '$\\boldsymbol{x} \\cdot \\boldsymbol{b}$',
      dec: (a, p, x) => 'a = λb + x: ' + a + ' = ' + p + ' + ' + x + ', λb ∈ L, x ∈ L⊥ — разложение V = L ⊕ L⊥ (теорема 5.6).',
      inL: ' Вектор a лежит на L: x = 0.',
      inLp: ' Вектор a ортогонален b: λ = 0, a ∈ L⊥.',
      bzero: 'b = 0: прямая L(b) не задана — выберите ненулевой b.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'The orthogonalization process',
      t2: 'The decomposition $\\boldsymbol{a} = \\lambda\\boldsymbol{b} + \\boldsymbol{x}$',
      aria1: 'The plane: vectors c₁, c₂ and the orthogonal vectors b₁, b₂ built from them',
      aria2: 'The plane: the line L(b), its orthogonal complement, the vector a, the projection λb and the component x',
      prod: 'Product', std: 'standard', w: 'weighted', ind: 'degenerate',
      back: 'Back', next: 'Next',
      stepL: (k) => 'Step ' + k + ' of 3',
      bb: '$\\boldsymbol{b}_1 \\cdot \\boldsymbol{b}_1$', cb: '$\\boldsymbol{c}_2 \\cdot \\boldsymbol{b}_1$', lam: '$\\lambda_1$',
      b2: '$\\boldsymbol{b}_2$', b12: '$\\boldsymbol{b}_1 \\cdot \\boldsymbol{b}_2$',
      s0: 'Step 0: the original system c₁, c₂. Drag the tips of the vectors.',
      s1: 'Step 1: b₁ = c₁ — a system of one non-zero vector is orthogonal.',
      s2: (l) => 'Step 2: the projection λ₁b₁ of c₂ onto the line L(b₁), λ₁ = (c₂·b₁)/(b₁·b₁) = ' + l + '.',
      s3: 'Step 3: b₂ = c₂ − λ₁b₁ and b₁·b₂ = 0 — an orthogonal basis of the plane (corollary 5.3).',
      skew: ' For this product orthogonal vectors do not look perpendicular in the picture.',
      zero1: 'c₁ = 0: the process starts with a non-zero vector.',
      degen: 'b₁·b₁ = 0: division is impossible — the product is degenerate (in Kulikov’s sense) and the process breaks down.',
      dep: 'b₂ = 0: c₂ is proportional to c₁ — the system is dependent and the process produced the zero vector.',
      lamL: '$\\lambda$', proj: '$\\lambda\\boldsymbol{b}$', xL: '$\\boldsymbol{x}$', xb: '$\\boldsymbol{x} \\cdot \\boldsymbol{b}$',
      dec: (a, p, x) => 'a = λb + x: ' + a + ' = ' + p + ' + ' + x + ', λb ∈ L, x ∈ L⊥ — the decomposition V = L ⊕ L⊥ (theorem 5.6).',
      inL: ' The vector a lies on L: x = 0.',
      inLp: ' The vector a is orthogonal to b: λ = 0, a ∈ L⊥.',
      bzero: 'b = 0: the line L(b) is not defined — choose a non-zero b.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Ortogonallashtirish jarayoni',
      t2: '$\\boldsymbol{a} = \\lambda\\boldsymbol{b} + \\boldsymbol{x}$ yoyilma',
      aria1: 'Tekislik: c₁, c₂ vektorlar va ular bo‘yicha quriladigan ortogonal b₁, b₂ vektorlar',
      aria2: 'Tekislik: L(b) to‘g‘ri chiziq, uning ortogonal to‘ldiruvchisi, a vektor, λb proyeksiya va x tashkil etuvchi',
      prod: 'Ko‘paytma', std: 'standart', w: 'vaznli', ind: 'aynigan',
      back: 'Orqaga', next: 'Keyingi',
      stepL: (k) => k + '-qadam (3 tadan)',
      bb: '$\\boldsymbol{b}_1 \\cdot \\boldsymbol{b}_1$', cb: '$\\boldsymbol{c}_2 \\cdot \\boldsymbol{b}_1$', lam: '$\\lambda_1$',
      b2: '$\\boldsymbol{b}_2$', b12: '$\\boldsymbol{b}_1 \\cdot \\boldsymbol{b}_2$',
      s0: '0-qadam: dastlabki c₁, c₂ sistema. Vektorlar uchini suring.',
      s1: '1-qadam: b₁ = c₁ — bitta nolmas vektordan iborat sistema ortogonal.',
      s2: (l) => '2-qadam: c₂ ning L(b₁) to‘g‘ri chiziqqa λ₁b₁ proyeksiyasi, λ₁ = (c₂·b₁)/(b₁·b₁) = ' + l + '.',
      s3: '3-qadam: b₂ = c₂ − λ₁b₁ va b₁·b₂ = 0 — tekislikning ortogonal bazisi (5.3-natija).',
      skew: ' Bu ko‘paytmada ortogonal vektorlar chizmada perpendikulyar ko‘rinmaydi.',
      zero1: 'c₁ = 0: jarayon nolmas vektordan boshlanadi.',
      degen: 'b₁·b₁ = 0: bo‘lib bo‘lmaydi — ko‘paytma aynigan (Kulikov ma’nosida), jarayon buziladi.',
      dep: 'b₂ = 0: c₂ vektor c₁ ga proporsional — sistema bog‘liq, jarayon nol vektor berdi.',
      lamL: '$\\lambda$', proj: '$\\lambda\\boldsymbol{b}$', xL: '$\\boldsymbol{x}$', xb: '$\\boldsymbol{x} \\cdot \\boldsymbol{b}$',
      dec: (a, p, x) => 'a = λb + x: ' + a + ' = ' + p + ' + ' + x + ', λb ∈ L, x ∈ L⊥ — V = L ⊕ L⊥ yoyilma (5.6-teorema).',
      inL: ' a vektor L da yotadi: x = 0.',
      inLp: ' a vektor b ga ortogonal: λ = 0, a ∈ L⊥.',
      bzero: 'b = 0: L(b) to‘g‘ri chiziq aniqlanmagan — nolmas b tanlang.',
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const snap = (v, lo, hi) => Math.round(U.clamp(v, lo, hi) * 2) / 2;
  const num = (v) => U.fmt(Math.abs(v) < 1e-12 ? 0 : v, 2);
  const vec = (v) => '(' + num(v[0]) + U.sep() + num(v[1]) + ')';
  const near0 = (x) => Math.abs(x) < 1e-9;

  const DOTS = {
    std: (a, b) => a[0] * b[0] + a[1] * b[1],
    w: (a, b) => 2 * a[0] * b[0] + a[1] * b[1],
    ind: (a, b) => a[0] * b[0] - a[1] * b[1],
  };

  /** Подпись у конца вектора — за ореолом ручки, чтобы её не закрывали ручка и стрелка. */
  function label(p, v, s, cls) {
    const right = v[0] >= 0;
    p.text(v[0], v[1], s, 'lbl ' + (cls || ''), { dx: right ? 14 : -14, dy: v[1] >= 0 ? -12 : 22, anchor: right ? 'start' : 'end' });
  }

  function onResize(fig, getW, draw) {
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (plotWidth(fig.plot) !== getW()) draw();
      }, 150);
    });
  }

  /* ---------------------- Рисунок 1: процесс ортогонализации ---------------------- */
  MC.widget('gram-schmidt', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { c1: [2, 1], c2: [1, 2], dot: 'std', step: 0 };
    const pSeg = F.seg([{ value: 'std', label: T.std }, { value: 'w', label: T.w }, { value: 'ind', label: T.ind }], st.dot, (v) => {
      st.dot = v;
      draw();
    }, T.prod);
    const pLab = MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.prod)), pSeg.el);
    const stepTxt = MC.h('span', { class: 'fig-step' });
    const bBack = F.button('back', T.back, () => go(-1));
    const bNext = F.button('step', T.next, () => go(1));
    const btns = MC.h('div', { class: 'fig-buttons' }, bBack, bNext, stepTxt);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center';
    fig.controls.append(pLab, btns);
    const ro = F.readout(fig.readout, [
      { key: 'bb', label: T.bb },
      { key: 'cb', label: T.cb },
      { key: 'lam', label: T.lam },
      { key: 'b2', label: T.b2 },
      { key: 'b12', label: T.b12 },
    ]);
    function go(d) {
      st.step = U.clamp(st.step + d, 0, 3);
      draw();
    }

    let p = null;
    let W = 0;
    function build() {
      W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.62)), x: [-4, 4], y: [-3, 3], equal: true, label: T.aria1 });
    }

    function draw() {
      if (!p || plotWidth(fig.plot) !== W) build();
      p.clear();
      p.axes({ xLabel: 'x', yLabel: 'y' });
      const dot = DOTS[st.dot];
      const c1 = st.c1.slice(); // шаг 0 — копия исходных данных
      const c2 = st.c2.slice();
      const b1 = c1;
      const bb = dot(b1, b1);
      const cb = dot(c2, b1);
      const c1zero = near0(c1[0]) && near0(c1[1]);
      const ok = !c1zero && !near0(bb);
      const lam = ok ? cb / bb : NaN;
      const pr = ok ? [lam * b1[0], lam * b1[1]] : null;
      const b2 = ok ? [c2[0] - pr[0], c2[1] - pr[1]] : null;
      const b2zero = ok && near0(b2[0]) && near0(b2[1]);
      const s = st.step;

      // прямая L(b₁) — с шага 1
      if (s >= 1 && !c1zero) {
        const t = 30 / Math.hypot(b1[0], b1[1]);
        p.seg(-b1[0] * t, -b1[1] * t, b1[0] * t, b1[1] * t, 'curve accent dash');
      }
      if (s === 0) {
        if (!c1zero) p.arrow(0, 0, c1[0], c1[1], 'accent');
        p.arrow(0, 0, c2[0], c2[1], 'warm');
        label(p, c1, 'c₁', 'accent');
        label(p, c2, 'c₂', 'warm');
      } else {
        if (!c1zero) p.arrow(0, 0, b1[0], b1[1], 'accent');
        label(p, b1, 'b₁', 'accent');
        p.arrow(0, 0, c2[0], c2[1], s >= 2 ? 'faint' : 'warm');
        label(p, c2, 'c₂', s >= 2 ? '' : 'warm');
        if (s >= 2 && ok) {
          p.seg(pr[0], pr[1], c2[0], c2[1], 'guide');
          if (!near0(lam)) p.arrow(0, 0, pr[0], pr[1], 'teal');
          p.dot(pr[0], pr[1], 'teal', 4);
          p.text(pr[0], pr[1], 'λ₁b₁', 'lbl teal', { dx: 8, dy: 20 });
        }
        if (s >= 3 && ok && !b2zero) {
          p.seg(b2[0], b2[1], c2[0], c2[1], 'guide');
          p.arrow(0, 0, b2[0], b2[1], 'warm');
          label(p, b2, 'b₂', 'warm');
        }
      }
      p.handle(c1[0], c1[1], (pt) => {
        st.c1 = [snap(pt.x, -3.5, 3.5), snap(pt.y, -2.5, 2.5)];
        draw();
      });
      p.handle(c2[0], c2[1], (pt) => {
        st.c2 = [snap(pt.x, -3.5, 3.5), snap(pt.y, -2.5, 2.5)];
        draw();
      }, 'warm');

      stepTxt.textContent = T.stepL(s);
      bBack.disabled = s === 0;
      bNext.disabled = s === 3;
      ro.set('bb', c1zero ? '—' : num(bb), ok ? '' : 'warm');
      ro.set('cb', num(cb));
      ro.set('lam', ok ? num(lam) : '—', 'accent');
      ro.set('b2', ok ? vec(b2) : '—', 'warm');
      ro.set('b12', ok ? num(dot(b1, b2)) : '—', ok ? 'accent' : '');

      let msg;
      let good = true;
      if (c1zero) {
        msg = T.zero1;
        good = false;
      } else if (s >= 2 && !ok) {
        msg = T.degen;
        good = false;
      } else if (s >= 3 && b2zero) {
        msg = T.dep;
        good = false;
      } else {
        msg = [T.s0, T.s1, T.s2(ok ? num(lam) : '—'), T.s3][s];
        if (s >= 3 && st.dot !== 'std') msg += T.skew;
        if (s < 2 && !ok) {
          msg += ' ' + T.degen;
          good = false;
        }
      }
      fig.note.className = 'fig-note' + (good && s === 3 ? ' ok' : '');
      fig.note.textContent = msg;
    }
    draw();
    onResize(fig, () => W, draw);
  });

  /* ---------------------- Рисунок 2: a = λb + x, x ∈ L⊥ ---------------------- */
  MC.widget('orth-decomp', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { a: [1, 2.5], b: [3, 1] };
    const ro = F.readout(fig.readout, [
      { key: 'lam', label: T.lamL },
      { key: 'p', label: T.proj },
      { key: 'x', label: T.xL },
      { key: 'xb', label: T.xb },
    ]);
    fig.controls.remove();

    let p = null;
    let W = 0;
    function build() {
      W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.62)), x: [-4, 4], y: [-3, 3], equal: true, label: T.aria2 });
    }

    function draw() {
      if (!p || plotWidth(fig.plot) !== W) build();
      p.clear();
      p.axes({ xLabel: 'x', yLabel: 'y' });
      const a = st.a.slice();
      const b = st.b.slice();
      const dot = DOTS.std;
      const bb = dot(b, b);
      const bz = near0(bb);
      if (!bz) {
        const t = 30 / Math.sqrt(bb);
        p.seg(-b[0] * t, -b[1] * t, b[0] * t, b[1] * t, 'curve accent dash');
        p.seg(b[1] * t, -b[0] * t, -b[1] * t, b[0] * t, 'guide');
      }
      let lam = NaN;
      let pr = null;
      let x = null;
      if (!bz) {
        lam = dot(a, b) / bb;
        pr = [lam * b[0], lam * b[1]];
        x = [a[0] - pr[0], a[1] - pr[1]];
        if (!(near0(x[0]) && near0(x[1]))) {
          p.seg(pr[0], pr[1], a[0], a[1], 'curve warm dash');
          p.seg(0, 0, x[0], x[1], 'curve dash');
          p.text(x[0], x[1], 'x', 'lbl', { dx: 8, dy: x[1] >= 0 ? -8 : 18 });
        }
      }
      if (!bz) {
        // подписи прямых — на концах, противоположных векторам b и x, чтобы не налезать на их подписи
        const r = Math.sqrt(bb);
        const u = [b[0] / r, b[1] / r];
        const n = [-u[1], u[0]];
        const sx = x && dot(x, n) < 0 ? 1 : -1;
        p.text(-u[0] * 3.2, -u[1] * 3.2, 'L', 'lbl accent', { dx: 6, dy: 18 });
        p.text(sx * n[0] * 2.3, sx * n[1] * 2.3, 'L⊥', 'lbl', { dx: 8, dy: 4 });
      }
      if (!bz) p.arrow(0, 0, b[0], b[1], 'accent');
      if (!bz) {
        // проекция λb рисуется поверх b: при 0 < λ < 1 она лежит на отрезке b и иначе была бы закрыта
        if (!near0(lam)) p.arrow(0, 0, pr[0], pr[1], 'warm');
        p.dot(pr[0], pr[1], 'warm', 4);
        p.text(pr[0], pr[1], 'λb', 'lbl warm', { dx: 8, dy: 20 });
      }
      p.arrow(0, 0, a[0], a[1], 'ink');
      label(p, b, 'b', 'accent');
      label(p, a, 'a', '');
      p.handle(b[0], b[1], (pt) => {
        st.b = [snap(pt.x, -3.5, 3.5), snap(pt.y, -2.5, 2.5)];
        draw();
      });
      p.handle(a[0], a[1], (pt) => {
        st.a = [snap(pt.x, -3.5, 3.5), snap(pt.y, -2.5, 2.5)];
        draw();
      }, 'ink');

      if (bz) {
        ['lam', 'p', 'x', 'xb'].forEach((k) => ro.set(k, '—'));
        fig.note.className = 'fig-note';
        fig.note.textContent = T.bzero;
        return;
      }
      ro.set('lam', num(lam), 'warm');
      ro.set('p', vec(pr), 'warm');
      ro.set('x', vec(x));
      ro.set('xb', num(dot(x, b)), 'accent');
      let msg = T.dec(vec(a), vec(pr), vec(x));
      if (near0(x[0]) && near0(x[1])) msg += T.inL;
      else if (near0(lam)) msg += T.inLp;
      fig.note.className = 'fig-note ok';
      fig.note.textContent = msg;
    }
    draw();
    onResize(fig, () => W, draw);
  });
})();
