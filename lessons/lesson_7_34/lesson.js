/* Урок 7.34 «Векторные пространства» (Куликов, гл. 7, § 1):
 * рисунок 1 «Проверка аксиом векторного пространства» — плоскость R² с обычным сложением и одним из
 * четырёх правил умножения на скаляр; для выбранных α, β и векторов a, b считаются обе части аксиом (1)–(5);
 * рисунок 2 «Линейная комбинация двух векторов» — λ₁a₁ + λ₂a₂ на плоскости, определитель αδ − βγ
 * (упражнение 11) и кнопка, подбирающая нетривиальную комбинацию, равную нулю. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Проверка аксиом векторного пространства',
      t2: 'Линейная комбинация двух векторов',
      aria1: 'Плоскость: вектор a, векторы α⊙a, β⊙a, (α+β)⊙a и сумма α⊙a + β⊙a',
      aria2: 'Плоскость: векторы a₁, a₂, их кратные λ₁a₁, λ₂a₂ и сумма λ₁a₁ + λ₂a₂',
      rule: 'Умножение на скаляр',
      mStd: 'обычное', mX0: '$(\\lambda x, 0)$', mSq: '$(\\lambda^2 x, \\lambda^2 y)$', mXY: '$(\\lambda x, y)$',
      vecs: 'Векторы', set: (k) => 'набор ' + k,
      ax: 'аксиома', lhs: 'левая часть', rhs: 'правая часть',
      ok: 'выполнена', bad: 'нарушена',
      all: 'Для этих α, β, a, b все пять аксиом выполнены. При обычном умножении так будет при любых значениях — это пространство $\\mathscr{R}^2$.',
      fail: (list) => 'Нарушены аксиомы ' + list + ' — с таким умножением плоскость не является векторным пространством (достаточно одного контрпримера).',
      luck: (list) => 'Для этих α, β, a, b все равенства случайно выполнены, но при других значениях нарушаются аксиомы ' + list + ': аксиома должна выполняться для любых скаляров и векторов.',
      a1: 'Вектор $\\boldsymbol{a}_1 = (\\alpha, \\beta)$', a2: 'Вектор $\\boldsymbol{a}_2 = (\\gamma, \\delta)$',
      find: 'Нетривиальная комбинация', dep: 'Сделать зависимыми',
      det: '$\\alpha\\delta - \\beta\\gamma$', comb: '$\\lambda_1\\boldsymbol{a}_1 + \\lambda_2\\boldsymbol{a}_2$',
      indep: 'αδ − βγ ≠ 0: векторы линейно независимы — λ₁a₁ + λ₂a₂ = 0 только при λ₁ = λ₂ = 0, а комбинациями получается любой вектор плоскости.',
      depN: 'αδ − βγ = 0: векторы линейно зависимы (упражнение 11) — лежат на одной прямой; нажмите «Нетривиальная комбинация».',
      depZ: (l1, l2) => 'Линейно зависимы: λ₁ = ' + l1 + ', λ₂ = ' + l2 + ' не оба нули, а λ₁a₁ + λ₂a₂ = 0.',
      noFind: 'Векторы независимы — нетривиальной комбинации, равной нулю, нет. Нажмите «Сделать зависимыми».',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Checking the vector space axioms',
      t2: 'A linear combination of two vectors',
      aria1: 'The plane: the vector a, the vectors α⊙a, β⊙a, (α+β)⊙a and the sum α⊙a + β⊙a',
      aria2: 'The plane: the vectors a₁, a₂, their multiples λ₁a₁, λ₂a₂ and the sum λ₁a₁ + λ₂a₂',
      rule: 'Scalar multiplication',
      mStd: 'usual', mX0: '$(\\lambda x, 0)$', mSq: '$(\\lambda^2 x, \\lambda^2 y)$', mXY: '$(\\lambda x, y)$',
      vecs: 'Vectors', set: (k) => 'set ' + k,
      ax: 'axiom', lhs: 'left side', rhs: 'right side',
      ok: 'holds', bad: 'fails',
      all: 'For these α, β, a, b all five axioms hold. With the usual multiplication this is so for all values — this is the space $\\mathscr{R}^2$.',
      fail: (list) => 'Axioms ' + list + ' fail — with this multiplication the plane is not a vector space (one counterexample is enough).',
      luck: (list) => 'For these α, β, a, b all equalities happen to hold, but for other values axioms ' + list + ' fail: an axiom must hold for all scalars and vectors.',
      a1: 'Vector $\\boldsymbol{a}_1 = (\\alpha, \\beta)$', a2: 'Vector $\\boldsymbol{a}_2 = (\\gamma, \\delta)$',
      find: 'Non-trivial combination', dep: 'Make dependent',
      det: '$\\alpha\\delta - \\beta\\gamma$', comb: '$\\lambda_1\\boldsymbol{a}_1 + \\lambda_2\\boldsymbol{a}_2$',
      indep: 'αδ − βγ ≠ 0: the vectors are linearly independent — λ₁a₁ + λ₂a₂ = 0 only for λ₁ = λ₂ = 0, and the combinations give every vector of the plane.',
      depN: 'αδ − βγ = 0: the vectors are linearly dependent (exercise 11) — they lie on one line; press “Non-trivial combination”.',
      depZ: (l1, l2) => 'Linearly dependent: λ₁ = ' + l1 + ', λ₂ = ' + l2 + ' are not both zero, and λ₁a₁ + λ₂a₂ = 0.',
      noFind: 'The vectors are independent — there is no non-trivial combination equal to zero. Press “Make dependent”.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Vektor fazo aksiomalarini tekshirish',
      t2: 'Ikki vektorning chiziqli kombinatsiyasi',
      aria1: 'Tekislik: a vektor, α⊙a, β⊙a, (α+β)⊙a vektorlar va α⊙a + β⊙a yig‘indi',
      aria2: 'Tekislik: a₁, a₂ vektorlar, ularning λ₁a₁, λ₂a₂ karralilari va λ₁a₁ + λ₂a₂ yig‘indi',
      rule: 'Skalyarga ko‘paytirish',
      mStd: 'odatiy', mX0: '$(\\lambda x, 0)$', mSq: '$(\\lambda^2 x, \\lambda^2 y)$', mXY: '$(\\lambda x, y)$',
      vecs: 'Vektorlar', set: (k) => k + '-to‘plam',
      ax: 'aksioma', lhs: 'chap tomon', rhs: 'o‘ng tomon',
      ok: 'bajariladi', bad: 'buziladi',
      all: 'Bu α, β, a, b uchun beshala aksioma bajariladi. Odatiy ko‘paytirishda bu har qanday qiymatlarda shunday — bu $\\mathscr{R}^2$ fazo.',
      fail: (list) => list + ' aksiomalar buziladi — bunday ko‘paytirishda tekislik vektor fazo emas (bitta kontrmisol yetarli).',
      luck: (list) => 'Bu α, β, a, b uchun barcha tengliklar tasodifan bajarildi, lekin boshqa qiymatlarda ' + list + ' aksiomalar buziladi: aksioma har qanday skalyar va vektorlar uchun bajarilishi kerak.',
      a1: '$\\boldsymbol{a}_1 = (\\alpha, \\beta)$ vektor', a2: '$\\boldsymbol{a}_2 = (\\gamma, \\delta)$ vektor',
      find: 'Notrivial kombinatsiya', dep: 'Bog‘liq qilish',
      det: '$\\alpha\\delta - \\beta\\gamma$', comb: '$\\lambda_1\\boldsymbol{a}_1 + \\lambda_2\\boldsymbol{a}_2$',
      indep: 'αδ − βγ ≠ 0: vektorlar chiziqli erkli — λ₁a₁ + λ₂a₂ = 0 faqat λ₁ = λ₂ = 0 da, kombinatsiyalar esa tekislikning har qanday vektorini beradi.',
      depN: 'αδ − βγ = 0: vektorlar chiziqli bog‘liq (11-mashq) — bitta to‘g‘ri chiziqda yotadi; «Notrivial kombinatsiya» tugmasini bosing.',
      depZ: (l1, l2) => 'Chiziqli bog‘liq: λ₁ = ' + l1 + ', λ₂ = ' + l2 + ' ikkalasi ham nol emas, λ₁a₁ + λ₂a₂ = 0.',
      noFind: 'Vektorlar erkli — nolga teng notrivial kombinatsiya yo‘q. «Bog‘liq qilish» tugmasini bosing.',
    },
  });

  const EPS = 1e-9;
  const near = (u, v) => Math.abs(u[0] - v[0]) < EPS && Math.abs(u[1] - v[1]) < EPS;
  const add = (u, v) => [u[0] + v[0], u[1] + v[1]];
  const P = (v) => U.pt(v[0], v[1], 2);

  /* -------------- Рисунок 1: аксиомы для четырёх правил умножения на скаляр -------------- */
  const RULES = {
    std: (l, v) => [l * v[0], l * v[1]],
    x0: (l, v) => [l * v[0], 0],
    sq: (l, v) => [l * l * v[0], l * l * v[1]],
    xy: (l, v) => [l * v[0], v[1]],
  };
  const SETS = {
    1: [[2, 1], [-1, 1.5]],
    2: [[1, -1], [2, 0.5]],
    3: [[1.5, 0], [0, 1]],
  };
  /** Аксиомы (1)–(5) при сложении по координатам и умножении mul. Возвращает [{n, lhs, rhs}]. */
  function axioms(mul, al, be, a, b) {
    const Z = [0, 0];
    return [
      { n: 1, lhs: 'a + (−1)⊙a = ' + P(add(a, mul(-1, a))), rhs: P(Z), ok: near(add(a, mul(-1, a)), Z) },
      { n: 2, lhs: '(αβ)⊙a = ' + P(mul(al * be, a)), rhs: 'α⊙(β⊙a) = ' + P(mul(al, mul(be, a))), ok: near(mul(al * be, a), mul(al, mul(be, a))) },
      { n: 3, lhs: 'α⊙(a + b) = ' + P(mul(al, add(a, b))), rhs: 'α⊙a + α⊙b = ' + P(add(mul(al, a), mul(al, b))), ok: near(mul(al, add(a, b)), add(mul(al, a), mul(al, b))) },
      { n: 4, lhs: '(α + β)⊙a = ' + P(mul(al + be, a)), rhs: 'α⊙a + β⊙a = ' + P(add(mul(al, a), mul(be, a))), ok: near(mul(al + be, a), add(mul(al, a), mul(be, a))) },
      { n: 5, lhs: '1⊙a = ' + P(mul(1, a)), rhs: 'a = ' + P(a), ok: near(mul(1, a), a) },
    ];
  }
  /** Какие аксиомы нарушаются хоть где-то (перебор по сетке скаляров и наборов векторов). */
  function failing(mul) {
    const bad = new Set();
    const ls = [-2, -1, -0.5, 0, 0.5, 1, 1.5, 2];
    for (const k of Object.keys(SETS)) {
      const [a, b] = SETS[k];
      for (const al of ls) for (const be of ls) for (const r of axioms(mul, al, be, a, b)) if (!r.ok) bad.add(r.n);
    }
    return [...bad].sort();
  }

  MC.widget('vs-axioms', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { rule: cfg.rule && RULES[cfg.rule] ? cfg.rule : 'std', set: '1', al: 1.5, be: -0.5 };
    const rSeg = F.seg([
      { value: 'std', label: T.mStd },
      { value: 'x0', label: T.mX0 },
      { value: 'sq', label: T.mSq },
      { value: 'xy', label: T.mXY },
    ], st.rule, (v) => {
      st.rule = v;
      draw();
    }, T.rule);
    const rLab = MC.h('div', { class: 'ctl' }, MC.h('span', null, T.rule), rSeg.el);
    const vSeg = F.seg(['1', '2', '3'].map((k) => ({ value: k, label: T.set(k) })), st.set, (v) => {
      st.set = v;
      draw();
    }, T.vecs);
    const vLab = MC.h('div', { class: 'ctl' }, MC.h('span', null, T.vecs), vSeg.el);
    const sA = F.slider({ label: '$\\alpha$', min: -2, max: 2, step: 0.5, value: st.al, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.al = v;
      draw();
    } });
    const sB = F.slider({ label: '$\\beta$', min: -2, max: 2, step: 0.5, value: st.be, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.be = v;
      draw();
    } });
    fig.controls.append(rLab, vLab, sA.el, sB.el);
    const box = MC.h('div', { class: 'ax-list' });
    box.style.cssText = 'margin-top:12px;font-size:14px;line-height:1.55;font-variant-numeric:tabular-nums';
    let p = null;
    let lastW = 0;
    function build() {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 640), 300, 720);
      if (W === lastW && p) return;
      lastW = W;
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.85 : 0.55)), x: [-5, 5], y: [-4, 4], equal: true, label: T.aria1 });
      p.axes({ xLabel: 'x', yLabel: 'y' });
      fig.plot.appendChild(box);
    }
    function draw() {
      build();
      p.clear();
      const mul = RULES[st.rule];
      const [a, b] = SETS[st.set];
      const al = st.al;
      const be = st.be;
      const aa = mul(al, a);
      const ba = mul(be, a);
      const s = mul(al + be, a);
      const t = add(aa, ba);
      p.seg(aa[0], aa[1], t[0], t[1], 'guide');
      p.seg(ba[0], ba[1], t[0], t[1], 'guide');
      p.arrow(0, 0, a[0], a[1], 'ink');
      p.arrow(0, 0, b[0], b[1], 'faint');
      p.arrow(0, 0, aa[0], aa[1], 'accent');
      p.arrow(0, 0, ba[0], ba[1], 'teal');
      p.arrow(0, 0, t[0], t[1], 'accent dash');
      p.arrow(0, 0, s[0], s[1], 'warm');
      p.text(a[0], a[1], 'a', 'lbl', { dx: 6, dy: -6 });
      p.text(b[0], b[1], 'b', 'lbl', { dx: 6, dy: -6 });
      p.text(aa[0], aa[1], 'α⊙a', 'lbl accent', { dx: 6, dy: 14 });
      p.text(s[0], s[1], '(α+β)⊙a', 'lbl warm', { dx: 6, dy: -8 });
      const rows = axioms(mul, al, be, a, b);
      box.replaceChildren(...rows.map((r) => {
        const line = MC.h('div');
        line.style.cssText = 'padding:4px 0;border-bottom:1px solid var(--line);overflow-wrap:anywhere';
        const mark = MC.h('b', null, r.ok ? '✓ ' + T.ok : '✗ ' + T.bad);
        mark.style.color = r.ok ? 'var(--ok)' : 'var(--err)';
        line.append(MC.h('span', null, '(' + r.n + ') ' + r.lhs + ' ; ' + r.rhs + ' — '), mark);
        return line;
      }));
      const now = rows.filter((r) => !r.ok).map((r) => '(' + r.n + ')');
      const ever = failing(mul).map((n) => '(' + n + ')');
      if (now.length) {
        fig.note.className = 'fig-note bad';
        fig.note.textContent = T.fail(now.join(', '));
      } else if (ever.length) {
        fig.note.className = 'fig-note';
        fig.note.textContent = T.luck(ever.join(', '));
      } else {
        fig.note.className = 'fig-note ok';
        fig.note.replaceChildren(F.rich(T.all));
      }
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 640), 300, 720) !== lastW) draw();
    });
  });

  /* -------------- Рисунок 2: линейная комбинация λ₁a₁ + λ₂a₂ -------------- */
  MC.widget('lin-comb', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { v: [2, 1, 0.5, 2], l1: 1, l2: 1 };
    const mk = (i, label) => F.slider({ label, min: -3, max: 3, step: 0.5, value: st.v[i], fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.v[i] = v;
      draw();
    } });
    const sl = [mk(0, '$\\alpha$'), mk(1, '$\\beta$'), mk(2, '$\\gamma$'), mk(3, '$\\delta$')];
    const mkL = (key, label) => F.slider({ label, min: -3, max: 3, step: 0.25, value: st[key], fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st[key] = v;
      draw();
    } });
    const s1 = mkL('l1', '$\\lambda_1$');
    const s2 = mkL('l2', '$\\lambda_2$');
    const bFind = F.button('check', T.find, () => {
      const [al, be, ga, de] = st.v;
      if (Math.abs(al * de - be * ga) > EPS) {
        draw();
        fig.note.className = 'fig-note';
        fig.note.textContent = T.noFind;
        return;
      }
      let c = [de, -be];
      if (Math.abs(c[0]) < EPS && Math.abs(c[1]) < EPS) c = [ga, -al];
      if (Math.abs(c[0]) < EPS && Math.abs(c[1]) < EPS) c = [1, 0];
      const m = Math.max(Math.abs(c[0]), Math.abs(c[1]));
      if (m > 3) c = [c[0] * 3 / m, c[1] * 3 / m];
      st.l1 = c[0];
      st.l2 = c[1];
      s1.set(c[0]);
      s2.set(c[1]);
      draw();
    });
    const bDep = F.button('reset', T.dep, () => {
      // a₂ ≈ −½·a₁ на сетке ползунков (шаг 0,5); если округление нарушило пропорциональность — a₂ = −a₁
      st.v[2] = Math.round(-st.v[0]) / 2;
      st.v[3] = Math.round(-st.v[1]) / 2;
      if (Math.abs(st.v[0] * st.v[3] - st.v[1] * st.v[2]) > EPS) {
        st.v[2] = -st.v[0];
        st.v[3] = -st.v[1];
      }
      sl[2].set(st.v[2]);
      sl[3].set(st.v[3]);
      draw();
    });
    const btns = MC.h('div', null, bFind, bDep);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.a1))), sl[0].el, sl[1].el,
      MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.a2))), sl[2].el, sl[3].el, s1.el, s2.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 'det', label: T.det },
      { key: 'comb', label: T.comb },
    ]);
    let p = null;
    let lastW = 0;
    function build() {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 640), 300, 720);
      if (W === lastW && p) return;
      lastW = W;
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.6)), x: [-7, 7], y: [-6, 6], equal: true, label: T.aria2 });
      p.axes({ xLabel: 'x', yLabel: 'y' });
    }
    function draw() {
      build();
      p.clear();
      const [al, be, ga, de] = st.v;
      const a1 = [al, be];
      const a2 = [ga, de];
      const u = [st.l1 * al, st.l1 * be];
      const v = [st.l2 * ga, st.l2 * de];
      const s = add(u, v);
      const d = al * de - be * ga;
      if (Math.abs(d) < EPS) {
        const dir = Math.hypot(al, be) > EPS ? a1 : a2;
        if (Math.hypot(dir[0], dir[1]) > EPS) {
          const k = 20 / Math.hypot(dir[0], dir[1]);
          p.seg(-dir[0] * k, -dir[1] * k, dir[0] * k, dir[1] * k, 'guide');
        }
      }
      p.polygon([[0, 0], u, s, v], 'poly faint');
      p.arrow(0, 0, u[0], u[1], 'accent dash');
      p.arrow(0, 0, v[0], v[1], 'teal dash');
      p.arrow(0, 0, a1[0], a1[1], 'accent');
      p.arrow(0, 0, a2[0], a2[1], 'teal');
      p.arrow(0, 0, s[0], s[1], 'warm');
      p.dot(s[0], s[1], 'warm', 4);
      p.text(a1[0], a1[1], 'a₁', 'lbl accent', { dx: 6, dy: -6 });
      p.text(a2[0], a2[1], 'a₂', 'lbl teal', { dx: 6, dy: -6 });
      p.text(s[0], s[1], 'λ₁a₁+λ₂a₂', 'lbl warm', { dx: 6, dy: 16 });
      const zero = Math.abs(s[0]) < EPS && Math.abs(s[1]) < EPS;
      const triv = Math.abs(st.l1) < EPS && Math.abs(st.l2) < EPS;
      ro.set('det', U.fmt(d, 3), Math.abs(d) < EPS ? 'warm' : 'accent');
      ro.set('comb', P(s), zero ? 'warm' : '');
      if (Math.abs(d) > EPS) {
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.indep;
      } else if (zero && !triv) {
        fig.note.className = 'fig-note bad';
        fig.note.textContent = T.depZ(U.fmt(st.l1, 2), U.fmt(st.l2, 2));
      } else {
        fig.note.className = 'fig-note bad';
        fig.note.textContent = T.depN;
      }
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 640), 300, 720) !== lastW) draw();
    });
  });
})();
