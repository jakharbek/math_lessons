/* Урок 7.25 «Арифметические векторные пространства» (Куликов, гл. 5, § 1):
 * рисунок 1 «Два вектора плоскости» — линейная комбинация, (не)зависимость, определитель (упражнение 1), ранг;
 * рисунок 2 «Поиск базиса вычёркиванием» — алгоритм из доказательства теоремы 1.9 на системах из Q³. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;

  /* ---------- точная арифметика дробей (для рисунка 2) ---------- */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const fr = (n, d = 1) => {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };
  const fsub = (a, b) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
  const fmul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const fdiv = (a, b) => fr(a.n * b.d, a.d * b.n);
  const fzero = (a) => a.n === 0;
  const fstr = (a) => {
    const s = (a.n < 0 ? '−' : '') + Math.abs(a.n);
    return a.d === 1 ? s : s + '/' + a.d;
  };

  /** Решает B·c = v (столбцы B — векторы базиса) над Q. Возвращает коэффициенты или null, если v ∉ L(B). */
  function solve(cols, v) {
    const n = v.length;
    const k = cols.length;
    const M = [];
    for (let i = 0; i < n; i++) {
      const row = cols.map((c) => fr(c[i]));
      row.push(fr(v[i]));
      M.push(row);
    }
    const piv = [];
    let r = 0;
    for (let c = 0; c < k && r < n; c++) {
      let p = r;
      while (p < n && fzero(M[p][c])) p++;
      if (p === n) continue;
      [M[r], M[p]] = [M[p], M[r]];
      const inv = M[r][c];
      M[r] = M[r].map((x) => fdiv(x, inv));
      for (let i = 0; i < n; i++) {
        if (i === r || fzero(M[i][c])) continue;
        const f = M[i][c];
        M[i] = M[i].map((x, j) => fsub(x, fmul(f, M[r][j])));
      }
      piv.push(c);
      r++;
    }
    for (let i = r; i < n; i++) if (!fzero(M[i][k])) return null;
    const out = cols.map(() => fr(0));
    piv.forEach((c, i) => (out[c] = M[i][k]));
    return out;
  }

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Два вектора плоскости: линейная комбинация и линейная зависимость',
      t2: 'Поиск базиса вычёркиванием (теорема 1.9)',
      aria1: 'Векторы a и b на плоскости и их линейная комбинация',
      preset: 'Пример',
      pInd: 'независимые', pProp: 'пропорциональные', pZero: 'с нулевым вектором',
      l1: '$\\lambda_1$', l2: '$\\lambda_2$',
      a: '$\\boldsymbol{a}$', b: '$\\boldsymbol{b}$', comb: '$\\lambda_1\\boldsymbol{a} + \\lambda_2\\boldsymbol{b}$',
      det: '$\\alpha\\delta - \\beta\\gamma$', rank: 'ранг',
      ind: (d) => 'Определитель ' + d + ' ≠ 0: векторы линейно независимы (упражнение 1). Их оболочка — вся плоскость: перебирая λ₁ и λ₂, комбинацией можно попасть в любую точку.',
      dep: (d) => 'Определитель равен 0: векторы линейно зависимы — пропорциональны (упражнение 2). Их оболочка — прямая через начало координат (пунктир); комбинация с любыми λ₁, λ₂ остаётся на ней.',
      zero: 'Оба вектора нулевые: ранг 0, оболочка — одна точка 0.',
      zeroOne: 'Один из векторов нулевой: система зависима по свойству 1.1 (1 · 0 = 0 — нетривиальная нулевая комбинация). Оболочка — прямая (пунктир).',
      sys: 'Система',
      sA: 'система A', sB: 'система B', sC: 'независимая',
      step: 'Шаг', reset: 'Заново',
      colN: '№', colV: 'вектор', colS: 'что с ним',
      kept: 'оставлен', crossed: (e) => 'вычеркнут: ' + e, zeroed: 'нулевой — исключён (γ)', wait: '…',
      stepL: 'шаг', basisL: 'базис', rankL: 'ранг',
      start: 'Нажмите «Шаг»: сначала исключаются нулевые векторы, затем векторы просматриваются слева направо.',
      noZero: 'Нулевых векторов нет — исключать нечего.',
      didZero: (k) => 'Исключены нулевые векторы (преобразование (γ)): ' + k + '. Система эквивалентна исходной.',
      first: (i) => 'u' + i + ' — первый ненулевой вектор: он остаётся (u₁ ≠ 0 — условие свойства 1.3).',
      keep: (i) => 'u' + i + ' не выражается через оставленные предшествующие векторы — остаётся.',
      cross: (i, e) => 'u' + i + ' = ' + e + ' — линейная комбинация предшествующих (свойство 1.3), вычёркиваем. Система остаётся эквивалентной исходной.',
      done: (r) => 'Готово: оставшиеся векторы линейно независимы и эквивалентны всей системе — это базис. Ранг системы равен ' + r + '.',
      tableAria: 'Векторы системы и результат вычёркивания',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Two vectors of the plane: linear combination and linear dependence',
      t2: 'Finding a basis by crossing out (theorem 1.9)',
      aria1: 'Vectors a and b in the plane and their linear combination',
      preset: 'Example',
      pInd: 'independent', pProp: 'proportional', pZero: 'with the zero vector',
      l1: '$\\lambda_1$', l2: '$\\lambda_2$',
      a: '$\\boldsymbol{a}$', b: '$\\boldsymbol{b}$', comb: '$\\lambda_1\\boldsymbol{a} + \\lambda_2\\boldsymbol{b}$',
      det: '$\\alpha\\delta - \\beta\\gamma$', rank: 'rank',
      ind: (d) => 'The determinant ' + d + ' ≠ 0: the vectors are linearly independent (exercise 1). Their span is the whole plane: varying λ₁ and λ₂, the combination reaches any point.',
      dep: (d) => 'The determinant is 0: the vectors are linearly dependent, i.e. proportional (exercise 2). Their span is a line through the origin (dashed); every combination stays on it.',
      zero: 'Both vectors are zero: rank 0, the span is the single point 0.',
      zeroOne: 'One vector is zero: the system is dependent by property 1.1 (1 · 0 = 0 is a nontrivial zero combination). The span is a line (dashed).',
      sys: 'System',
      sA: 'system A', sB: 'system B', sC: 'independent',
      step: 'Step', reset: 'Restart',
      colN: 'No.', colV: 'vector', colS: 'status',
      kept: 'kept', crossed: (e) => 'crossed out: ' + e, zeroed: 'zero — removed (γ)', wait: '…',
      stepL: 'step', basisL: 'basis', rankL: 'rank',
      start: 'Press “Step”: first the zero vectors are removed, then the vectors are scanned from left to right.',
      noZero: 'There are no zero vectors to remove.',
      didZero: (k) => 'Zero vectors removed (transformation (γ)): ' + k + '. The system is equivalent to the original one.',
      first: (i) => 'u' + i + ' is the first nonzero vector: it stays (u₁ ≠ 0 is the hypothesis of property 1.3).',
      keep: (i) => 'u' + i + ' is not a combination of the kept preceding vectors — it stays.',
      cross: (i, e) => 'u' + i + ' = ' + e + ' is a combination of the preceding vectors (property 1.3): cross it out. The system stays equivalent to the original.',
      done: (r) => 'Done: the remaining vectors are linearly independent and equivalent to the whole system — a basis. The rank is ' + r + '.',
      tableAria: 'Vectors of the system and the crossing-out result',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Tekislikdagi ikki vektor: chiziqli kombinatsiya va chiziqli bog‘liqlik',
      t2: 'O‘chirish orqali bazis topish (1.9-teorema)',
      aria1: 'Tekislikdagi a va b vektorlar va ularning chiziqli kombinatsiyasi',
      preset: 'Misol',
      pInd: 'erkli', pProp: 'proporsional', pZero: 'nol vektorli',
      l1: '$\\lambda_1$', l2: '$\\lambda_2$',
      a: '$\\boldsymbol{a}$', b: '$\\boldsymbol{b}$', comb: '$\\lambda_1\\boldsymbol{a} + \\lambda_2\\boldsymbol{b}$',
      det: '$\\alpha\\delta - \\beta\\gamma$', rank: 'rang',
      ind: (d) => 'Determinant ' + d + ' ≠ 0: vektorlar chiziqli erkli (1-mashq). Ularning qobig‘i — butun tekislik: λ₁ va λ₂ ni o‘zgartirib, istalgan nuqtaga yetish mumkin.',
      dep: (d) => 'Determinant 0 ga teng: vektorlar chiziqli bog‘liq — proporsional (2-mashq). Qobiq — koordinata boshidan o‘tuvchi to‘g‘ri chiziq (punktir).',
      zero: 'Ikkala vektor ham nol: rang 0, qobiq — bitta 0 nuqta.',
      zeroOne: 'Vektorlardan biri nol: sistema 1.1-xossaga ko‘ra bog‘liq (1 · 0 = 0 — notrivial nol kombinatsiya). Qobiq — to‘g‘ri chiziq (punktir).',
      sys: 'Sistema',
      sA: 'A sistema', sB: 'B sistema', sC: 'erkli',
      step: 'Qadam', reset: 'Qaytadan',
      colN: '№', colV: 'vektor', colS: 'holati',
      kept: 'qoldirildi', crossed: (e) => 'o‘chirildi: ' + e, zeroed: 'nol — chiqarildi (γ)', wait: '…',
      stepL: 'qadam', basisL: 'bazis', rankL: 'rang',
      start: '«Qadam» ni bosing: avval nol vektorlar chiqariladi, so‘ng vektorlar chapdan o‘ngga ko‘rib chiqiladi.',
      noZero: 'Nol vektorlar yo‘q — chiqaradigan narsa yo‘q.',
      didZero: (k) => 'Nol vektorlar chiqarildi ((γ) almashtirish): ' + k + '. Sistema dastlabkisiga ekvivalent.',
      first: (i) => 'u' + i + ' — birinchi nolmas vektor: u qoladi (u₁ ≠ 0 — 1.3-xossa sharti).',
      keep: (i) => 'u' + i + ' qoldirilgan oldingi vektorlar orqali ifodalanmaydi — qoladi.',
      cross: (i, e) => 'u' + i + ' = ' + e + ' — oldingi vektorlarning chiziqli kombinatsiyasi (1.3-xossa), o‘chiramiz. Sistema dastlabkisiga ekvivalent bo‘lib qoladi.',
      done: (r) => 'Tayyor: qolgan vektorlar chiziqli erkli va butun sistemaga ekvivalent — bu bazis. Sistema rangi ' + r + '.',
      tableAria: 'Sistema vektorlari va o‘chirish natijasi',
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const snap = (v, lo, hi) => Math.round(U.clamp(v, lo, hi) * 2) / 2;
  const vec = (x, y) => '(' + U.fmt(x, 2) + U.sep() + U.fmt(y, 2) + ')';

  /* ---------------------- Рисунок 1: два вектора плоскости ---------------------- */
  MC.widget('span-2d', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const PRESETS = { ind: [[2, 1], [0.5, 2]], prop: [[2, 1], [-1, -0.5]], zero: [[1.5, 1.5], [0, 0]] };
    const st = { a: PRESETS.ind[0].slice(), b: PRESETS.ind[1].slice(), l1: 1, l2: 1, preset: 'ind' };
    const seg = F.seg([
      { value: 'ind', label: T.pInd },
      { value: 'prop', label: T.pProp },
      { value: 'zero', label: T.pZero },
    ], st.preset, (v) => {
      st.preset = v;
      st.a = PRESETS[v][0].slice();
      st.b = PRESETS[v][1].slice();
      draw();
    }, T.preset);
    const s1 = F.slider({ label: T.l1, min: -2, max: 2, step: 0.25, value: st.l1, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.l1 = v;
      draw();
    } });
    const s2 = F.slider({ label: T.l2, min: -2, max: 2, step: 0.25, value: st.l2, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.l2 = v;
      draw();
    } });
    fig.controls.append(seg.el, s1.el, s2.el);
    const ro = F.readout(fig.readout, [
      { key: 'a', label: T.a },
      { key: 'b', label: T.b },
      { key: 'c', label: T.comb },
      { key: 'd', label: T.det },
      { key: 'r', label: T.rank },
    ]);

    let p = null;
    let W = 0;
    function build() {
      W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.6)), x: [-5, 5], y: [-4, 4], equal: true, label: T.aria1 });
    }

    function draw() {
      if (!p || plotWidth(fig.plot) !== W) build();
      p.clear();
      p.axes({ xLabel: 'x', yLabel: 'y' });
      const [a1, a2] = st.a;
      const [b1, b2] = st.b;
      const D = a1 * b2 - a2 * b1;
      const aZ = a1 === 0 && a2 === 0;
      const bZ = b1 === 0 && b2 === 0;
      const rank = Math.abs(D) > 1e-12 ? 2 : aZ && bZ ? 0 : 1;
      if (rank === 2) {
        p.polygon([[-60, -60], [60, -60], [60, 60], [-60, 60]], 'area');
      } else if (rank === 1) {
        const [dx, dy] = aZ ? [b1, b2] : [a1, a2];
        const t = 20 / Math.hypot(dx, dy);
        p.seg(-dx * t, -dy * t, dx * t, dy * t, 'curve accent dash');
      }
      const c = [st.l1 * a1 + st.l2 * b1, st.l1 * a2 + st.l2 * b2];
      const pa = [st.l1 * a1, st.l1 * a2];
      if (Math.abs(st.l1) > 1e-9 && Math.abs(st.l2) > 1e-9) {
        p.seg(pa[0], pa[1], c[0], c[1], 'guide');
        p.seg(st.l2 * b1, st.l2 * b2, c[0], c[1], 'guide');
      }
      const lbl = (x, y, s, cls) => p.text(x, y, s, 'lbl ' + cls, { dx: x >= 0 ? 8 : -8, dy: y >= 0 ? -8 : 18, anchor: x >= 0 ? 'start' : 'end' });
      if (Math.hypot(c[0], c[1]) > 1e-9) p.arrow(0, 0, c[0], c[1], 'ink');
      p.dot(c[0], c[1], '', 5);
      p.text(c[0], c[1], 'λ₁a + λ₂b', 'lbl', { dx: c[0] >= 0 ? 8 : -8, dy: c[1] >= 0 ? 18 : -8, anchor: c[0] >= 0 ? 'start' : 'end' });
      if (!aZ) p.arrow(0, 0, a1, a2, 'accent');
      if (!bZ) p.arrow(0, 0, b1, b2, 'warm');
      lbl(a1, a2, 'a', 'accent');
      lbl(b1, b2, 'b', 'warm');
      p.handle(a1, a2, (pt) => {
        st.a = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
        draw();
      });
      p.handle(b1, b2, (pt) => {
        st.b = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
        draw();
      }, 'warm');
      ro.set('a', vec(a1, a2), 'accent');
      ro.set('b', vec(b1, b2), 'warm');
      ro.set('c', vec(c[0], c[1]));
      ro.set('d', U.fmt(D, 2), rank === 2 ? 'accent' : 'warm');
      ro.set('r', String(rank));
      fig.note.className = 'fig-note' + (rank === 2 ? ' ok' : '');
      fig.note.textContent = rank === 2 ? T.ind(U.fmt(D, 2)) : rank === 0 ? T.zero : aZ || bZ ? T.zeroOne : T.dep(U.fmt(D, 2));
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

  /* ---------------------- Рисунок 2: поиск базиса вычёркиванием ---------------------- */
  const SYSTEMS = {
    A: [[1, 2, 0], [2, 4, 0], [0, 1, 1], [1, 3, 1], [1, 0, 2], [2, 3, 3]],
    B: [[0, 0, 0], [1, -1, 2], [-2, 2, -4], [1, 1, 0], [3, 1, 2]],
    C: [[1, 0, 0], [1, 1, 0], [1, 1, 1]],
  };
  const sub = (i) => String(i).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('');
  const vstr = (v) => '(' + v.map((x) => U.fmt(x, 0)).join(U.sep()) + ')';

  /** Разложение u через оставленные векторы: «2u₁ − u₃». */
  function combo(coef, idx) {
    let s = '';
    coef.forEach((c, j) => {
      if (fzero(c)) return;
      const neg = c.n < 0;
      const abs = { n: Math.abs(c.n), d: c.d };
      const num = abs.n === 1 && abs.d === 1 ? '' : fstr(abs);
      const term = num + 'u' + sub(idx[j] + 1);
      s += s ? (neg ? ' − ' : ' + ') + term : (neg ? '−' : '') + term;
    });
    return s || '0';
  }

  /** Все шаги алгоритма для системы. */
  function plan(sys) {
    const steps = [];
    const zeros = [];
    sys.forEach((v, i) => {
      if (v.every((x) => x === 0)) zeros.push(i);
    });
    steps.push({ kind: 'zero', zeros });
    const kept = [];
    sys.forEach((v, i) => {
      if (zeros.includes(i)) return;
      if (!kept.length) {
        kept.push(i);
        steps.push({ kind: 'first', i });
        return;
      }
      const c = solve(kept.map((k) => sys[k]), v);
      if (c) steps.push({ kind: 'cross', i, e: combo(c, kept) });
      else {
        kept.push(i);
        steps.push({ kind: 'keep', i });
      }
    });
    return steps;
  }

  MC.widget('basis-sift', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { sys: cfg.sys || 'A', at: 0 };
    let steps = plan(SYSTEMS[st.sys]);
    const seg = F.seg([
      { value: 'A', label: T.sA },
      { value: 'B', label: T.sB },
      { value: 'C', label: T.sC },
    ], st.sys, (v) => {
      st.sys = v;
      st.at = 0;
      steps = plan(SYSTEMS[v]);
      draw();
    }, T.sys);
    const bStep = F.button(null, T.step, () => {
      if (st.at < steps.length) st.at++;
      draw();
    });
    const bReset = F.button(null, T.reset, () => {
      st.at = 0;
      draw();
    });
    fig.controls.append(seg.el, bStep, bReset);
    const ro = F.readout(fig.readout, [
      { key: 's', label: T.stepL },
      { key: 'b', label: T.basisL },
      { key: 'r', label: T.rankL },
    ]);

    function draw() {
      const sys = SYSTEMS[st.sys];
      const status = sys.map(() => ({ t: T.wait, cls: '' }));
      const done = steps.slice(0, st.at);
      let note = T.start;
      done.forEach((s) => {
        if (s.kind === 'zero') {
          s.zeros.forEach((i) => (status[i] = { t: T.zeroed, cls: 'x' }));
          note = s.zeros.length ? T.didZero(s.zeros.map((i) => 'u' + sub(i + 1)).join(', ')) : T.noZero;
        } else if (s.kind === 'first') {
          status[s.i] = { t: T.kept, cls: 'k' };
          note = T.first(sub(s.i + 1));
        } else if (s.kind === 'keep') {
          status[s.i] = { t: T.kept, cls: 'k' };
          note = T.keep(sub(s.i + 1));
        } else {
          status[s.i] = { t: T.crossed(s.e), cls: 'x' };
          note = T.cross(sub(s.i + 1), s.e);
        }
      });
      const finished = st.at >= steps.length;
      const keptIdx = status.map((s, i) => (s.cls === 'k' ? i : -1)).filter((i) => i >= 0);
      if (finished) note = T.done(keptIdx.length);
      const rows = sys.map((v, i) => {
        const s = status[i];
        const strike = s.cls === 'x' ? 'line-through' : 'none';
        return H('tr', s.cls === 'k' ? { class: 'hl' } : null,
          H('td', null, 'u' + sub(i + 1)),
          H('td', { style: 'text-decoration:' + strike + ';white-space:nowrap' }, vstr(v)),
          H('td', { style: s.cls === 'k' ? 'color:var(--accent)' : '' }, s.t));
      });
      const table = H('table', { class: 'data', style: 'min-width:0', 'aria-label': T.tableAria },
        H('thead', null, H('tr', null, H('th', null, T.colN), H('th', null, T.colV), H('th', null, T.colS))),
        H('tbody', null, ...rows));
      const strip = H('div');
      fig.plot.replaceChildren(strip, H('div', { class: 'table-wrap' }, table));
      const W = plotWidth(fig.plot);
      const m = sys.length;
      const p = new MC.Plot(strip, { width: W, height: 74, x: [0, m], y: [0, 1], label: T.tableAria, margin: { l: 8, r: 8, t: 6, b: 6 } });
      sys.forEach((v, i) => {
        const x = i + 0.5;
        const s = status[i];
        if (s.cls === 'k') p.dot(x, 0.62, 'accent', 11);
        else if (s.cls === 'x') {
          p.dot(x, 0.62, 'hollow', 11);
          p.seg(x - 0.18, 0.4, x + 0.18, 0.84, 'curve warm');
          p.seg(x - 0.18, 0.84, x + 0.18, 0.4, 'curve warm');
        } else p.dot(x, 0.62, 'hollow', 11);
        p.text(x, 0.12, 'u' + sub(i + 1), 'lbl', { anchor: 'middle' });
      });
      ro.set('s', st.at + ' / ' + steps.length);
      ro.set('b', keptIdx.length ? keptIdx.map((i) => 'u' + sub(i + 1)).join(', ') : '—', 'accent');
      ro.set('r', finished ? String(keptIdx.length) : '—');
      bStep.disabled = finished;
      fig.note.className = 'fig-note' + (finished ? ' ok' : '');
      fig.note.textContent = note;
    }
    draw();
  });
})();
