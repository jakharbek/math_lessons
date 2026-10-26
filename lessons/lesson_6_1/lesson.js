/* Урок 6.1 «Градиент и градиентный спуск»: спуск на прямой и спуск по карте линий уровня. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const MAX_STEPS = 200;
  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);

  /** Кнопки «Шаг», «Пуск/Пауза», «Сначала» и плеер, вызывающий step() по таймеру. */
  function runner(fig, step, reset) {
    const stepBtn = F.button('step', 'Шаг', () => {
      pl.pause();
      step();
    });
    const playBtn = F.button('play', 'Пуск', () => pl.toggle());
    const resetBtn = F.button('reset', 'Сначала', () => {
      pl.pause();
      reset();
    });
    const pl = F.player(step, {
      interval: 380,
      onchange: (on) => playBtn.replaceChildren(MC.ui.icon(on ? 'pause' : 'play'), on ? 'Пауза' : 'Пуск'),
    });
    const row = MC.h('div', { class: 'row' }, stepBtn, playBtn, resetBtn);
    return { row, pl };
  }

  /* ------------------------------- рисунок 1: спуск на прямой ------------------------------- */
  const F1 = {
    sq: { label: 'парабола $x^2$', f: (x) => x * x, d: (x) => 2 * x, x: [-3.6, 3.6], y: [-1, 13], x0: 3, eta: [0.01, 1.2, 0.1] },
    wells: { label: 'две ямы', f: (x) => x ** 4 - 3 * x * x + x, d: (x) => 4 * x ** 3 - 6 * x + 1, x: [-2.2, 2.2], y: [-4.2, 8], x0: 0.4, eta: [0.005, 0.15, 0.03] },
  };

  MC.widget('gd1d', (el) => {
    const fig = F.shell(el, { kicker: 'Рисунок 1', title: 'Градиентный спуск на прямой' });
    const W = plotWidth(fig.plot);
    let fn = F1.sq;
    const st = { x0: fn.x0, eta: fn.eta[2], path: [fn.x0] };
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.52), x: fn.x, y: fn.y, label: 'Шаги градиентного спуска по графику функции' });

    const choose = F.seg(Object.keys(F1).map((k) => ({ value: k, label: F1[k].label })), 'sq', (k) => {
      fn = F1[k];
      st.x0 = fn.x0;
      st.eta = fn.eta[2];
      eta.input.min = fn.eta[0];
      eta.input.max = fn.eta[1];
      eta.set(st.eta);
      p.setDomain(fn.x, fn.y);
      p.axes({ xLabel: 'x', yLabel: 'f(x)' });
      reset();
    }, 'Функция');
    const eta = F.slider({ label: 'Темп $\\eta$', min: fn.eta[0], max: fn.eta[1], step: 0.005, value: st.eta, fmt: (v) => U.fmt(v, 3), oninput: (v) => {
      st.eta = v;
      reset();
    } });
    const reset = () => {
      st.path = [st.x0];
      draw();
    };
    const step = () => {
      const x = st.path[st.path.length - 1];
      if (st.path.length > MAX_STEPS || !Number.isFinite(x) || Math.abs(x) > 1e6 || Math.abs(fn.d(x)) < 1e-6) return false;
      st.path.push(x - st.eta * fn.d(x));
      draw();
      return true;
    };
    const run = runner(fig, step, reset);
    fig.controls.append(choose.el, eta.el, run.row);
    const ro = F.readout(fig.readout, [
      { key: 't', label: 'шаг $t$' },
      { key: 'x', label: '$x_t$' },
      { key: 'f', label: '$f(x_t)$' },
      { key: 'd', label: "$f'(x_t)$" },
    ]);

    p.axes({ xLabel: 'x', yLabel: 'f(x)' });
    function draw() {
      p.clear();
      p.fn(fn.f, 'curve');
      const pts = st.path.filter((x) => Number.isFinite(x)).map((x) => [x, fn.f(x)]);
      p.path(pts, 'path-line');
      pts.slice(0, -1).forEach(([x, y]) => p.dot(x, y, 'accent small', 3.2, 'main'));
      const x = st.path[st.path.length - 1];
      const t = st.path.length - 1;
      const inView = Number.isFinite(x) && x > fn.x[0] && x < fn.x[1];
      if (inView) p.dot(x, fn.f(x), 'warm', 6);
      p.handle(st.x0, fn.f(st.x0), (pt) => {
        st.x0 = U.clamp(pt.x, fn.x[0] + 0.1, fn.x[1] - 0.1);
        run.pl.pause();
        reset();
      });
      ro.set('t', String(t));
      ro.set('x', U.fmt(x, 4), 'accent');
      ro.set('f', U.fmt(fn.f(x), 4));
      ro.set('d', U.fmt(fn.d(x), 4));
      const d = fn.d(x);
      let note = '';
      let cls = '';
      if (!Number.isFinite(x) || Math.abs(x) > 50) {
        note = 'Спуск разошёлся: темп слишком велик, каждый шаг уносит дальше от минимума.';
        cls = 'bad';
      } else if (!inView) {
        note = 'Точка улетела за край графика — шаги растут. Уменьшите η.';
        cls = 'bad';
      } else if (Math.abs(d) < 1e-3 && t > 0) {
        note = 'Сошлось за ' + U.plural(t, 'шаг', 'шага', 'шагов') + ': f′(x) ≈ 0, x ≈ ' + U.fmt(x, 3) + '.';
        cls = 'ok';
      } else if (t === 0) note = 'Старт в x₀ = ' + U.fmt(x, 2) + '. Следующий шаг: x₁ = x₀ − η·f′(x₀) = ' + U.fmt(x - st.eta * d, 3) + '.';
      else if (t >= 2 && Math.sign(st.path[t] - st.path[t - 1]) !== Math.sign(st.path[t - 1] - st.path[t - 2])) note = 'Спуск перепрыгивает минимум и качается из стороны в сторону.';
      else note = 'Шаг ' + t + ': x = ' + U.fmt(x, 4) + ', f(x) = ' + U.fmt(fn.f(x), 4) + '.';
      fig.note.className = 'fig-note' + (cls ? ' ' + cls : '');
      fig.note.textContent = note;
    }
    reset();
  });

  /* ------------------------------- рисунок 2: спуск по карте ------------------------------- */
  const F2 = {
    bowl: {
      label: 'чаша $x^2 + y^2$', f: (x, y) => x * x + y * y, g: (x, y) => [2 * x, 2 * y], start: [-2.6, 1.6], eta: [0.01, 1.05, 0.1],
      levels: Array.from({ length: 14 }, (_, k) => 0.12 * (k + 1) * (k + 1)), major: (c, i) => i % 3 === 2,
    },
    ravine: {
      label: 'овраг $x^2 + 5y^2$', f: (x, y) => x * x + 5 * y * y, g: (x, y) => [2 * x, 10 * y], start: [-2.6, 1.6], eta: [0.01, 0.22, 0.09],
      levels: Array.from({ length: 16 }, (_, k) => 0.12 * (k + 1) * (k + 1)), major: (c, i) => i % 3 === 2,
    },
    wells: {
      label: 'две ямы', f: (x, y) => (x * x - 1) ** 2 + 2 * y * y + 0.3 * x, g: (x, y) => [4 * x * (x * x - 1) + 0.3, 4 * y], start: [0.25, 1.7], eta: [0.01, 0.3, 0.05],
      levels: Array.from({ length: 24 }, (_, k) => -0.3 + 0.18 * k + 0.012 * k * k), major: (c, i) => i % 4 === 0,
    },
  };

  MC.widget('gd2d', (el) => {
    const fig = F.shell(el, { kicker: 'Рисунок 2', title: 'Спуск по карте линий уровня' });
    const W = plotWidth(fig.plot);
    let fn = F2.ravine;
    const st = { start: fn.start.slice(), eta: fn.eta[2], path: [fn.start.slice()] };
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.78 : 0.6)), x: [-3, 3], y: [-2, 2], equal: true, label: 'Линии уровня функции и путь градиентного спуска' });

    const setFn = (k) => {
      fn = F2[k];
      st.start = fn.start.slice();
      st.eta = fn.eta[2];
      eta.input.min = fn.eta[0];
      eta.input.max = fn.eta[1];
      eta.set(st.eta);
      p.back.replaceChildren();
      p.axes({ grid: false, labels: false });
      p.contours(fn.f, fn.levels, { major: fn.major, nx: 150 });
      reset();
    };
    const choose = F.seg(Object.keys(F2).map((k) => ({ value: k, label: F2[k].label })), 'ravine', setFn, 'Функция');
    const eta = F.slider({ label: 'Темп $\\eta$', min: fn.eta[0], max: fn.eta[1], step: 0.005, value: st.eta, fmt: (v) => U.fmt(v, 3), oninput: (v) => {
      st.eta = v;
      reset();
    } });
    const reset = () => {
      st.path = [st.start.slice()];
      draw();
    };
    const step = () => {
      const [x, y] = st.path[st.path.length - 1];
      const [gx, gy] = fn.g(x, y);
      if (st.path.length > MAX_STEPS || Math.hypot(x, y) > 1e6 || Math.hypot(gx, gy) < 1e-6) return false;
      st.path.push([x - st.eta * gx, y - st.eta * gy]);
      draw();
      return true;
    };
    const run = runner(fig, step, reset);
    fig.controls.append(choose.el, eta.el, run.row);
    const ro = F.readout(fig.readout, [
      { key: 't', label: 'шаг $t$' },
      { key: 'p', label: '$\\boldsymbol\\theta_t = (x; y)$' },
      { key: 'f', label: '$f(\\boldsymbol\\theta_t)$' },
      { key: 'g', label: '$|\\nabla f|$' },
    ]);

    // щелчок по карте — новый старт
    p.svg.addEventListener('click', (e) => {
      if (e.target.closest('.handle')) return;
      const pt = p.toData(e);
      st.start = [U.clamp(pt.x, -2.9, 2.9), U.clamp(pt.y, -1.9, 1.9)];
      run.pl.pause();
      reset();
    });
    p.svg.style.cursor = 'crosshair';

    function draw() {
      p.clear();
      const pts = st.path.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
      p.path(pts, 'path-line');
      pts.slice(0, -1).forEach(([x, y]) => p.dot(x, y, 'accent small', 3, 'main'));
      const [x, y] = st.path[st.path.length - 1];
      const t = st.path.length - 1;
      const [gx, gy] = fn.g(x, y);
      const gn = Math.hypot(gx, gy);
      const inView = Math.abs(x) < 3 && Math.abs(y) < 2;
      if (inView && gn > 1e-3) {
        // направление градиента — стрелка фиксированной длины; шаг −η∇f — в настоящем масштабе
        const L = 0.55;
        p.arrow(x, y, x + (gx / gn) * L, y + (gy / gn) * L, 'ink');
        p.text(x + (gx / gn) * L, y + (gy / gn) * L, '∇f', 'lbl ink', { dx: 6, dy: -6 });
        p.arrow(x, y, x - st.eta * gx, y - st.eta * gy, 'accent');
      }
      p.handle(st.start[0], st.start[1], (pt) => {
        st.start = [U.clamp(pt.x, -2.9, 2.9), U.clamp(pt.y, -1.9, 1.9)];
        run.pl.pause();
        reset();
      });
      if (inView) p.dot(x, y, 'warm', 5.5);
      ro.set('t', String(t));
      ro.set('p', '(' + U.fixed(x, 3) + '; ' + U.fixed(y, 3) + ')', 'accent');
      ro.set('f', U.fmt(fn.f(x, y), 4));
      ro.set('g', U.fmt(gn, 4));
      let note = '';
      let cls = '';
      if (!inView || !Number.isFinite(x)) {
        note = 'Спуск вылетел за пределы карты: темп больше порога устойчивости.';
        cls = 'bad';
      } else if (gn < 1e-3 && t > 0) {
        note = 'Минимум найден за ' + U.plural(t, 'шаг', 'шага', 'шагов') + ': градиент почти нулевой.';
        cls = 'ok';
      } else if (t === 0) note = 'Старт. Чёрная стрелка — градиент, перпендикулярный линии уровня; синяя — первый шаг против него.';
      else note = 'Шаг ' + t + '. Посмотрите, как путь пересекает линии уровня.';
      fig.note.className = 'fig-note' + (cls ? ' ' + cls : '');
      fig.note.textContent = note;
    }
    setFn('ravine');
  });
})();
