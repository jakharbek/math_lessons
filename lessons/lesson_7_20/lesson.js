/* Урок 7.20 «Кольцо целых чисел» (Куликов, гл. 4, § 4): рисунок 1 «Целые числа как классы пар»
 * и рисунок 2 «Деление с остатком на числовой прямой». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Пары $\\langle m, n\\rangle$ и классы $[m, n]$',
      title2: 'Деление с остатком: $a = bq + r$, $0 \\leqslant r < |b|$',
      aria1: 'Сетка пар натуральных чисел; диагонали — классы эквивалентности',
      aria2: 'Числовая прямая: кратные b, точка bq и остаток r',
      pair: 'Пара',
      canon: 'Канонические',
      a: 'пара A',
      b: 'пара B',
      sum: 'сумма (4)',
      prod: 'произведение (1)',
      cls: (m, n) => '[' + m + ', ' + n + ']',
      val: (v) => U.fmt(v, 0),
      note1: (am, an, bm, bn, d1, d2) => 'Класс A — все пары с m − n = ' + U.fmt(d1, 0) + ' (синяя диагональ), класс B — с m − n = ' + U.fmt(d2, 0) + ' (оранжевая). Сумма [' + (am + bm) + ', ' + (an + bn) + '] лежит на диагонали m − n = ' + U.fmt(d1 + d2, 0) + ' (пунктир). Нажмите на точку сетки, чтобы выбрать пару.',
      aLab: 'a',
      bLab: 'b',
      q: 'неполное частное $q$',
      r: 'остаток $r$',
      eq: 'запись',
      zero: 'Делитель b = 0: деление с остатком не определено (теорема 4.4 требует b > 0, упражнение 23 — b ≠ 0).',
      note2: (a, b, q, r) => U.fmt(a, 0) + ' = ' + U.fmt(b, 0) + ' · ' + (q < 0 ? '(' + U.fmt(q, 0) + ')' : U.fmt(q, 0)) + ' + ' + r + '. Точка bq — наибольшее кратное |b|, не превосходящее a; остаток r = a − bq лежит в [0; ' + Math.abs(b) + ').' + (b < 0 ? ' При b < 0 это обобщение из упражнения 23: q = −q′, где q′ — неполное частное от деления a на |b|.' : ''),
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Pairs $\\langle m, n\\rangle$ and classes $[m, n]$',
      title2: 'Division with remainder: $a = bq + r$, $0 \\leqslant r < |b|$',
      aria1: 'Grid of pairs of natural numbers; diagonals are equivalence classes',
      aria2: 'Number line: multiples of b, the point bq and the remainder r',
      pair: 'Pair',
      canon: 'Canonical',
      a: 'pair A',
      b: 'pair B',
      sum: 'sum (4)',
      prod: 'product (1)',
      cls: (m, n) => '[' + m + ', ' + n + ']',
      val: (v) => U.fmt(v, 0),
      note1: (am, an, bm, bn, d1, d2) => 'Class A: all pairs with m − n = ' + U.fmt(d1, 0) + ' (blue diagonal); class B: m − n = ' + U.fmt(d2, 0) + ' (orange). The sum [' + (am + bm) + ', ' + (an + bn) + '] lies on the diagonal m − n = ' + U.fmt(d1 + d2, 0) + ' (dashed). Click a grid point to choose a pair.',
      aLab: 'a',
      bLab: 'b',
      q: 'quotient $q$',
      r: 'remainder $r$',
      eq: 'equation',
      zero: 'Divisor b = 0: division with remainder is undefined (Theorem 4.4 needs b > 0, Exercise 23 needs b ≠ 0).',
      note2: (a, b, q, r) => U.fmt(a, 0) + ' = ' + U.fmt(b, 0) + ' · ' + (q < 0 ? '(' + U.fmt(q, 0) + ')' : U.fmt(q, 0)) + ' + ' + r + '. The point bq is the largest multiple of |b| not exceeding a; the remainder r = a − bq lies in [0, ' + Math.abs(b) + ').' + (b < 0 ? ' For b < 0 this is the generalization of Exercise 23: q = −q′, where q′ is the quotient of a by |b|.' : ''),
    },
    uz: {
      fig: (n) => 'Rasm ' + n,
      title1: 'Juftliklar $\\langle m, n\\rangle$ va sinflar $[m, n]$',
      title2: 'Qoldiqli bo‘lish: $a = bq + r$, $0 \\leqslant r < |b|$',
      aria1: 'Natural sonlar juftliklari to‘ri; diagonallar — ekvivalentlik sinflari',
      aria2: 'Sonlar o‘qi: b ga karralilar, bq nuqta va r qoldiq',
      pair: 'Juftlik',
      canon: 'Kanonik',
      a: 'A juftlik',
      b: 'B juftlik',
      sum: 'yig‘indi (4)',
      prod: 'ko‘paytma (1)',
      cls: (m, n) => '[' + m + ', ' + n + ']',
      val: (v) => U.fmt(v, 0),
      note1: (am, an, bm, bn, d1, d2) => 'A sinf — m − n = ' + U.fmt(d1, 0) + ' bo‘lgan barcha juftliklar (ko‘k diagonal), B sinf — m − n = ' + U.fmt(d2, 0) + ' (to‘q sariq). Yig‘indi [' + (am + bm) + ', ' + (an + bn) + '] m − n = ' + U.fmt(d1 + d2, 0) + ' diagonalida yotadi (punktir). Juftlikni tanlash uchun to‘r nuqtasini bosing.',
      aLab: 'a',
      bLab: 'b',
      q: 'to‘liqmas bo‘linma $q$',
      r: 'qoldiq $r$',
      eq: 'yozuv',
      zero: 'Bo‘luvchi b = 0: qoldiqli bo‘lish aniqlanmagan (4.4-teorema b > 0 ni, 23-mashq b ≠ 0 ni talab qiladi).',
      note2: (a, b, q, r) => U.fmt(a, 0) + ' = ' + U.fmt(b, 0) + ' · ' + (q < 0 ? '(' + U.fmt(q, 0) + ')' : U.fmt(q, 0)) + ' + ' + r + '. bq nuqta — |b| ning a dan oshmaydigan eng katta karralisi; qoldiq r = a − bq [0; ' + Math.abs(b) + ') oraliqda.' + (b < 0 ? ' b < 0 da bu 23-mashqdagi umumlashma: q = −q′, bu yerda q′ — a ni |b| ga bo‘lishdagi to‘liqmas bo‘linma.' : ''),
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 300, 720);

  /* =================================================================================
   * Рисунок 1. Точки сетки — пары ⟨m, n⟩ (m по горизонтали, n по вертикали), класс [m, n] —
   * диагональ m − n = const. Две пары A и B, их сумма по формуле (4) и естественное
   * произведение по формуле (1) раздела «Естественное умножение».
   * ================================================================================= */
  MC.widget('int-pairs', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const G = 12;
    const st = { A: (cfg.a || [7, 2]).slice(), B: (cfg.b || [1, 4]).slice(), which: 'A' };
    const seg = F.seg([{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }], st.which, (v) => (st.which = v), T.pair);
    const pairLabel = MC.h('span', null, T.pair);
    const canonB = F.button(null, T.canon, () => {
      for (const k of ['A', 'B']) {
        const d = st[k][0] - st[k][1];
        st[k] = [Math.max(d, 0), Math.max(-d, 0)];
      }
      draw();
    });
    fig.controls.append(MC.h('div', { class: 'row' }, pairLabel, seg.el, canonB));
    const ro = F.readout(fig.readout, [
      { key: 'a', label: T.a },
      { key: 'b', label: T.b },
      { key: 's', label: T.sum },
      { key: 'p', label: T.prod },
    ]);

    let p = null;
    let W = 0;
    function build() {
      W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.78), x: [-0.6, G + 0.6], y: [-0.6, G + 0.6], equal: true, label: T.aria1, margin: { l: 30, r: 10, t: 10, b: 26 } });
      const ticks = [];
      for (let i = 0; i <= G; i += 2) ticks.push(i);
      p.axes({ xTicks: ticks, yTicks: ticks, xLabel: 'm', yLabel: 'n', zero: true });
      p.svg.style.cursor = 'pointer';
      p.svg.addEventListener('click', (e) => {
        const d = p.toData(e);
        const m = U.clamp(Math.round(d.x), 0, G);
        const n = U.clamp(Math.round(d.y), 0, G);
        st[st.which] = [m, n];
        draw();
      });
    }

    const diag = (d, cls) => {
      // прямая n = m − d в пределах сетки
      const x0 = Math.max(0, d);
      const x1 = Math.min(G, G + d);
      if (x1 >= x0) p.seg(x0 - 0.4, x0 - 0.4 - d, x1 + 0.4, x1 + 0.4 - d, cls, 'main');
    };

    function draw() {
      if (!p || plotWidth(fig.plot) !== W) build();
      p.clear();
      const [am, an] = st.A;
      const [bm, bn] = st.B;
      const d1 = am - an;
      const d2 = bm - bn;
      diag(d1 + d2, 'curve dash');
      diag(d1, 'curve accent');
      diag(d2, 'curve warm');
      const r = W < 480 ? 2.2 : 3;
      for (let m = 0; m <= G; m++) {
        for (let n = 0; n <= G; n++) {
          const on1 = m - n === d1;
          const on2 = m - n === d2;
          p.dot(m, n, on1 ? 'accent small' : on2 ? 'warm small' : 'hollow small', on1 || on2 ? r + 0.8 : r, 'main');
        }
      }
      p.dot(am, an, 'accent', 7);
      p.text(am, an, 'A', 'lbl accent', { dx: 8, dy: -8 });
      p.dot(bm, bn, 'warm', 7);
      p.text(bm, bn, 'B', 'lbl warm', { dx: 8, dy: -8 });
      const sm = am + bm;
      const sn = an + bn;
      if (sm <= G && sn <= G) {
        p.dot(sm, sn, 'hollow', 7);
        p.text(sm, sn, 'A+B', 'lbl', { dx: 8, dy: -8 });
      }
      const pm = am * bm + an * bn;
      const pn = am * bn + an * bm;
      ro.set('a', T.cls(am, an) + ' → ' + T.val(d1));
      ro.set('b', T.cls(bm, bn) + ' → ' + T.val(d2));
      ro.set('s', T.cls(sm, sn) + ' → ' + T.val(sm - sn));
      ro.set('p', T.cls(pm, pn) + ' → ' + T.val(pm - pn));
      fig.note.textContent = T.note1(am, an, bm, bn, d1, d2);
    }
    draw();
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (plotWidth(fig.plot) !== W) draw();
      }, 150);
    });
  });

  /* =================================================================================
   * Рисунок 2. Деление с остатком на числовой прямой: кратные |b|, точка bq (наибольшее
   * кратное, не превосходящее a) и остаток r — стрелка от bq до a. Теорема 4.4 и упражнение 23.
   * ================================================================================= */
  MC.widget('division', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { a: cfg.a !== undefined ? cfg.a : -17, b: cfg.b !== undefined ? cfg.b : 5 };
    const aS = F.slider({ label: '$a$', min: -40, max: 40, step: 1, value: st.a, fmt: (v) => U.fmt(Math.round(v), 0), oninput: (v) => {
      st.a = Math.round(v);
      draw();
    } });
    const bS = F.slider({ label: '$b$', min: -9, max: 9, step: 1, value: st.b, fmt: (v) => U.fmt(Math.round(v), 0), oninput: (v) => {
      st.b = Math.round(v);
      draw();
    } });
    fig.controls.append(aS.el, bS.el);
    const ro = F.readout(fig.readout, [
      { key: 'q', label: T.q },
      { key: 'r', label: T.r },
      { key: 'e', label: T.eq },
    ]);

    let p = null;
    let W = 0;
    function build() {
      W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: W < 480 ? 150 : 170, x: [-45, 45], y: [-1, 1.6], label: T.aria2, margin: { l: 12, r: 12, t: 8, b: 26 } });
    }
    /** Видимый участок прямой: от min(0, bq) − |b| до max(0, a) + |b| — так деления читаются и на телефоне. */
    function frame(lo, hi) {
      p.setDomain([lo, hi], [-1, 1.6]);
      p.axes({ yTicks: [], grid: false, zero: true, xCount: W < 480 ? 5 : 9 });
    }

    function draw() {
      if (!p || plotWidth(fig.plot) !== W) build();
      p.clear();
      const { a, b } = st;
      if (b === 0) {
        frame(Math.min(0, a) - 3, Math.max(0, a) + 3);
        p.dot(a, 0, '', 6);
        p.text(a, 0, T.aLab, 'lbl', { dx: -4, dy: 22 });
        ro.set('q', '—');
        ro.set('r', '—');
        ro.set('e', '—');
        fig.note.textContent = T.zero;
        return;
      }
      const B = Math.abs(b);
      const q1 = Math.floor(a / B);
      const r = a - B * q1;
      const q = b > 0 ? q1 : -q1;
      const bq = b * q;
      const lo = Math.min(0, bq) - B - 2;
      const hi = Math.max(0, a) + B + 2;
      const pad = Math.max(0, 14 - (hi - lo)) / 2;
      frame(lo - pad, hi + pad);
      for (let k = Math.ceil((lo - pad) / B); k * B <= hi + pad; k++) p.seg(k * B, -0.18, k * B, 0.18, k === 0 ? 'curve' : 'curve faint', 'main');
      if (r > 0) p.arrow(bq, 0.55, a, 0.55, 'warm');
      p.seg(bq, 0, bq, 0.55, 'guide', 'main');
      p.seg(a, 0, a, 0.55, 'guide', 'main');
      p.dot(bq, 0, 'accent', 6);
      p.text(bq, 0, 'bq = ' + U.fmt(bq, 0), 'lbl accent', { dy: 24, anchor: a >= bq + 8 || r === 0 ? 'middle' : 'end' });
      p.dot(a, 0, '', 5);
      if (r > 0) {
        p.text(a, 0, T.aLab + ' = ' + U.fmt(a, 0), 'lbl', { dy: 24, anchor: 'start', dx: 4 });
        p.text((a + bq) / 2, 0.55, 'r = ' + r, 'lbl warm', { dy: -10, anchor: 'middle' });
      }
      ro.set('q', U.fmt(q, 0));
      ro.set('r', U.fmt(r, 0));
      ro.set('e', U.fmt(a, 0) + ' = ' + U.fmt(b, 0) + '·' + (q < 0 ? '(' + U.fmt(q, 0) + ')' : U.fmt(q, 0)) + ' + ' + r);
      fig.note.textContent = T.note2(a, b, q, r);
    }
    draw();
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (plotWidth(fig.plot) !== W) draw();
      }, 150);
    });
  });
})();
