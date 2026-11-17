/* Урок 7.22 «Система действительных чисел» (Куликов, гл. 4, § 6): рисунок 1 «Фундаментальная
 * последовательность: хвост в окне ширины ε» и рисунок 2 «Деление с остатком на числовой прямой» (теорема 6.3). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Фундаментальная последовательность: весь хвост помещается в окно высоты $\\varepsilon$',
      t1Aria: 'Члены последовательности и окно высоты ε',
      seq: 'Последовательность',
      eps: 'Точность $\\varepsilon$',
      roN0: 'наименьшее $n_0$',
      roTail: 'размах хвоста $k > n_0$',
      roLim: 'предел',
      none: 'нет',
      beyond: (n) => n + ' (за краем рисунка)',
      ok: (e, n) => 'При ε = ' + e + ' подходит n₀ = ' + n + ': любые два члена с номерами больше n₀ отличаются меньше чем на ε. Уменьшайте ε — n₀ растёт, но всегда находится: последовательность фундаментальна.',
      bigEps: (e) => 'При ε = ' + e + ' подходит даже n₀ = 0: все члены лежат в окне высоты ε. Но фундаментальность требует этого для КАЖДОГО ε > 0 — уменьшите ε до 2 и меньше.',
      fail: (e) => 'При ε = ' + e + ' такого n₀ нет: соседние члены aₖ и aₖ₊₁ всегда отличаются на 2 ≥ ε. Последовательность не фундаментальна (и не сходится).',
      lim: 'предел',
      noLim: 'предела нет',
      tailLbl: 'n₀',
      dec: 'десятичные приближения $\\sqrt 2$',
      newton: 'Ньютон для $\\sqrt 2$',
      euler: '$(1 + \\frac{1}{k+1})^{k+1}$',
      alt: '$(-1)^k$',
      t2: 'Теорема 6.3: $a = mb + r$, $0 \\leqslant r < b$',
      t2Aria: 'Числовая прямая: кратные числа b, число a и остаток r',
      a: 'Число $a$',
      b: 'Делитель $b > 0$',
      roM: 'целое $m$',
      roR: 'остаток $r$',
      roCheck: 'кратное $mb$',
      note2: (a, b, m, mb, r, m1) => 'm = ' + m + ' — наибольшее целое, для которого mb ≤ a: ' + mb + ' ≤ ' + a + ' < ' + m1 + '. Остаток r = a − mb = ' + r + ' лежит в [0; ' + b + ').',
      note2zero: (a, m) => 'a = ' + a + ' делится на b нацело: m = ' + m + ', r = 0.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'A fundamental sequence: the whole tail fits into a window of height $\\varepsilon$',
      t1Aria: 'Terms of the sequence and a window of height ε',
      seq: 'Sequence',
      eps: 'Accuracy $\\varepsilon$',
      roN0: 'least $n_0$',
      roTail: 'spread of the tail $k > n_0$',
      roLim: 'limit',
      none: 'none',
      beyond: (n) => n + ' (off the picture)',
      ok: (e, n) => 'For ε = ' + e + ' the index n₀ = ' + n + ' works: any two terms with indices greater than n₀ differ by less than ε. Decrease ε: n₀ grows but always exists — the sequence is fundamental.',
      bigEps: (e) => 'For ε = ' + e + ' even n₀ = 0 works: all terms lie in a window of height ε. But fundamentality demands this for EVERY ε > 0 — decrease ε to 2 or less.',
      fail: (e) => 'For ε = ' + e + ' there is no such n₀: neighbouring terms aₖ and aₖ₊₁ always differ by 2 ≥ ε. The sequence is not fundamental (and does not converge).',
      lim: 'limit',
      noLim: 'no limit',
      tailLbl: 'n₀',
      dec: 'decimal approximations of $\\sqrt 2$',
      newton: 'Newton for $\\sqrt 2$',
      euler: '$(1 + \\frac{1}{k+1})^{k+1}$',
      alt: '$(-1)^k$',
      t2: 'Theorem 6.3: $a = mb + r$, $0 \\leqslant r < b$',
      t2Aria: 'Number line: multiples of b, the number a and the remainder r',
      a: 'Number $a$',
      b: 'Divisor $b > 0$',
      roM: 'integer $m$',
      roR: 'remainder $r$',
      roCheck: 'multiple $mb$',
      note2: (a, b, m, mb, r, m1) => 'm = ' + m + ' is the largest integer with mb ≤ a: ' + mb + ' ≤ ' + a + ' < ' + m1 + '. The remainder r = a − mb = ' + r + ' lies in [0, ' + b + ').',
      note2zero: (a, m) => 'a = ' + a + ' is divisible by b: m = ' + m + ', r = 0.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Fundamental ketma-ketlik: butun «dum» balandligi $\\varepsilon$ bo‘lgan oynaga sig‘adi',
      t1Aria: 'Ketma-ketlik hadlari va balandligi ε bo‘lgan oyna',
      seq: 'Ketma-ketlik',
      eps: 'Aniqlik $\\varepsilon$',
      roN0: 'eng kichik $n_0$',
      roTail: '$k > n_0$ dumning kengligi',
      roLim: 'limit',
      none: 'yo‘q',
      beyond: (n) => n + ' (rasm chegarasidan tashqarida)',
      ok: (e, n) => 'ε = ' + e + ' uchun n₀ = ' + n + ' mos keladi: nomeri n₀ dan katta istalgan ikki had bir-biridan ε dan kam farq qiladi. ε ni kamaytiring — n₀ o‘sadi, lekin doim topiladi: ketma-ketlik fundamental.',
      bigEps: (e) => 'ε = ' + e + ' uchun hatto n₀ = 0 ham mos: barcha hadlar balandligi ε bo‘lgan oynada. Ammo fundamentallik buni HAR BIR ε > 0 uchun talab qiladi — ε ni 2 va undan kichik qiling.',
      fail: (e) => 'ε = ' + e + ' uchun bunday n₀ yo‘q: qo‘shni aₖ va aₖ₊₁ hadlar doim 2 ≥ ε ga farq qiladi. Ketma-ketlik fundamental emas (va yaqinlashmaydi).',
      lim: 'limit',
      noLim: 'limit yo‘q',
      tailLbl: 'n₀',
      dec: '$\\sqrt 2$ ning o‘nli yaqinlashishlari',
      newton: '$\\sqrt 2$ uchun Nyuton usuli',
      euler: '$(1 + \\frac{1}{k+1})^{k+1}$',
      alt: '$(-1)^k$',
      t2: '6.3-teorema: $a = mb + r$, $0 \\leqslant r < b$',
      t2Aria: 'Son o‘qi: b ning karralilari, a son va r qoldiq',
      a: '$a$ son',
      b: '$b > 0$ bo‘luvchi',
      roM: 'butun $m$',
      roR: '$r$ qoldiq',
      roCheck: '$mb$ karrali',
      note2: (a, b, m, mb, r, m1) => 'm = ' + m + ' — mb ≤ a bo‘ladigan eng katta butun son: ' + mb + ' ≤ ' + a + ' < ' + m1 + '. Qoldiq r = a − mb = ' + r + ' [0; ' + b + ') oraliqda yotadi.',
      note2zero: (a, m) => 'a = ' + a + ' b ga qoldiqsiz bo‘linadi: m = ' + m + ', r = 0.',
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const SQRT2 = Math.SQRT2;

  /* Последовательности рисунка 1. kind: 'inc' — неубывающая к L, 'dec' — (с k ≥ 1) невозрастающая к L,
   * 'alt' — (−1)^k. Для монотонного хвоста размах {a_k : k > n} = |L − a_{n+1}|, и он не достигается,
   * поэтому |a_k − a_m| < ε для всех k, m > n  ⇔  |L − a_{n+1}| ≤ ε. */
  const newtonCache = [1];
  const SEQS = {
    dec: { kind: 'inc', L: SQRT2, y: [1.35, 1.43], a: (k) => Math.floor(SQRT2 * Math.pow(10, k)) / Math.pow(10, k) },
    newton: {
      kind: 'dec', L: SQRT2, y: [1.39, 1.51],
      a: (k) => {
        while (newtonCache.length <= k) {
          const x = newtonCache[newtonCache.length - 1];
          newtonCache.push(x / 2 + 1 / x);
        }
        return newtonCache[k];
      },
    },
    euler: { kind: 'inc', L: Math.E, y: [1.9, 2.8], a: (k) => Math.exp((k + 1) * Math.log1p(1 / (k + 1))) },
    alt: { kind: 'alt', L: null, y: [-1.6, 1.6], a: (k) => (k % 2 === 0 ? 1 : -1) },
  };

  /** Наименьшее n₀ ≥ 0 с |L − a_{n0+1}| ≤ ε (монотонный хвост); двоичный поиск, хвост монотонен с k = 1. */
  function leastN0(s, eps) {
    if (s.kind === 'alt') return eps > 2 ? 0 : null;
    const gap = (n) => Math.abs(s.L - s.a(n + 1));
    if (gap(0) <= eps) return 0;
    let lo = 0;
    let hi = 1;
    while (gap(hi) > eps) {
      lo = hi;
      hi *= 2;
      if (hi > 1e12) return null;
    }
    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (gap(mid) <= eps) hi = mid;
      else lo = mid;
    }
    return hi;
  }

  /* ------------------------- рисунок 1: фундаментальная последовательность ------------------------- */
  MC.widget('cauchy-window', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const W = plotWidth(fig.plot);
    const KMAX = 24;
    const st = { key: cfg.seq || 'dec', e: cfg.eps ? Math.log10(cfg.eps) : -2 };
    // сверху — поле под подпись оси aₖ, снизу — второй ряд под подписью делений для «n₀ = …»
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.5) + 40, x: [-0.8, KMAX + 0.8], y: SEQS[st.key].y, label: T.t1Aria, margin: { l: 46, t: 26, b: 50 } });
    // подпись оси — над областью точек (в верхнем поле), чтобы не спорить с подписью n₀ и точками
    const axes = () => {
      p.axes({ xLabel: 'k' });
      p.text(0, p.yd[1], 'aₖ', 'lbl', { dx: 6, dy: -10, layer: 'back' });
    };
    const opts = ['dec', 'newton', 'euler', 'alt'].map((k) => ({ value: k, label: T[k] }));
    const choose = F.seg(opts, st.key, (k) => {
      st.key = k;
      p.setDomain(null, SEQS[k].y);
      axes();
      draw();
    }, T.seq);
    const es = F.slider({ label: T.eps, min: -6, max: 0.6, step: 0.01, value: st.e, map: (v) => Math.pow(10, v), fmt: (v) => U.fmt(v, v < 0.01 ? 6 : 3), oninput: () => {
      st.e = Number(es.input.value);
      draw();
    } });
    fig.controls.append(choose.el, es.el);
    const ro = F.readout(fig.readout, [
      { key: 'n0', label: T.roN0 },
      { key: 'tail', label: T.roTail },
      { key: 'lim', label: T.roLim },
    ]);
    axes();

    function draw() {
      p.clear();
      const s = SEQS[st.key];
      const eps = Math.pow(10, st.e);
      const n0 = leastN0(s, eps);
      const es3 = U.fmt(eps, eps < 0.01 ? 6 : 3);
      if (s.L !== null) {
        p.seg(-0.8, s.L, KMAX + 0.8, s.L, 'guide');
        p.text(KMAX + 0.6, s.L, T.lim, 'lbl', { dy: -6, anchor: 'end' });
      }
      if (n0 !== null) {
        // окно высоты ε, в котором лежит весь хвост k > n₀
        let lo;
        if (s.kind === 'inc') lo = s.a(n0 + 1);
        else if (s.kind === 'dec') lo = s.L;
        else lo = -1;
        const x0 = Math.min(n0 + 0.5, KMAX + 0.8);
        if (x0 < KMAX + 0.8) p.polygon([[x0, lo], [KMAX + 0.8, lo], [KMAX + 0.8, lo + eps], [x0, lo + eps]], 'area');
        if (n0 <= KMAX) {
          p.seg(n0 + 0.5, s.y[0], n0 + 0.5, s.y[1], 'guide');
          // подпись n₀ — под осью, под подписями делений, у основания пунктира; у краёв прижимаем внутрь
          const X = p.sx(n0 + 0.5);
          const anchor = X < 60 ? 'start' : X > W - 60 ? 'end' : 'middle';
          p.text(n0 + 0.5, s.y[0], T.tailLbl + ' = ' + n0, 'lbl accent', { dx: anchor === 'start' ? -4 : anchor === 'end' ? 4 : 0, dy: 40, anchor });
        }
      }
      for (let k = 0; k <= KMAX; k++) {
        const v = s.a(k);
        const inTail = n0 !== null && k > n0;
        if (v >= s.y[0] && v <= s.y[1]) p.dot(k, v, inTail ? 'accent' : s.kind === 'alt' && n0 === null ? 'warm' : '', 4);
      }
      if (n0 === null) {
        ro.set('n0', T.none, 'warn');
        ro.set('tail', '2');
        fig.note.className = 'fig-note';
        fig.note.textContent = T.fail(es3);
      } else {
        ro.set('n0', n0 > KMAX ? T.beyond(n0) : String(n0), 'accent');
        const spread = s.kind === 'alt' ? 2 : Math.abs(s.L - s.a(n0 + 1));
        ro.set('tail', U.fmt(spread, spread < 0.01 ? 7 : 4));
        fig.note.className = 'fig-note ok';
        fig.note.textContent = s.kind === 'alt' ? T.bigEps(es3) : T.ok(es3, n0);
      }
      ro.set('lim', s.L === null ? T.noLim : (st.key === 'euler' ? 'e ≈ ' : '√2 ≈ ') + U.fmt(s.L, 6));
    }
    draw();
  });

  /* ------------------------- рисунок 2: деление с остатком (теорема 6.3) ------------------------- */
  MC.widget('real-division', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const W = plotWidth(fig.plot);
    // a и b храним в десятых долях — целыми, чтобы m и r считались точно
    const st = { A: Math.round((cfg.a !== undefined ? cfg.a : -3.7) * 10), B: Math.round((cfg.b || 1.5) * 10) };
    const p = new MC.Plot(fig.plot, { width: W, height: Math.max(170, Math.round(W * 0.28)), x: [-8.5, 8.5], y: [-1.1, 1.5], label: T.t2Aria, margin: { l: 16, r: 16, t: 10, b: 10 } });
    const as = F.slider({ label: T.a, min: -75, max: 75, step: 1, value: st.A, map: (v) => v / 10, fmt: (v) => U.fmt(v, 1), oninput: () => {
      st.A = Number(as.input.value);
      draw();
    } });
    const bs = F.slider({ label: T.b, min: 3, max: 40, step: 1, value: st.B, map: (v) => v / 10, fmt: (v) => U.fmt(v, 1), oninput: () => {
      st.B = Number(bs.input.value);
      draw();
    } });
    fig.controls.append(as.el, bs.el);
    const ro = F.readout(fig.readout, [
      { key: 'm', label: T.roM },
      { key: 'r', label: T.roR },
      { key: 'c', label: T.roCheck },
    ]);
    p.axes({ yTicks: [], xTicks: [], labels: false, grid: false });

    function draw() {
      p.clear();
      const A = st.A;
      const B = st.B;
      const m = Math.floor(A / B);
      const R = A - m * B; // 0 ≤ R < B, точно в целых
      const a = A / 10;
      const b = B / 10;
      const r = R / 10;
      // кратные mb на прямой
      for (let j = Math.ceil(-85 / B); j * B <= 85; j++) {
        const x = (j * B) / 10;
        p.seg(x, -0.18, x, 0.18, 'leg');
        const every = W < 520 ? (B < 15 ? 3 : 2) : B < 8 ? 2 : 1;
        if (j % every === 0) p.text(x, -0.18, j === 0 ? '0' : (j === 1 ? '' : j === -1 ? '−' : String(j).replace('-', '−')) + 'b', 'lbl', { dy: 18, anchor: 'middle' });
      }
      const mb = (m * B) / 10;
      // отрезок-остаток r от mb до a и следующий шаг до (m+1)b
      p.seg(mb, 0.75, mb + b, 0.75, 'curve faint');
      p.seg(mb, 0, mb, 0.75, 'guide');
      p.seg(a, 0, a, 0.75, 'guide');
      if (R > 0) p.arrow(mb, 0.75, a, 0.75, 'warm', 'front', 7);
      p.text((mb + a) / 2, 0.75, 'r', 'lbl warm', { dy: -10, anchor: 'middle' });
      p.text(mb + b, 0.75, '(m+1)b', 'lbl', { dx: 4, dy: 4 });
      p.dot(mb, 0, 'warm', 5);
      p.dot(a, 0, 'accent', 6);
      p.text(a, 0, 'a', 'lbl accent', { dx: 8, dy: -8 });
      p.text(mb, 0, 'mb', 'lbl warm', { dx: -8, dy: -8, anchor: 'end' });
      const f1 = (v) => U.fmt(v, 1);
      ro.set('m', String(m).replace('-', '−'), 'accent');
      ro.set('r', f1(r), 'warm');
      ro.set('c', f1(mb), 'warm');
      fig.note.className = 'fig-note';
      fig.note.textContent = R === 0 ? T.note2zero(f1(a), String(m).replace('-', '−')) : T.note2(f1(a), f1(b), String(m).replace('-', '−'), f1(mb), f1(r), f1(((m + 1) * B) / 10));
    }
    draw();
  });

  if (typeof module !== 'undefined') module.exports = { SEQS, leastN0 };
})();
