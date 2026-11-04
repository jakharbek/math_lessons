/* Урок 6.1 «Градиент и градиентный спуск»: спуск на прямой и спуск по карте линий уровня. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const MAX_STEPS = 200;
  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);

  /* ------------------------------- строки рисунков: ru / en / uz ------------------------------- */
  const T = MC.i18n.pick({
    ru: {
      step: 'Шаг', play: 'Пуск', pause: 'Пауза', reset: 'Сначала', fnLabel: 'Функция', eta: 'Темп $\\eta$',
      stepT: 'шаг $t$',
      steps: (t) => U.plural(t, 'шаг', 'шага', 'шагов'),
      f1: {
        kicker: 'Рисунок 1', title: 'Градиентный спуск на прямой', aria: 'Шаги градиентного спуска по графику функции',
        sq: 'парабола $x^2$', wells: 'две ямы',
        diverged: 'Спуск разошёлся: темп слишком велик, каждый шаг уносит дальше от минимума.',
        away: 'Точка улетела за край графика — шаги растут. Уменьшите η.',
        converged: (steps, x) => 'Сошлось за ' + steps + ': f′(x) ≈ 0, x ≈ ' + x + '.',
        start: (x0, x1) => 'Старт в x₀ = ' + x0 + '. Следующий шаг: x₁ = x₀ − η·f′(x₀) = ' + x1 + '.',
        overshoot: 'Спуск перепрыгивает минимум и качается из стороны в сторону.',
        stepN: (t, x, f) => 'Шаг ' + t + ': x = ' + x + ', f(x) = ' + f + '.',
      },
      f2: {
        kicker: 'Рисунок 2', title: 'Спуск по карте линий уровня', aria: 'Линии уровня функции и путь градиентного спуска',
        bowl: 'чаша $x^2 + y^2$', ravine: 'овраг $x^2 + 5y^2$', wells: 'две ямы',
        point: '$\\boldsymbol\\theta_t = (x; y)$',
        away: 'Спуск вылетел за пределы карты: темп больше порога устойчивости.',
        found: (steps) => 'Минимум найден за ' + steps + ': градиент почти нулевой.',
        start: 'Старт. Чёрная стрелка — градиент, перпендикулярный линии уровня; синяя — первый шаг против него.',
        stepN: (t) => 'Шаг ' + t + '. Посмотрите, как путь пересекает линии уровня.',
      },
    },
    en: {
      step: 'Step', play: 'Run', pause: 'Pause', reset: 'Restart', fnLabel: 'Function', eta: 'Rate $\\eta$',
      stepT: 'step $t$',
      steps: (t) => MC.i18n.count(t, { en: ['step', 'steps'] }, 'en'),
      f1: {
        kicker: 'Figure 1', title: 'Gradient descent on a line', aria: 'Steps of gradient descent along the graph of a function',
        sq: 'parabola $x^2$', wells: 'two wells',
        diverged: 'The descent diverged: the rate is too large, and every step carries it farther from the minimum.',
        away: 'The point flew off the edge of the graph: the steps are growing. Decrease η.',
        converged: (steps, x) => 'Converged in ' + steps + ': f′(x) ≈ 0, x ≈ ' + x + '.',
        start: (x0, x1) => 'Start at x₀ = ' + x0 + '. Next step: x₁ = x₀ − η·f′(x₀) = ' + x1 + '.',
        overshoot: 'The descent jumps over the minimum and swings from side to side.',
        stepN: (t, x, f) => 'Step ' + t + ': x = ' + x + ', f(x) = ' + f + '.',
      },
      f2: {
        kicker: 'Figure 2', title: 'Descent on a contour map', aria: 'Level curves of the function and the path of gradient descent',
        bowl: 'bowl $x^2 + y^2$', ravine: 'ravine $x^2 + 5y^2$', wells: 'two wells',
        point: '$\\boldsymbol\\theta_t = (x, y)$',
        away: 'The descent flew off the map: the rate is above the stability threshold.',
        found: (steps) => 'Minimum found in ' + steps + ': the gradient is almost zero.',
        start: 'Start. The black arrow is the gradient, perpendicular to the level curve; the blue one is the first step against it.',
        stepN: (t) => 'Step ' + t + '. Watch how the path crosses the level curves.',
      },
    },
    uz: {
      step: 'Qadam', play: 'Boshlash', pause: 'Pauza', reset: 'Boshidan', fnLabel: 'Funksiya', eta: 'Tezlik $\\eta$',
      stepT: 'qadam $t$',
      steps: (t) => t + ' qadamda',
      f1: {
        kicker: '1-rasm', title: 'To‘g‘ri chiziqda gradiyent tushish', aria: 'Funksiya grafigi bo‘ylab gradiyent tushish qadamlari',
        sq: 'parabola $x^2$', wells: 'ikki chuqurlik',
        diverged: 'Tushish uzoqlashib ketdi: tezlik juda katta, har bir qadam minimumdan yanada uzoqlashtiradi.',
        away: 'Nuqta grafik chegarasidan chiqib ketdi — qadamlar o‘smoqda. η ni kamaytiring.',
        converged: (steps, x) => steps + ' yaqinlashdi: f′(x) ≈ 0, x ≈ ' + x + '.',
        start: (x0, x1) => 'Boshlanish: x₀ = ' + x0 + '. Keyingi qadam: x₁ = x₀ − η·f′(x₀) = ' + x1 + '.',
        overshoot: 'Tushish minimumdan sakrab o‘tib, u yoqdan bu yoqqa tebranmoqda.',
        stepN: (t, x, f) => t + '-qadam: x = ' + x + ', f(x) = ' + f + '.',
      },
      f2: {
        kicker: '2-rasm', title: 'Sath chiziqlari xaritasi bo‘ylab tushish', aria: 'Funksiyaning sath chiziqlari va gradiyent tushish yo‘li',
        bowl: 'kosa $x^2 + y^2$', ravine: 'jarlik $x^2 + 5y^2$', wells: 'ikki chuqurlik',
        point: '$\\boldsymbol\\theta_t = (x; y)$',
        away: 'Tushish xarita chegarasidan chiqib ketdi: tezlik barqarorlik chegarasidan katta.',
        found: (steps) => 'Minimum ' + steps + ' topildi: gradiyent deyarli nolga teng.',
        start: 'Boshlanish. Qora strelka — sath chizig‘iga perpendikulyar gradiyent; ko‘k strelka — unga qarshi birinchi qadam.',
        stepN: (t) => t + '-qadam. Yo‘l sath chiziqlarini qanday kesib o‘tishini kuzating.',
      },
    },
  });

  /** Кнопки «Шаг», «Пуск/Пауза», «Сначала» и плеер, вызывающий step() по таймеру. */
  function runner(fig, step, reset) {
    const stepBtn = F.button('step', T.step, () => {
      pl.pause();
      step();
    });
    const playBtn = F.button('play', T.play, () => pl.toggle());
    const resetBtn = F.button('reset', T.reset, () => {
      pl.pause();
      reset();
    });
    const pl = F.player(step, {
      interval: 380,
      onchange: (on) => playBtn.replaceChildren(MC.ui.icon(on ? 'pause' : 'play'), on ? T.pause : T.play),
    });
    const row = MC.h('div', { class: 'row' }, stepBtn, playBtn, resetBtn);
    return { row, pl };
  }

  /* ------------------------------- рисунок 1: спуск на прямой ------------------------------- */
  const F1 = {
    sq: { label: T.f1.sq, f: (x) => x * x, d: (x) => 2 * x, x: [-3.6, 3.6], y: [-1, 13], x0: 3, eta: [0.01, 1.2, 0.1] },
    wells: { label: T.f1.wells, f: (x) => x ** 4 - 3 * x * x + x, d: (x) => 4 * x ** 3 - 6 * x + 1, x: [-2.2, 2.2], y: [-4.2, 8], x0: 0.4, eta: [0.005, 0.15, 0.03] },
  };

  MC.widget('gd1d', (el) => {
    const fig = F.shell(el, { kicker: T.f1.kicker, title: T.f1.title });
    const W = plotWidth(fig.plot);
    let fn = F1.sq;
    const st = { x0: fn.x0, eta: fn.eta[2], path: [fn.x0] };
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.52), x: fn.x, y: fn.y, label: T.f1.aria });

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
    }, T.fnLabel);
    const eta = F.slider({ label: T.eta, min: fn.eta[0], max: fn.eta[1], step: 0.005, value: st.eta, fmt: (v) => U.fmt(v, 3), oninput: (v) => {
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
      { key: 't', label: T.stepT },
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
        note = T.f1.diverged;
        cls = 'bad';
      } else if (!inView) {
        note = T.f1.away;
        cls = 'bad';
      } else if (Math.abs(d) < 1e-3 && t > 0) {
        note = T.f1.converged(T.steps(t), U.fmt(x, 3));
        cls = 'ok';
      } else if (t === 0) note = T.f1.start(U.fmt(x, 2), U.fmt(x - st.eta * d, 3));
      else if (t >= 2 && Math.sign(st.path[t] - st.path[t - 1]) !== Math.sign(st.path[t - 1] - st.path[t - 2])) note = T.f1.overshoot;
      else note = T.f1.stepN(t, U.fmt(x, 4), U.fmt(fn.f(x), 4));
      fig.note.className = 'fig-note' + (cls ? ' ' + cls : '');
      fig.note.textContent = note;
    }
    reset();
  });

  /* ------------------------------- рисунок 2: спуск по карте ------------------------------- */
  const F2 = {
    bowl: {
      label: T.f2.bowl, f: (x, y) => x * x + y * y, g: (x, y) => [2 * x, 2 * y], start: [-2.6, 1.6], eta: [0.01, 1.05, 0.1],
      levels: Array.from({ length: 14 }, (_, k) => 0.12 * (k + 1) * (k + 1)), major: (c, i) => i % 3 === 2,
    },
    ravine: {
      label: T.f2.ravine, f: (x, y) => x * x + 5 * y * y, g: (x, y) => [2 * x, 10 * y], start: [-2.6, 1.6], eta: [0.01, 0.22, 0.09],
      levels: Array.from({ length: 16 }, (_, k) => 0.12 * (k + 1) * (k + 1)), major: (c, i) => i % 3 === 2,
    },
    wells: {
      label: T.f2.wells, f: (x, y) => (x * x - 1) ** 2 + 2 * y * y + 0.3 * x, g: (x, y) => [4 * x * (x * x - 1) + 0.3, 4 * y], start: [0.25, 1.7], eta: [0.01, 0.3, 0.05],
      levels: Array.from({ length: 24 }, (_, k) => -0.3 + 0.18 * k + 0.012 * k * k), major: (c, i) => i % 4 === 0,
    },
  };

  MC.widget('gd2d', (el) => {
    const fig = F.shell(el, { kicker: T.f2.kicker, title: T.f2.title });
    const W = plotWidth(fig.plot);
    let fn = F2.ravine;
    const st = { start: fn.start.slice(), eta: fn.eta[2], path: [fn.start.slice()] };
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.78 : 0.6)), x: [-3, 3], y: [-2, 2], equal: true, label: T.f2.aria });

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
    const choose = F.seg(Object.keys(F2).map((k) => ({ value: k, label: F2[k].label })), 'ravine', setFn, T.fnLabel);
    const eta = F.slider({ label: T.eta, min: fn.eta[0], max: fn.eta[1], step: 0.005, value: st.eta, fmt: (v) => U.fmt(v, 3), oninput: (v) => {
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
      { key: 't', label: T.stepT },
      { key: 'p', label: T.f2.point },
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
      ro.set('p', '(' + U.fixed(x, 3) + U.sep() + U.fixed(y, 3) + ')', 'accent');
      ro.set('f', U.fmt(fn.f(x, y), 4));
      ro.set('g', U.fmt(gn, 4));
      let note = '';
      let cls = '';
      if (!inView || !Number.isFinite(x)) {
        note = T.f2.away;
        cls = 'bad';
      } else if (gn < 1e-3 && t > 0) {
        note = T.f2.found(T.steps(t));
        cls = 'ok';
      } else if (t === 0) note = T.f2.start;
      else note = T.f2.stepN(t);
      fig.note.className = 'fig-note' + (cls ? ' ' + cls : '');
      fig.note.textContent = note;
    }
    setFn('ravine');
  });
})();
