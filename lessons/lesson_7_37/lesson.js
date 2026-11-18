/* Урок 7.37 «Изоморфизмы векторных пространств» (Куликов, гл. 7, § 4):
 * рисунок 1 «Координаты вектора относительно базиса» — базис на плоскости, его сетка, перетаскиваемый
 * вектор a и его координатная строка (теорема 4.1, изоморфизм f из теоремы 4.3); рисунок 2
 * «Зависимость многочленов по координатным строкам» — строки трёх многочленов в двух базисах, ранг
 * матрицы строк и вывод о зависимости (следствия 4.4 и 4.5). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Координаты вектора относительно базиса',
      t2: 'Зависимость многочленов по координатным строкам',
      aria1: 'Плоскость: базисные векторы b1, b2, сетка базиса и вектор a с разложением по базису',
      basis: 'Базис', bE: 'стандартный', bK: 'косой', bZ: 'не базис',
      vec: 'вектор $\\boldsymbol{a}$', row: 'строка $f(\\boldsymbol{a})$', a1: '$\\alpha_1$', a2: '$\\alpha_2$',
      ok: (a, r) => 'a = ' + a + ' — единственное разложение по базису; координатная строка f(a) = ' + r + '.',
      none: 'b₁ и b₂ коллинеарны — это не базис: вектор вне их прямой не раскладывается вовсе.',
      many: 'b₁ и b₂ коллинеарны — это не базис: вектор на их прямой раскладывается бесконечным числом способов, координаты не определены.',
      sys: 'Система', basis2: 'Базис', s: (k) => 'система ' + k,
      bStd: '1, x, x²', bSh: '1, x − 1, (x − 1)²',
      poly: 'многочлен', rowH: 'координатная строка',
      rank: 'ранг', verdict: 'вывод',
      dep: 'зависима', indep: 'независима',
      note: (r, k) => 'Ранг матрицы строк = ' + r + (r < k ? ' < ' + k + ': система многочленов линейно зависима (следствие 4.4), её ранг ' + r + ' (следствие 4.5).' : ' = ' + k + ': система многочленов линейно независима (следствие 4.4).') + ' Смените базис — строки изменятся, ранг нет.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Coordinates of a vector with respect to a basis',
      t2: 'Dependence of polynomials via coordinate rows',
      aria1: 'The plane: basis vectors b1, b2, the basis grid and the vector a with its expansion in the basis',
      basis: 'Basis', bE: 'standard', bK: 'skew', bZ: 'not a basis',
      vec: 'vector $\\boldsymbol{a}$', row: 'row $f(\\boldsymbol{a})$', a1: '$\\alpha_1$', a2: '$\\alpha_2$',
      ok: (a, r) => 'a = ' + a + ' is the unique expansion in the basis; the coordinate row is f(a) = ' + r + '.',
      none: 'b₁ and b₂ are collinear, so this is not a basis: a vector off their line has no expansion at all.',
      many: 'b₁ and b₂ are collinear, so this is not a basis: a vector on their line has infinitely many expansions, the coordinates are undefined.',
      sys: 'System', basis2: 'Basis', s: (k) => 'system ' + k,
      bStd: '1, x, x²', bSh: '1, x − 1, (x − 1)²',
      poly: 'polynomial', rowH: 'coordinate row',
      rank: 'rank', verdict: 'verdict',
      dep: 'dependent', indep: 'independent',
      note: (r, k) => 'Rank of the matrix of rows = ' + r + (r < k ? ' < ' + k + ': the polynomials are linearly dependent (corollary 4.4), their rank is ' + r + ' (corollary 4.5).' : ' = ' + k + ': the polynomials are linearly independent (corollary 4.4).') + ' Change the basis: the rows change, the rank does not.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Vektorning bazisga nisbatan koordinatalari',
      t2: 'Ko‘phadlarning bog‘liqligi koordinata satrlari orqali',
      aria1: 'Tekislik: b1, b2 bazis vektorlari, bazis to‘ri va bazis bo‘yicha yoyilgan a vektor',
      basis: 'Bazis', bE: 'standart', bK: 'qiya', bZ: 'bazis emas',
      vec: '$\\boldsymbol{a}$ vektor', row: '$f(\\boldsymbol{a})$ satr', a1: '$\\alpha_1$', a2: '$\\alpha_2$',
      ok: (a, r) => 'a = ' + a + ' — bazis bo‘yicha yagona yoyilma; koordinata satri f(a) = ' + r + '.',
      none: 'b₁ va b₂ kollinear — bu bazis emas: ularning to‘g‘ri chizig‘idan tashqaridagi vektor umuman yoyilmaydi.',
      many: 'b₁ va b₂ kollinear — bu bazis emas: ularning to‘g‘ri chizig‘idagi vektor cheksiz ko‘p usulda yoyiladi, koordinatalar aniqlanmagan.',
      sys: 'Sistema', basis2: 'Bazis', s: (k) => k + '-sistema',
      bStd: '1, x, x²', bSh: '1, x − 1, (x − 1)²',
      poly: 'ko‘phad', rowH: 'koordinata satri',
      rank: 'rang', verdict: 'xulosa',
      dep: 'bog‘liq', indep: 'erkli',
      note: (r, k) => 'Satrlar matritsasining rangi = ' + r + (r < k ? ' < ' + k + ': ko‘phadlar sistemasi chiziqli bog‘liq (4.4-natija), uning rangi ' + r + ' (4.5-natija).' : ' = ' + k + ': ko‘phadlar sistemasi chiziqli erkli (4.4-natija).') + ' Bazisni almashtiring — satrlar o‘zgaradi, rang o‘zgarmaydi.',
    },
  });

  const minus = (s) => String(s).replace(/-/g, '−');

  /* ---------------------- точные дроби (целые числитель и знаменатель) ---------------------- */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  function frac(p, q) {
    if (q < 0) {
      p = -p;
      q = -q;
    }
    const g = gcd(p, q);
    p /= g;
    q /= g;
    return minus(q === 1 ? String(p) : p + '/' + q);
  }
  const row = (xs) => '(' + xs.join(', ') + ')';

  /* ---------------------- Рисунок 1: координаты на плоскости ---------------------- */
  const BASES = {
    e: [[1, 0], [0, 1]],
    k: [[2, 1], [-1, 1]],
    z: [[1, 1], [2, 2]],
  };

  MC.widget('coord-plane', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { b: BASES[cfg.preset] ? cfg.preset : 'k', a: [3, 1] };
    const seg = F.seg([{ value: 'e', label: T.bE }, { value: 'k', label: T.bK }, { value: 'z', label: T.bZ }], st.b, (v) => {
      st.b = v;
      draw();
    }, T.basis);
    const lab = MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.basis)), seg.el);
    fig.controls.append(lab);
    const ro = F.readout(fig.readout, [
      { key: 'v', label: T.vec },
      { key: 'a1', label: T.a1 },
      { key: 'a2', label: T.a2 },
      { key: 'r', label: T.row },
    ]);
    let p = null;
    let lastW = 0;
    let handle = null;
    const R = 4;
    function build() {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 300, 720);
      if (W === lastW && p) return;
      lastW = W;
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.95 : 0.62)), x: [-R - 0.5, R + 0.5], y: [-R + 0.5, R - 0.5], equal: true, label: T.aria1 });
      p.axes({ xLabel: 'x', yLabel: 'y' });
      handle = null;
    }
    function move(q) {
      const x = U.clamp(Math.round(q.x), -R, R);
      const y = U.clamp(Math.round(q.y), -R + 1, R - 1);
      if (x === st.a[0] && y === st.a[1]) return;
      st.a = [x, y];
      draw();
    }
    function draw() {
      build();
      p.clear('main');
      const [b1, b2] = BASES[st.b];
      const d = b1[0] * b2[1] - b1[1] * b2[0];
      const [ax, ay] = st.a;
      // сетка базиса: прямые t·b1 + j·b2 и j·b1 + t·b2
      if (d !== 0) {
        const L = 12;
        const grid = (x1, y1, x2, y2) => p.seg(x1, y1, x2, y2, 'guide').setAttribute('style', 'stroke-dasharray: none; stroke: var(--accent); opacity: .22');
        for (let j = -8; j <= 8; j++) {
          grid(j * b2[0] - L * b1[0], j * b2[1] - L * b1[1], j * b2[0] + L * b1[0], j * b2[1] + L * b1[1]);
          grid(j * b1[0] - L * b2[0], j * b1[1] - L * b2[1], j * b1[0] + L * b2[0], j * b1[1] + L * b2[1]);
        }
      } else {
        p.seg(-12 * b1[0], -12 * b1[1], 12 * b1[0], 12 * b1[1], 'guide');
      }
      p.arrow(0, 0, b1[0], b1[1], 'accent', 'main');
      p.arrow(0, 0, b2[0], b2[1], 'accent', 'main');
      p.text(b1[0], b1[1], 'b₁', 'lbl accent', { dx: -20, dy: -10, layer: 'main' });
      p.text(b2[0], b2[1], 'b₂', 'lbl accent', { dx: -22, dy: -6, layer: 'main' });
      p.arrow(0, 0, ax, ay, 'warm', 'main');
      p.text(ax, ay, 'a', 'lbl warm', { dx: 10, dy: -10, layer: 'main' });
      ro.set('v', minus(row([ax, ay])), 'warm');
      if (d !== 0) {
        const n1 = ax * b2[1] - ay * b2[0];
        const n2 = b1[0] * ay - b1[1] * ax;
        const a1 = n1 / d;
        const px = a1 * b1[0];
        const py = a1 * b1[1];
        const dash = 'stroke: var(--warm); stroke-width: 2; stroke-dasharray: 6 5';
        p.seg(0, 0, px, py, 'guide').setAttribute('style', dash);
        p.seg(px, py, ax, ay, 'guide').setAttribute('style', dash);
        const r = row([frac(n1, d), frac(n2, d)]);
        ro.set('a1', frac(n1, d), 'accent');
        ro.set('a2', frac(n2, d), 'accent');
        ro.set('r', r, 'accent');
        const exp = frac(n1, d) + '·b₁ + ' + frac(n2, d) + '·b₂';
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.ok(exp.replace('+ −', '− '), r);
      } else {
        const onLine = ax * b1[1] - ay * b1[0] === 0;
        ro.set('a1', '—');
        ro.set('a2', '—');
        ro.set('r', '—');
        fig.note.className = 'fig-note';
        fig.note.textContent = onLine ? T.many : T.none;
      }
      if (!handle) handle = p.handle(ax, ay, move, 'warm');
      handle.place(ax, ay);
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth), 300, 720) !== lastW) draw();
    });
  });

  /* ---------------- Рисунок 2: многочлены и их координатные строки ---------------- */
  // многочлены степени не выше 2: [c0, c1, c2] = c0 + c1·x + c2·x²
  const SYSTEMS = {
    a: [[1, 1, 0], [0, 1, 1], [1, 2, 1]],
    b: [[1, 0, 0], [1, 1, 0], [1, 1, 1]],
    c: [[1, -1, 0], [0, 1, -1], [-1, 0, 1]],
  };
  // координаты в базисе 1, x − 1, (x − 1)²: p(1), p'(1), c2
  const shifted = ([c0, c1, c2]) => [c0 + c1 + c2, c1 + 2 * c2, c2];

  function polyText(c) {
    const parts = [];
    const mon = ['', 'x', 'x²'];
    c.forEach((k, i) => {
      if (k === 0) return;
      const abs = Math.abs(k);
      const body = i === 0 ? String(abs) : (abs === 1 ? '' : abs) + mon[i];
      parts.push({ neg: k < 0, body });
    });
    if (!parts.length) return '0';
    return parts.map((t, i) => (i === 0 ? (t.neg ? '−' : '') : t.neg ? ' − ' : ' + ') + t.body).join('');
  }
  /** Ранг целочисленной матрицы (исключение без деления). */
  function rank(M) {
    const A = M.map((r) => r.slice());
    const m = A.length;
    const n = A[0].length;
    let r = 0;
    for (let c = 0; c < n && r < m; c++) {
      let piv = -1;
      for (let i = r; i < m; i++) if (A[i][c] !== 0) { piv = i; break; }
      if (piv < 0) continue;
      [A[r], A[piv]] = [A[piv], A[r]];
      for (let i = r + 1; i < m; i++) {
        const f = A[i][c];
        const g = A[r][c];
        for (let k = 0; k < n; k++) A[i][k] = A[i][k] * g - A[r][k] * f;
      }
      r++;
    }
    return r;
  }

  MC.widget('coord-poly', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { s: SYSTEMS[cfg.preset] ? cfg.preset : 'a', shift: false };
    const sSeg = F.seg(Object.keys(SYSTEMS).map((k, i) => ({ value: k, label: T.s(i + 1) })), st.s, (v) => {
      st.s = v;
      draw();
    }, T.sys);
    const bSeg = F.seg([{ value: 'std', label: T.bStd }, { value: 'sh', label: T.bSh }], 'std', (v) => {
      st.shift = v === 'sh';
      draw();
    }, T.basis2);
    fig.controls.append(
      MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.sys)), sSeg.el),
      MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.basis2)), bSeg.el),
    );
    const ro = F.readout(fig.readout, [
      { key: 'r', label: T.rank },
      { key: 'v', label: T.verdict },
    ]);
    let svg = null;
    function draw() {
      const P = SYSTEMS[st.s];
      const rows = P.map((c) => (st.shift ? shifted(c) : c));
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = W < 420 ? 40 : 52; // ширина клетки матрицы
      const RH = 40;
      const left = W < 420 ? 130 : 190; // место под многочлены
      const w = left + 40 + C * 3 + 20;
      const h = RH * P.length + 30;
      if (svg) svg.remove();
      svg = MC.svg('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.t2 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const S = MC.svg;
      const y0 = 24;
      const mx = left + 40;
      svg.appendChild(S('text', { x: left - 6, y: 14, class: 'lbl', 'text-anchor': 'end', style: 'font-style: normal; font-family: var(--sans); font-size: 12px' }, T.poly));
      svg.appendChild(S('text', { x: mx + (C * 3) / 2, y: 14, class: 'lbl', 'text-anchor': 'middle', style: 'font-style: normal; font-family: var(--sans); font-size: 12px' }, T.rowH));
      const br = (x, dir) => svg.appendChild(S('path', { d: 'M' + (x + dir * 7) + ' ' + y0 + ' H' + x + ' V' + (y0 + RH * P.length) + ' H' + (x + dir * 7), class: 'leg' }));
      br(mx - 4, 1);
      br(mx + C * 3 + 4, -1);
      P.forEach((c, i) => {
        const cy = y0 + RH * i + RH / 2;
        const t = S('text', { x: left - 6, y: cy, class: 'cv', style: 'text-anchor: end; font-size: ' + (W < 420 ? 15 : 18) + 'px' }, polyText(c));
        svg.appendChild(t);
        svg.appendChild(S('text', { x: left + 18, y: cy, class: 'cv ch', style: 'font-size: 16px' }, '↦'));
        rows[i].forEach((v, k) => {
          svg.appendChild(S('text', { x: mx + C * k + C / 2, y: cy, class: 'cv', style: 'fill: var(--accent)' }, minus(v)));
        });
      });
      fig.plot.appendChild(svg);
      const r = rank(rows);
      ro.set('r', String(r), 'accent');
      ro.set('v', r < P.length ? T.dep : T.indep, r < P.length ? 'warm' : 'accent');
      fig.note.className = 'fig-note ok';
      fig.note.textContent = T.note(r, P.length);
    }
    draw();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });
})();
