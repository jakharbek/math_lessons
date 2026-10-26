/* Урок 2.2 «Производная»: рисунки «От секущей к касательной» и «Производная как функция». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  /** Функции рисунков: f, её производная f′ (точная формула), области по осям. */
  const FUNCS = {
    sq: { label: '$x^2$', tex: 'x^2', dtex: '2x', flabel: 'f(x) = x²', dlabel: 'f′(x) = 2x', f: (x) => x * x, d: (x) => 2 * x, x: [-2.5, 2.5], y: [-1, 6.2], dy: [-5.5, 5.5], x0: 1 },
    sin: { label: '$\\sin x$', tex: '\\sin x', dtex: '\\cos x', flabel: 'f(x) = sin x', dlabel: 'f′(x) = cos x', f: Math.sin, d: Math.cos, x: [-4, 4], y: [-1.7, 1.7], dy: [-1.6, 1.6], x0: 0.6 },
    cub: { label: '$x^3 - 3x$', tex: 'x^3 - 3x', dtex: '3x^2 - 3', flabel: 'f(x) = x³ − 3x', dlabel: 'f′(x) = 3x² − 3', f: (x) => x * x * x - 3 * x, d: (x) => 3 * x * x - 3, x: [-2.4, 2.4], y: [-4.5, 4.5], dy: [-4, 14], x0: -0.5 },
    exp: { label: '$e^x$', tex: 'e^x', dtex: 'e^x', flabel: 'f(x) = eˣ', dlabel: 'f′(x) = eˣ', f: Math.exp, d: Math.exp, x: [-3, 2.2], y: [-0.6, 7], dy: [-0.6, 7], x0: 0.5 },
  };
  const OPTIONS = Object.keys(FUNCS).map((k) => ({ value: k, label: FUNCS[k].label }));
  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);

  /* ------------------------- рисунок 1: от секущей к касательной ------------------------- */
  MC.widget('secant', (el) => {
    const fig = F.shell(el, { kicker: 'Рисунок 1', title: 'От секущей к касательной' });
    const W = plotWidth(fig.plot);
    const st = { key: 'sq', x0: 1, s: 0, tangent: true }; // s = log10(h)
    let fn = FUNCS.sq;
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.6), x: fn.x, y: fn.y, label: 'Секущая и касательная к графику функции' });
    const h = () => Math.pow(10, st.s);

    const choose = F.seg(OPTIONS, st.key, (k) => {
      st.key = k;
      fn = FUNCS[k];
      st.x0 = fn.x0;
      p.setDomain(fn.x, fn.y);
      p.axes({ xLabel: 'x', yLabel: 'y' });
      draw();
    }, 'Функция');
    const hs = F.slider({ label: 'Шаг $h$', min: -3, max: 0.3, step: 0.001, value: st.s, map: (v) => Math.pow(10, v), fmt: (v) => U.fmt(v, v < 0.01 ? 4 : 3), oninput: () => {
      st.s = Number(hs.input.value);
      draw();
    } });
    const tg = F.check('касательная', st.tangent, (v) => {
      st.tangent = v;
      draw();
    });
    let anim = null;
    const play = F.button('play', 'h → 0', () => {
      if (anim) return;
      if (st.s <= -2.99) st.s = 0.3;
      const from = st.s;
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 2600);
        st.s = from + (-3 - from) * (1 - Math.pow(1 - k, 2.2));
        hs.set(st.s);
        draw();
        anim = k < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    });
    fig.controls.append(choose.el, hs.el, tg.el, play);
    const ro = F.readout(fig.readout, [
      { key: 'h', label: 'шаг $h$' },
      { key: 'sec', label: 'наклон секущей $\\frac{\\Delta y}{h}$' },
      { key: 'der', label: "производная $f'(x_0)$" },
      { key: 'gap', label: 'разница' },
    ]);

    p.axes({ xLabel: 'x', yLabel: 'y' });
    const handle = { cur: null };
    function draw() {
      p.clear();
      const x0 = st.x0;
      const y0 = fn.f(x0);
      const x1 = x0 + h();
      const y1 = fn.f(x1);
      const k = (y1 - y0) / h();
      const d = fn.d(x0);
      p.fn(fn.f, 'curve');
      if (st.tangent) p.lineSlope(x0, y0, d, 'curve dash thin');
      p.lineSlope(x0, y0, k, 'curve accent');
      // катеты: Δx по горизонтали, Δy по вертикали
      p.seg(x0, y0, x1, y0, 'leg');
      p.seg(x1, y0, x1, y1, 'leg');
      const big = Math.abs(p.sx(x1) - p.sx(x0)) > 34;
      if (big) {
        p.text((x0 + x1) / 2, y0, 'Δx', 'lbl', { dy: y1 >= y0 ? 18 : -8, anchor: 'middle' });
        if (Math.abs(p.sy(y1) - p.sy(y0)) > 26) p.text(x1, (y0 + y1) / 2, 'Δy', 'lbl', { dx: 8 });
      }
      p.dot(x1, y1, 'warm');
      p.text(x1, y1, 'B', 'lbl warm', { dx: 10, dy: -8 });
      p.text(x0, y0, 'A', 'lbl accent', { dx: -18, dy: -10 });
      handle.cur = p.handle(x0, y0, (pt) => {
        st.x0 = U.clamp(pt.x, fn.x[0] + 0.15, fn.x[1] - 0.15);
        draw();
      });
      const gap = Math.abs(k - d);
      ro.set('h', U.fmt(h(), h() < 0.01 ? 4 : 3));
      ro.set('sec', U.fmt(k, 4), 'accent');
      ro.set('der', U.fmt(d, 4));
      ro.set('gap', U.fmt(gap, 4));
      fig.note.className = 'fig-note' + (gap < 0.01 ? ' ok' : '');
      fig.note.textContent =
        gap < 0.01
          ? 'Секущая почти слилась с касательной: наклоны отличаются меньше чем на 0,01.'
          : 'Точка B на расстоянии h = ' + U.fmt(h(), 3) + ' от A. Уменьшайте h — секущая повернётся к касательной.';
    }
    draw();
  });

  /* ------------------------- рисунок 2: производная как функция ------------------------- */
  MC.widget('derivative', (el) => {
    const fig = F.shell(el, { kicker: 'Рисунок 2', title: 'Наклон касательной рисует график $f\'$' });
    const W = plotWidth(fig.plot);
    const st = { key: 'cub', x0: -1.8, full: false, seen: new Set() };
    let fn = FUNCS.cub;
    const top = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.42), x: fn.x, y: fn.y, label: 'Функция и касательная' });
    const bottom = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.34), x: fn.x, y: fn.dy, label: 'График производной', margin: { t: 18 } });
    const BINS = 160;
    const bin = (x) => Math.round(((x - fn.x[0]) / (fn.x[1] - fn.x[0])) * BINS);

    const axes = () => {
      top.setDomain(fn.x, fn.y);
      bottom.setDomain(fn.x, fn.dy);
      top.axes({ xLabel: 'x' });
      bottom.axes({ xLabel: 'x' });
    };
    const choose = F.seg(OPTIONS, st.key, (k) => {
      st.key = k;
      fn = FUNCS[k];
      st.x0 = fn.x[0] + 0.3;
      st.seen.clear();
      axes();
      draw();
    }, 'Функция');
    const full = F.check("весь график $f'$", st.full, (v) => {
      st.full = v;
      draw();
    });
    let timer = null;
    const run = F.button('play', 'Пробежать', () => {
      if (timer) return;
      st.x0 = fn.x[0] + 0.05;
      const step = () => {
        st.x0 += (fn.x[1] - fn.x[0]) / 140;
        if (st.x0 >= fn.x[1] - 0.05) {
          st.x0 = fn.x[1] - 0.05;
          timer = null;
        } else timer = requestAnimationFrame(step);
        draw();
      };
      timer = requestAnimationFrame(step);
    });
    fig.controls.append(choose.el, full.el, run);
    const ro = F.readout(fig.readout, [
      { key: 'x', label: '$x_0$' },
      { key: 'f', label: '$f(x_0)$' },
      { key: 'd', label: "$f'(x_0)$ — наклон" },
    ]);

    function draw() {
      const x0 = st.x0;
      const y0 = fn.f(x0);
      const d = fn.d(x0);
      st.seen.add(bin(x0));
      top.clear();
      bottom.clear();
      top.fn(fn.f, 'curve');
      top.lineSlope(x0, y0, d, 'curve accent');
      top.seg(x0, fn.y[0], x0, fn.y[1], 'guide');
      top.text(fn.x[0], fn.y[1], fn.flabel, 'lbl ink', { dx: 6, dy: 14 });
      top.handle(x0, y0, (pt) => {
        st.x0 = U.clamp(pt.x, fn.x[0] + 0.05, fn.x[1] - 0.05);
        draw();
      });
      if (st.full) bottom.fn(fn.d, 'curve faint');
      // «нарисованная рукой» производная: точки там, где уже побывала касательная
      const pts = Array.from(st.seen).sort((a, b) => a - b).map((i) => fn.x[0] + ((fn.x[1] - fn.x[0]) * i) / BINS);
      for (const x of pts) bottom.dot(x, fn.d(x), 'accent small', 2.2, 'main');
      bottom.seg(x0, fn.dy[0], x0, fn.dy[1], 'guide');
      bottom.dot(x0, d, 'accent');
      bottom.text(fn.x[0], fn.dy[1], fn.dlabel, 'lbl accent', { dx: 6, dy: 14 });
      ro.set('x', U.fmt(x0, 2));
      ro.set('f', U.fmt(y0, 3));
      ro.set('d', U.fmt(d, 3), 'accent');
      const flat = Math.abs(d) < 0.08;
      fig.note.className = 'fig-note' + (flat ? ' ok' : '');
      fig.note.textContent = flat
        ? 'Касательная горизонтальна: f′(x₀) ≈ 0. Это вершина, впадина или «полочка».'
        : d > 0
          ? 'f′(x₀) > 0: касательная идёт вверх — функция здесь возрастает.'
          : 'f′(x₀) < 0: касательная идёт вниз — функция здесь убывает.';
    }
    axes();
    draw();
  });
})();
