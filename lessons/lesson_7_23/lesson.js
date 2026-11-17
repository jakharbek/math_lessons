/* Урок 7.23 «Поле комплексных чисел» (Куликов, гл. 4, § 7): рисунок 1 «Комплексная плоскость» —
 * сумма по правилу параллелограмма, произведение, сопряжённое и противоположное число;
 * рисунок 2 «Множества точек» — условия упражнения 2 на модуль. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  /** Комплексное число a + bi для табло: «2 + i», «−0,5i», «3». */
  const cnum = (a, b) => {
    const B = Math.abs(b);
    const im = (B === 1 ? '' : U.fmt(B, 2)) + 'i';
    if (b === 0) return U.fmt(a, 2);
    if (a === 0) return (b < 0 ? '−' : '') + im;
    return U.fmt(a, 2) + (b < 0 ? ' − ' : ' + ') + im;
  };

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Комплексная плоскость: число — точка, сумма — параллелограмм',
      t2: 'Множества точек: условия на модуль (упражнение 2)',
      aria1: 'Комплексная плоскость с точками z₁ и z₂',
      aria2: 'Множество точек комплексной плоскости',
      mode: 'Что показать',
      sum: 'сумма',
      prod: 'произведение',
      conj: 'сопряжённое и противоположное',
      z1: '$z_1$', z2: '$z_2$', res: 'результат',
      m1: '$|z_1|$', m2: '$|z_2|$', mr: 'модуль результата',
      num: (a, b) => cnum(a, b),
      noteSum: (r1, r2, r) => 'z₃ = z₁ + z₂: коэффициенты складываются по отдельности, поэтому вектор OM₃ — диагональ параллелограмма на OM₁ и OM₂. Неравенство треугольника (теорема 7.8 (5)): |z₁ + z₂| = ' + r + ' ≤ |z₁| + |z₂| = ' + r1 + '.',
      noteProd: (r1, r2, r) => 'z₁z₂ = (ac − bd) + (ad + bc)i. Модуль произведения равен произведению модулей (теорема 7.8 (3)): ' + r + ' = ' + r1 + ' · ' + r2 + '.',
      noteConj: 'z̄₁ — отражение z₁ относительно действительной оси, −z₁ — относительно начала координат. Все три точки лежат на одной окружности радиуса |z₁|: модуль у них один.',
      cond: 'Условие',
      aS: 'радиус $a$',
      inside: 'Точка z удовлетворяет условию',
      outside: 'Точка z не удовлетворяет условию',
      zLbl: 'точка $z$',
      val: 'левая часть',
      verdict: 'выполнено?',
      yes: 'да', no: 'нет',
      desc: {
        a: (a) => '|z| = a: окружность радиуса ' + a + ' с центром в начале координат.',
        b: (a, c) => '|z − c| = a: окружность радиуса ' + a + ' с центром c = ' + c + ' (перетащите c).',
        c: (a) => '|z| < a: открытый круг радиуса ' + a + ' — без граничной окружности (пунктир).',
        d: (a, c) => '|z − c| < a: открытый круг радиуса ' + a + ' с центром c = ' + c + '.',
        e: '|z − 1| ≤ 1: замкнутый круг радиуса 1 с центром 1, граница входит.',
        f: '|z − 1 − i| < √2: открытый круг радиуса √2 с центром 1 + i; он проходит через 0 и 2 + 2i, но они не входят.',
        g: '|z − 1| + |z + 1| = 2: сумма расстояний до точек 1 и −1 равна расстоянию между ними — это отрезок [−1; 1] действительной оси (вырожденный эллипс).',
      },
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'The complex plane: a number is a point, a sum is a parallelogram',
      t2: 'Point sets: conditions on the modulus (exercise 2)',
      aria1: 'The complex plane with points z₁ and z₂',
      aria2: 'A set of points of the complex plane',
      mode: 'Show',
      sum: 'sum',
      prod: 'product',
      conj: 'conjugate and opposite',
      z1: '$z_1$', z2: '$z_2$', res: 'result',
      m1: '$|z_1|$', m2: '$|z_2|$', mr: 'modulus of the result',
      num: (a, b) => cnum(a, b),
      noteSum: (r1, r2, r) => 'z₃ = z₁ + z₂: the coefficients add separately, so OM₃ is the diagonal of the parallelogram on OM₁ and OM₂. Triangle inequality (theorem 7.8 (5)): |z₁ + z₂| = ' + r + ' ≤ |z₁| + |z₂| = ' + r1 + '.',
      noteProd: (r1, r2, r) => 'z₁z₂ = (ac − bd) + (ad + bc)i. The modulus of a product is the product of the moduli (theorem 7.8 (3)): ' + r + ' = ' + r1 + ' · ' + r2 + '.',
      noteConj: 'z̄₁ is the mirror image of z₁ in the real axis, −z₁ in the origin. All three points lie on one circle of radius |z₁|.',
      cond: 'Condition',
      aS: 'radius $a$',
      inside: 'The point z satisfies the condition',
      outside: 'The point z does not satisfy the condition',
      zLbl: 'point $z$',
      val: 'left-hand side',
      verdict: 'holds?',
      yes: 'yes', no: 'no',
      desc: {
        a: (a) => '|z| = a: the circle of radius ' + a + ' centred at the origin.',
        b: (a, c) => '|z − c| = a: the circle of radius ' + a + ' centred at c = ' + c + ' (drag c).',
        c: (a) => '|z| < a: the open disc of radius ' + a + ', the boundary circle (dashed) excluded.',
        d: (a, c) => '|z − c| < a: the open disc of radius ' + a + ' centred at c = ' + c + '.',
        e: '|z − 1| ≤ 1: the closed disc of radius 1 centred at 1, boundary included.',
        f: '|z − 1 − i| < √2: the open disc of radius √2 centred at 1 + i; it passes through 0 and 2 + 2i, which are excluded.',
        g: '|z − 1| + |z + 1| = 2: the sum of the distances to 1 and −1 equals the distance between them — the segment [−1, 1] of the real axis (a degenerate ellipse).',
      },
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Kompleks tekislik: son — nuqta, yig‘indi — parallelogramm',
      t2: 'Nuqtalar to‘plami: modul shartlari (2-mashq)',
      aria1: 'z₁ va z₂ nuqtali kompleks tekislik',
      aria2: 'Kompleks tekislik nuqtalari to‘plami',
      mode: 'Ko‘rsatish',
      sum: 'yig‘indi',
      prod: 'ko‘paytma',
      conj: 'qo‘shma va qarama-qarshi',
      z1: '$z_1$', z2: '$z_2$', res: 'natija',
      m1: '$|z_1|$', m2: '$|z_2|$', mr: 'natija moduli',
      num: (a, b) => cnum(a, b),
      noteSum: (r1, r2, r) => 'z₃ = z₁ + z₂: koeffitsiyentlar alohida qo‘shiladi, shuning uchun OM₃ — OM₁ va OM₂ ga qurilgan parallelogramm diagonali. Uchburchak tengsizligi (7.8-teorema (5)): |z₁ + z₂| = ' + r + ' ≤ |z₁| + |z₂| = ' + r1 + '.',
      noteProd: (r1, r2, r) => 'z₁z₂ = (ac − bd) + (ad + bc)i. Ko‘paytma moduli modullar ko‘paytmasiga teng (7.8-teorema (3)): ' + r + ' = ' + r1 + ' · ' + r2 + '.',
      noteConj: 'z̄₁ — z₁ ning haqiqiy o‘qqa nisbatan, −z₁ — koordinata boshiga nisbatan aksi. Uchala nuqta radiusi |z₁| bo‘lgan bitta aylanada yotadi.',
      cond: 'Shart',
      aS: '$a$ radius',
      inside: 'z nuqta shartni qanoatlantiradi',
      outside: 'z nuqta shartni qanoatlantirmaydi',
      zLbl: '$z$ nuqta',
      val: 'chap tomon',
      verdict: 'bajariladimi?',
      yes: 'ha', no: 'yo‘q',
      desc: {
        a: (a) => '|z| = a: markazi koordinata boshida, radiusi ' + a + ' bo‘lgan aylana.',
        b: (a, c) => '|z − c| = a: markazi c = ' + c + ', radiusi ' + a + ' bo‘lgan aylana (c ni suring).',
        c: (a) => '|z| < a: radiusi ' + a + ' bo‘lgan ochiq doira, chegara aylana (punktir) kirmaydi.',
        d: (a, c) => '|z − c| < a: markazi c = ' + c + ', radiusi ' + a + ' bo‘lgan ochiq doira.',
        e: '|z − 1| ≤ 1: markazi 1, radiusi 1 bo‘lgan yopiq doira, chegara kiradi.',
        f: '|z − 1 − i| < √2: markazi 1 + i, radiusi √2 bo‘lgan ochiq doira; u 0 va 2 + 2i orqali o‘tadi, lekin ular kirmaydi.',
        g: '|z − 1| + |z + 1| = 2: 1 va −1 gacha masofalar yig‘indisi ular orasidagi masofaga teng — haqiqiy o‘qning [−1; 1] kesmasi (aynigan ellips).',
      },
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const snap = (v, lo, hi) => Math.round(U.clamp(v, lo, hi) * 4) / 4;
  const mod = (a, b) => Math.hypot(a, b);
  const circle = (cx, cy, r, n = 160) => {
    const pts = [];
    for (let k = 0; k <= n; k++) pts.push([cx + r * Math.cos((2 * Math.PI * k) / n), cy + r * Math.sin((2 * Math.PI * k) / n)]);
    return pts;
  };

  /* ---------------------- Рисунок 1: операции на комплексной плоскости ---------------------- */
  MC.widget('complex-plane', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const W = plotWidth(fig.plot);
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.95 : 0.62)), x: [-5, 5], y: [-4, 4], equal: true, label: T.aria1 });
    const st = { mode: cfg.mode || 'sum', z1: cfg.z1 || [2, 1], z2: cfg.z2 || [1, 2.5] };
    const modeSeg = F.seg([
      { value: 'sum', label: T.sum },
      { value: 'prod', label: T.prod },
      { value: 'conj', label: T.conj },
    ], st.mode, (v) => {
      st.mode = v;
      draw();
    }, T.mode);
    fig.controls.append(modeSeg.el);
    const ro = F.readout(fig.readout, [
      { key: 'z1', label: T.z1 },
      { key: 'z2', label: T.z2 },
      { key: 'r', label: T.res },
      { key: 'm1', label: T.m1 },
      { key: 'm2', label: T.m2 },
      { key: 'mr', label: T.mr },
    ]);
    p.axes({ xLabel: 'Re', yLabel: 'Im' });

    function draw() {
      const [a, b] = st.z1;
      const [c, d] = st.z2;
      p.clear();
      const lbl = (x, y, s, cls) => p.text(x, y, s, 'lbl ' + cls, { dx: x >= 0 ? 8 : -8, dy: y >= 0 ? -8 : 18, anchor: x >= 0 ? 'start' : 'end' });
      let res;
      if (st.mode === 'sum') {
        res = [a + c, b + d];
        p.polygon([[0, 0], [a, b], res, [c, d]], 'area');
        p.seg(a, b, res[0], res[1], 'guide');
        p.seg(c, d, res[0], res[1], 'guide');
        p.arrow(0, 0, res[0], res[1], 'ink');
        lbl(res[0], res[1], 'z₁ + z₂', 'ink');
      } else if (st.mode === 'prod') {
        res = [a * c - b * d, a * d + b * c];
        const r = mod(res[0], res[1]);
        p.path(circle(0, 0, r), 'curve faint');
        p.arrow(0, 0, res[0], res[1], 'ink');
        lbl(res[0], res[1], 'z₁z₂', 'ink');
      } else {
        res = [a, -b];
        p.path(circle(0, 0, mod(a, b)), 'curve faint');
        p.seg(a, b, a, -b, 'guide');
        p.seg(a, b, -a, -b, 'guide');
        p.dot(a, -b, 'accent');
        p.dot(-a, -b, 'warm');
        lbl(a, -b, 'z̄₁', 'accent');
        lbl(-a, -b, '−z₁', 'warm');
      }
      p.arrow(0, 0, a, b, 'accent');
      lbl(a, b, 'z₁', 'accent');
      if (st.mode !== 'conj') {
        p.arrow(0, 0, c, d, 'warm');
        lbl(c, d, 'z₂', 'warm');
        p.handle(c, d, (pt) => {
          st.z2 = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
          draw();
        }, 'warm');
      }
      p.handle(a, b, (pt) => {
        st.z1 = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
        draw();
      });
      const m1 = mod(a, b);
      const m2 = mod(c, d);
      const mr = mod(res[0], res[1]);
      ro.set('z1', T.num(a, b), 'accent');
      ro.set('z2', st.mode === 'conj' ? '—' : T.num(c, d), 'warm');
      ro.set('r', st.mode === 'conj' ? T.num(a, -b) : T.num(res[0], res[1]));
      ro.set('m1', U.fmt(m1, 3));
      ro.set('m2', st.mode === 'conj' ? '—' : U.fmt(m2, 3));
      ro.set('mr', U.fmt(mr, 3));
      fig.note.className = 'fig-note';
      fig.note.textContent =
        st.mode === 'sum'
          ? T.noteSum(U.fmt(m1 + m2, 3), U.fmt(m2, 3), U.fmt(mr, 3))
          : st.mode === 'prod'
            ? T.noteProd(U.fmt(m1, 3), U.fmt(m2, 3), U.fmt(mr, 3))
            : T.noteConj;
    }
    draw();
  });

  /* ---------------------- Рисунок 2: множества точек из упражнения 2 ---------------------- */
  const CONDS = {
    a: { plain: '|z| = a', tex: '$|z| = a$', lhs: (x, y) => mod(x, y), test: (v, a) => Math.abs(v - a) < 0.13, usesA: true },
    b: { plain: '|z − c| = a', tex: '$|z - c| = a$', lhs: (x, y, c) => mod(x - c[0], y - c[1]), test: (v, a) => Math.abs(v - a) < 0.13, usesA: true, usesC: true },
    c: { plain: '|z| < a', tex: '$|z| < a$', lhs: (x, y) => mod(x, y), test: (v, a) => v < a, usesA: true },
    d: { plain: '|z − c| < a', tex: '$|z - c| < a$', lhs: (x, y, c) => mod(x - c[0], y - c[1]), test: (v, a) => v < a, usesA: true, usesC: true },
    e: { plain: '|z − 1| ≤ 1', tex: '$|z - 1| \\le 1$', lhs: (x, y) => mod(x - 1, y), test: (v) => v <= 1 + 1e-9 },
    f: { plain: '|z − 1 − i| < √2', tex: '$|z - 1 - i| < \\sqrt2$', lhs: (x, y) => mod(x - 1, y - 1), test: (v) => v < Math.SQRT2 - 1e-9 },
    g: { plain: '|z − 1| + |z + 1| = 2', tex: '$|z - 1| + |z + 1| = 2$', lhs: (x, y) => mod(x - 1, y) + mod(x + 1, y), test: (v) => Math.abs(v - 2) < 0.05 },
  };

  MC.widget('complex-sets', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const W = plotWidth(fig.plot);
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.95 : 0.62)), x: [-4, 4], y: [-3, 3], equal: true, label: T.aria2 });
    const st = { k: cfg.cond || 'f', a: 2, c: [1, 1], z: [0.5, 0.5] };
    const cSeg = F.seg(Object.keys(CONDS).map((k) => ({ value: k, label: '$\\mathrm{(' + k + ')}$' })), st.k, (v) => {
      st.k = v;
      aS.el.style.display = CONDS[v].usesA ? '' : 'none';
      draw();
    }, T.cond);
    const aS = F.slider({ label: T.aS, min: 0.5, max: 3, step: 0.25, value: st.a, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.a = v;
      draw();
    } });
    aS.el.style.display = CONDS[st.k].usesA ? '' : 'none';
    fig.controls.append(cSeg.el, aS.el);
    const ro = F.readout(fig.readout, [
      { key: 'cond', label: T.cond },
      { key: 'z', label: T.zLbl },
      { key: 'v', label: T.val },
      { key: 'ok', label: T.verdict },
    ]);
    p.axes({ xLabel: 'Re', yLabel: 'Im' });

    function draw() {
      const C = CONDS[st.k];
      const a = st.a;
      p.clear();
      const disk = (cx, cy, r, open) => {
        p.polygon(circle(cx, cy, r), 'area');
        p.path(circle(cx, cy, r), 'curve accent' + (open ? ' dash' : ''));
      };
      const ring = (cx, cy, r) => p.path(circle(cx, cy, r), 'curve accent');
      if (st.k === 'a') ring(0, 0, a);
      else if (st.k === 'b') ring(st.c[0], st.c[1], a);
      else if (st.k === 'c') disk(0, 0, a, true);
      else if (st.k === 'd') disk(st.c[0], st.c[1], a, true);
      else if (st.k === 'e') disk(1, 0, 1, false);
      else if (st.k === 'f') {
        disk(1, 1, Math.SQRT2, true);
        p.dot(0, 0, 'hollow');
        p.dot(2, 2, 'hollow');
      } else {
        p.seg(-1, 0, 1, 0, 'curve accent');
        p.dot(-1, 0, 'accent');
        p.dot(1, 0, 'accent');
      }
      if (C.usesC) {
        p.text(st.c[0], st.c[1], 'c', 'lbl warm', { dx: 10, dy: -10 });
        p.handle(st.c[0], st.c[1], (pt) => {
          st.c = [snap(pt.x, -3, 3), snap(pt.y, -2.5, 2.5)];
          draw();
        }, 'warm');
      }
      const [x, y] = st.z;
      const v = C.lhs(x, y, st.c);
      const ok = C.test(v, a);
      p.text(x, y, 'z', 'lbl', { dx: 10, dy: -10 });
      p.handle(x, y, (pt) => {
        st.z = [Math.round(U.clamp(pt.x, -3.8, 3.8) * 20) / 20, Math.round(U.clamp(pt.y, -2.8, 2.8) * 20) / 20];
        draw();
      }, ok ? 'accent' : '');
      ro.set('cond', C.plain);
      ro.set('z', T.num(x, y));
      ro.set('v', U.fmt(v, 3));
      ro.set('ok', ok ? T.yes : T.no, ok ? 'accent' : 'warm');
      const d = T.desc[st.k];
      const cTxt = T.num(st.c[0], st.c[1]);
      fig.note.className = 'fig-note' + (ok ? ' ok' : '');
      fig.note.textContent = (typeof d === 'function' ? d(U.fmt(a, 2), cTxt) : d) + ' ' + (ok ? T.inside : T.outside) + '.';
    }
    draw();
  });
})();
