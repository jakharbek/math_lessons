/* Урок 7.24 «Тригонометрическая форма комплексного числа. Извлечение корней из комплексных чисел»
 * (Куликов, гл. 4, § 8). Рисунок 1 — тригонометрическая форма и формула Муавра:
 * перетаскиваемая точка z, её модуль r и аргумент φ ∈ [0; 2π), степени z, z², …, zⁿ.
 * Рисунок 2 — корни n-й степени из числа c (теорема 8.7) и из единицы (теорема 8.5):
 * вершины правильного n-угольника, первообразные корни. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const TAU = 2 * Math.PI;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Тригонометрическая форма $z = r(\\cos\\varphi + i\\sin\\varphi)$ и формула Муавра',
      title2: 'Корни $n$-й степени: вершины правильного $n$-угольника',
      aria1: 'Комплексная плоскость: точка z, её модуль и аргумент, степени z',
      aria2: 'Комплексная плоскость: число c и его корни n-й степени',
      power: 'степень $n$',
      degree: 'степень корня $n$',
      mode: 'Из какого числа',
      modeC: 'из $c$',
      modeOne: 'из $1$',
      powers: 'показать $z, z^2, \\ldots, z^n$',
      alg: '$z = a + bi$',
      mod: '$r = |z|$',
      arg: '$\\varphi$',
      pow: '$z^n$',
      cAlg: '$c$',
      root: '$|c|^{1/n}$',
      step: 'шаг $2\\pi/n$',
      prim: 'первообразных',
      zero: 'При $z = 0$ тригонометрическая форма есть ($r = 0$, $\\varphi$ любое), но аргумент не определён однозначно — теорема 8.2 требует $z \\ne 0$.',
      note1: (n, rn, pn) => 'По формуле Муавра модуль ' + (n === 1 ? 'z' : 'zⁿ') + ' равен rⁿ = ' + rn + ', аргумент — nφ, приведённый к [0; 2π): ' + pn + '. ' + (n > 1 ? 'При умножении на z точка поворачивается на φ и растягивается в r раз.' : 'Увеличьте n, чтобы увидеть степени.'),
      note2c: (n, r) => 'Все ' + n + ' корней лежат на окружности радиуса $|c|^{1/n} = ' + r + '$ и делят её на равные дуги $2\\pi/n$; $u_0$ имеет аргумент $\\varphi/n$, каждый следующий получается из предыдущего умножением на $w_1$ (поворот на $2\\pi/n$).',
      note2one: (n, list) => 'Корни из 1 — вершины правильного ' + n + '-угольника с вершиной в точке (1; 0). Закрашены первообразные: wₖ с НОД(k, ' + n + ') = 1' + (list ? ' — k = ' + list : '') + '.',
      deg: (d) => d + '°',
      pi: (q) => q + 'π',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Trigonometric form $z = r(\\cos\\varphi + i\\sin\\varphi)$ and De Moivre’s formula',
      title2: 'Roots of degree $n$: vertices of a regular $n$-gon',
      aria1: 'Complex plane: point z, its modulus and argument, powers of z',
      aria2: 'Complex plane: number c and its n-th roots',
      power: 'power $n$',
      degree: 'root degree $n$',
      mode: 'Roots of',
      modeC: 'of $c$',
      modeOne: 'of $1$',
      powers: 'show $z, z^2, \\ldots, z^n$',
      alg: '$z = a + bi$',
      mod: '$r = |z|$',
      arg: '$\\varphi$',
      pow: '$z^n$',
      cAlg: '$c$',
      root: '$|c|^{1/n}$',
      step: 'step $2\\pi/n$',
      prim: 'primitive',
      zero: 'For $z = 0$ a trigonometric form exists ($r = 0$, any $\\varphi$), but the argument is not unique — Theorem 8.2 requires $z \\ne 0$.',
      note1: (n, rn, pn) => 'By De Moivre’s formula the modulus of ' + (n === 1 ? 'z' : 'zⁿ') + ' is rⁿ = ' + rn + ', the argument is nφ reduced to [0, 2π): ' + pn + '. ' + (n > 1 ? 'Multiplying by z rotates by φ and stretches by r.' : 'Increase n to see the powers.'),
      note2c: (n, r) => 'All ' + n + ' roots lie on the circle of radius $|c|^{1/n} = ' + r + '$ and cut it into equal arcs $2\\pi/n$; $u_0$ has argument $\\varphi/n$, each next root is the previous one times $w_1$ (a turn by $2\\pi/n$).',
      note2one: (n, list) => 'The roots of 1 are the vertices of a regular ' + n + '-gon with a vertex at (1, 0). Filled: primitive roots wₖ with gcd(k, ' + n + ') = 1' + (list ? ' — k = ' + list : '') + '.',
      deg: (d) => d + '°',
      pi: (q) => q + 'π',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: 'Trigonometrik shakl $z = r(\\cos\\varphi + i\\sin\\varphi)$ va Muavr formulasi',
      title2: '$n$-darajali ildizlar: muntazam $n$-burchak uchlari',
      aria1: 'Kompleks tekislik: z nuqta, uning moduli va argumenti, z ning darajalari',
      aria2: 'Kompleks tekislik: c son va uning n-darajali ildizlari',
      power: 'daraja $n$',
      degree: 'ildiz darajasi $n$',
      mode: 'Qaysi sondan',
      modeC: '$c$ dan',
      modeOne: '$1$ dan',
      powers: '$z, z^2, \\ldots, z^n$ ni ko‘rsatish',
      alg: '$z = a + bi$',
      mod: '$r = |z|$',
      arg: '$\\varphi$',
      pow: '$z^n$',
      cAlg: '$c$',
      root: '$|c|^{1/n}$',
      step: 'qadam $2\\pi/n$',
      prim: 'boshlang‘ich',
      zero: '$z = 0$ da trigonometrik shakl bor ($r = 0$, $\\varphi$ ixtiyoriy), lekin argument yagona emas — 8.2-teorema $z \\ne 0$ ni talab qiladi.',
      note1: (n, rn, pn) => 'Muavr formulasiga ko‘ra ' + (n === 1 ? 'z' : 'zⁿ') + ' ning moduli rⁿ = ' + rn + ', argumenti — [0; 2π) ga keltirilgan nφ: ' + pn + '. ' + (n > 1 ? 'z ga ko‘paytirish φ ga burish va r marta cho‘zishdir.' : 'Darajalarni ko‘rish uchun n ni oshiring.'),
      note2c: (n, r) => 'Barcha ' + n + ' ta ildiz radiusi $|c|^{1/n} = ' + r + '$ bo‘lgan aylanada yotadi va uni teng $2\\pi/n$ yoylarga bo‘ladi; $u_0$ ning argumenti $\\varphi/n$, har bir keyingisi oldingisini $w_1$ ga ko‘paytirishdan ($2\\pi/n$ ga burish) hosil bo‘ladi.',
      note2one: (n, list) => '1 ning ildizlari — uchi (1; 0) nuqtada bo‘lgan muntazam ' + n + '-burchak uchlari. Bo‘yalganlari — boshlang‘ich ildizlar: EKUB(k, ' + n + ') = 1 bo‘lgan wₖ' + (list ? ' — k = ' + list : '') + '.',
      deg: (d) => d + '°',
      pi: (q) => q + 'π',
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const norm = (t) => ((t % TAU) + TAU) % TAU;
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  /** Угол в долях π и в градусах: «0,333π (60°)». */
  const angle = (t) => T.pi(U.fmt(t / Math.PI, 3)) + ' (' + T.deg(U.fmt((t * 180) / Math.PI, 1)) + ')';
  /** a + bi с десятичной запятой и настоящим минусом. */
  const cx = (a, b) => {
    const re = U.fixed(a, 2);
    const im = U.fixed(Math.abs(b), 2);
    return re + (b < 0 && U.fixed(b, 2) !== U.fixed(0, 2) ? ' − ' : ' + ') + im + 'i';
  };
  const circle = (p, r, cls) => {
    const pts = [];
    for (let i = 0; i <= 160; i++) pts.push([r * Math.cos((TAU * i) / 160), r * Math.sin((TAU * i) / 160)]);
    return p.path(pts, cls);
  };
  const arc = (p, r, t, cls) => {
    const pts = [];
    const n = Math.max(2, Math.round((48 * t) / TAU) + 2);
    for (let i = 0; i <= n; i++) pts.push([r * Math.cos((t * i) / n), r * Math.sin((t * i) / n)]);
    return p.path(pts, cls);
  };

  /* ------------------------- рисунок 1: тригонометрическая форма ------------------------- */
  MC.widget('trig-form', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const W = plotWidth(fig.plot);
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.72), x: [-2.4, 2.4], y: [-1.9, 1.9], equal: true, label: T.aria1 });
    const st = { a: cfg.a !== undefined ? cfg.a : 0.9, b: cfg.b !== undefined ? cfg.b : 0.6, n: cfg.n || 3, path: true };
    const ns = F.slider({ label: T.power, min: 1, max: 8, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      draw();
    } });
    const pc = F.check(T.powers, st.path, (v) => {
      st.path = v;
      draw();
    });
    fig.controls.append(ns.el, pc.el);
    const ro = F.readout(fig.readout, [
      { key: 'alg', label: T.alg },
      { key: 'mod', label: T.mod },
      { key: 'arg', label: T.arg },
      { key: 'pow', label: T.pow },
    ]);
    p.axes({ xLabel: 'Re', yLabel: 'Im' });
    function draw() {
      p.clear();
      const { a, b, n } = st;
      const r = Math.hypot(a, b);
      circle(p, 1, 'curve faint thin');
      if (r > 1e-9) circle(p, r, 'curve dash thin');
      const phi = r > 1e-9 ? norm(Math.atan2(b, a)) : 0;
      if (st.path && r > 1e-9 && n > 1) {
        const pts = [];
        for (let k = 1; k <= n; k++) pts.push([Math.pow(r, k) * Math.cos(k * phi), Math.pow(r, k) * Math.sin(k * phi)]);
        p.path(pts, 'curve faint');
        for (let k = 2; k < n; k++) p.dot(pts[k - 1][0], pts[k - 1][1], 'hollow small');
      }
      if (r > 1e-9) arc(p, Math.min(0.35, r * 0.6) + 0.12, phi, 'curve warm thin');
      p.seg(0, 0, a, b, 'curve accent');
      p.seg(a, 0, a, b, 'leg');
      p.seg(0, b, a, b, 'leg');
      const rn = Math.pow(r, n);
      const zn = [rn * Math.cos(n * phi), rn * Math.sin(n * phi)];
      if (n > 1 && r > 1e-9) {
        p.dot(zn[0], zn[1], 'warm');
        p.text(zn[0], zn[1], 'zⁿ', 'lbl warm', { dx: 9, dy: -8 });
      }
      p.text(a, b, 'z', 'lbl accent', { dx: 10, dy: -10 });
      if (r > 1e-9) p.text(Math.cos(phi / 2) * 0.62, Math.sin(phi / 2) * 0.62, 'φ', 'lbl warm', { dx: -4, dy: 5 });
      p.handle(a, b, (pt) => {
        st.a = U.clamp(pt.x, -2.2, 2.2);
        st.b = U.clamp(pt.y, -1.75, 1.75);
        if (Math.hypot(st.a, st.b) < 0.04) st.a = st.b = 0;
        draw();
      });
      ro.set('alg', cx(a, b), 'accent');
      ro.set('mod', U.fmt(r, 3));
      ro.set('arg', r > 1e-9 ? angle(phi) : '—');
      ro.set('pow', r > 1e-9 ? cx(zn[0], zn[1]) : '0', 'warm');
      fig.note.replaceChildren(r > 1e-9 ? T.note1(n, U.fmt(rn, 3), angle(norm(n * phi))) : F.rich(T.zero));
    }
    draw();
  });

  /* ------------------------- рисунок 2: корни n-й степени ------------------------- */
  MC.widget('roots-n', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const W = plotWidth(fig.plot);
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * 0.72), x: [-2.4, 2.4], y: [-1.9, 1.9], equal: true, label: T.aria2 });
    const st = { mode: cfg.mode || 'c', n: cfg.n || 5, a: cfg.a !== undefined ? cfg.a : -0.8, b: cfg.b !== undefined ? cfg.b : 1.2 };
    const ms = F.seg([{ value: 'c', label: T.modeC }, { value: 'one', label: T.modeOne }], st.mode, (v) => {
      st.mode = v;
      draw();
    }, T.mode);
    const ns = F.slider({ label: T.degree, min: 1, max: 12, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      draw();
    } });
    fig.controls.append(ms.el, ns.el);
    const ro = F.readout(fig.readout, [
      { key: 'c', label: T.cAlg },
      { key: 'root', label: T.root },
      { key: 'step', label: T.step },
      { key: 'prim', label: T.prim },
    ]);
    p.axes({ xLabel: 'Re', yLabel: 'Im' });
    function draw() {
      p.clear();
      const n = st.n;
      const one = st.mode === 'one';
      const a = one ? 1 : st.a;
      const b = one ? 0 : st.b;
      const R = Math.hypot(a, b);
      const phi = norm(Math.atan2(b, a));
      const rr = Math.pow(R, 1 / n);
      circle(p, 1, 'curve faint thin');
      if (Math.abs(rr - 1) > 1e-6) circle(p, rr, 'curve dash thin');
      const roots = [];
      for (let k = 0; k < n; k++) {
        const t = (phi + TAU * k) / n;
        roots.push([rr * Math.cos(t), rr * Math.sin(t)]);
      }
      if (n >= 3) p.polygon(roots, 'poly');
      else if (n === 2) p.seg(roots[0][0], roots[0][1], roots[1][0], roots[1][1], 'curve teal');
      p.seg(0, 0, roots[0][0], roots[0][1], 'curve teal');
      const prim = [];
      roots.forEach((q, k) => {
        const isPrim = gcd(k, n) === 1;
        if (one && isPrim) prim.push(k);
        p.dot(q[0], q[1], one ? (isPrim ? 'accent' : 'hollow') : k === 0 ? 'accent' : 'hollow');
        if (n <= 12) {
          const lab = (one ? 'w' : 'u') + String(k).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[d]).join('');
          const ang = Math.atan2(q[1], q[0]);
          p.text(q[0], q[1], lab, 'lbl', { dx: 12 * Math.cos(ang) - 6, dy: -12 * Math.sin(ang) + 4 });
        }
      });
      if (!one) {
        p.seg(0, 0, a, b, 'curve warm');
        p.text(a, b, 'c', 'lbl warm', { dx: 10, dy: -10 });
        p.handle(a, b, (pt) => {
          st.a = U.clamp(pt.x, -2.2, 2.2);
          st.b = U.clamp(pt.y, -1.75, 1.75);
          if (Math.hypot(st.a, st.b) < 0.08) {
            st.a = 0.08;
            st.b = 0;
          }
          draw();
        }, 'warm');
      }
      ro.set('c', cx(a, b), 'warm');
      ro.set('root', U.fmt(rr, 3));
      ro.set('step', T.deg(U.fmt(360 / n, 2)));
      ro.set('prim', one ? String(prim.length) : '—');
      fig.note.replaceChildren(one ? T.note2one(n, prim.length < n || n === 1 ? prim.join(', ') : '') : F.rich(T.note2c(n, U.fmt(rr, 3).replace(',', '{,}'))));
    }
    draw();
  });
})();
