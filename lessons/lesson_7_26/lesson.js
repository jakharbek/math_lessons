/* Урок 7.26 «Системы линейных уравнений» (Куликов, гл. 5, § 2): рисунок 1 «Элементарные преобразования
 * по шагам» — метод Гаусса над строками расширенной матрицы с рангами r(A), r(B) и выводом по теореме
 * Кронекера — Капелли; рисунок 2 «Две прямые» — система двух уравнений с двумя переменными на плоскости,
 * прямые ассоциированной однородной системы и множество решений c + L (теорема 2.17). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;

  /* ---------- точные дроби: элементарные преобразования над Q без погрешностей ---------- */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const Q = (n, d = 1) => {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };
  const qadd = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
  const qmul = (a, b) => Q(a.n * b.n, a.d * b.d);
  const qdiv = (a, b) => Q(a.n * b.d, a.d * b.n);
  const qneg = (a) => Q(-a.n, a.d);
  const qzero = (a) => a.n === 0;
  const qstr = (a) => (a.n < 0 ? '−' : '') + Math.abs(a.n) + (a.d === 1 ? '' : '/' + a.d);
  /** Коэффициент для текста: «2», «−1/2», «(−1/2)» в произведении. */
  const qpar = (a) => (a.n < 0 ? '(' + qstr(a) + ')' : qstr(a));

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Элементарные преобразования строк расширенной матрицы по шагам',
      t2: 'Система двух уравнений: две прямые на плоскости',
      aria2: 'Прямые двух уравнений и их общие точки',
      sys: 'Система',
      unique: 'одно решение', inf: 'бесконечно много', none: 'нет решений', hom: 'однородная',
      step: 'Шаг', back: 'Назад', reset: 'Сначала',
      rA: '$r(A)$', rB: '$r(B)$', nVars: 'переменных $n$', verdict: 'вывод',
      start: 'Исходная система. Все следующие системы равносильны ей (теорема 2.5).',
      swap: (i, j) => 'Перестановка строк ' + i + ' и ' + j + ' (цепочка преобразований (α) и (β)).',
      scale: (i, c) => '(α): строка ' + i + ' умножена на ' + c + '.',
      add: (i, c, j) => '(β): к строке ' + i + ' прибавлена строка ' + j + ', умноженная на ' + c + '.',
      drop: (i) => '(γ): исключено нулевое уравнение 0 = 0 (строка ' + i + ').',
      done: 'Преобразования закончены.',
      vYes: 'совместна', vNo: 'несовместна', freeL: 'свободных переменных',
      contra: 'Строка 0 … 0 | ≠ 0 — уравнение 0 = c, c ≠ 0: система несовместна.',
      sol: (s) => 'Решение: ' + s + '.',
      free: (s) => 'Общее решение: ' + s + '.',
      a2: '$a_2$', b2: '$b_2$', c2: '$c_2$',
      homChk: 'однородная система',
      count: 'решений',
      one: 'одно', many: 'бесконечно', zero: 'нет',
      nOne: (p) => 'Прямые пересекаются в одной точке ' + p + ': r(A) = r(B) = 2 = n, решение единственно (следствие 2.18).',
      nMany: 'Прямые совпадают: второе уравнение — кратное первого, r(A) = r(B) = 1. Решения — вся прямая c + L, где L — пунктирная прямая решений однородной системы через начало координат (теорема 2.17).',
      nNone: 'Прямые параллельны и не совпадают: r(A) = 1 < r(B) = 2 — система несовместна (теорема Кронекера — Капелли).',
      nZero: 'Второе уравнение 0 = 0 ничего не требует (его можно исключить, (γ)); решения — вся первая прямая.',
      nZeroBad: 'Второе уравнение 0 = c₂ при c₂ ≠ 0 — противоречие: решений нет.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Elementary row operations on the augmented matrix, step by step',
      t2: 'A system of two equations: two lines in the plane',
      aria2: 'Lines of two equations and their common points',
      sys: 'System',
      unique: 'one solution', inf: 'infinitely many', none: 'no solutions', hom: 'homogeneous',
      step: 'Step', back: 'Back', reset: 'Start over',
      rA: '$r(A)$', rB: '$r(B)$', nVars: 'variables $n$', verdict: 'verdict',
      start: 'The original system. Every following system is equivalent to it (theorem 2.5).',
      swap: (i, j) => 'Rows ' + i + ' and ' + j + ' swapped (a chain of operations (α) and (β)).',
      scale: (i, c) => '(α): row ' + i + ' multiplied by ' + c + '.',
      add: (i, c, j) => '(β): row ' + j + ' times ' + c + ' added to row ' + i + '.',
      drop: (i) => '(γ): the zero equation 0 = 0 removed (row ' + i + ').',
      done: 'No more operations.',
      vYes: 'consistent', vNo: 'inconsistent', freeL: 'free variables',
      contra: 'Row 0 … 0 | ≠ 0 is the equation 0 = c, c ≠ 0: the system is inconsistent.',
      sol: (s) => 'Solution: ' + s + '.',
      free: (s) => 'General solution: ' + s + '.',
      a2: '$a_2$', b2: '$b_2$', c2: '$c_2$',
      homChk: 'homogeneous system',
      count: 'solutions',
      one: 'one', many: 'infinite', zero: 'none',
      nOne: (p) => 'The lines meet at one point ' + p + ': r(A) = r(B) = 2 = n, the solution is unique (corollary 2.18).',
      nMany: 'The lines coincide: the second equation is a multiple of the first, r(A) = r(B) = 1. The solutions form the whole line c + L, where L is the dashed line of solutions of the homogeneous system through the origin (theorem 2.17).',
      nNone: 'The lines are parallel and distinct: r(A) = 1 < r(B) = 2 — the system is inconsistent (Kronecker–Capelli theorem).',
      nZero: 'The second equation 0 = 0 requires nothing (it can be removed, (γ)); the solutions are the whole first line.',
      nZeroBad: 'The second equation 0 = c₂ with c₂ ≠ 0 is a contradiction: no solutions.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Kengaytirilgan matritsa satrlarini elementar almashtirishlar bosqichma-bosqich',
      t2: 'Ikki tenglamali sistema: tekislikdagi ikki to‘g‘ri chiziq',
      aria2: 'Ikki tenglamaning to‘g‘ri chiziqlari va umumiy nuqtalari',
      sys: 'Sistema',
      unique: 'bitta yechim', inf: 'cheksiz ko‘p', none: 'yechim yo‘q', hom: 'bir jinsli',
      step: 'Qadam', back: 'Orqaga', reset: 'Boshidan',
      rA: '$r(A)$', rB: '$r(B)$', nVars: 'o‘zgaruvchilar $n$', verdict: 'xulosa',
      start: 'Boshlang‘ich sistema. Keyingi barcha sistemalar unga teng kuchli (2.5-teorema).',
      swap: (i, j) => i + ' va ' + j + '-satrlar o‘rni almashtirildi ((α) va (β) almashtirishlar zanjiri).',
      scale: (i, c) => '(α): ' + i + '-satr ' + c + ' ga ko‘paytirildi.',
      add: (i, c, j) => '(β): ' + i + '-satrga ' + c + ' ga ko‘paytirilgan ' + j + '-satr qo‘shildi.',
      drop: (i) => '(γ): 0 = 0 nol tenglama chiqarib tashlandi (' + i + '-satr).',
      done: 'Almashtirishlar tugadi.',
      vYes: 'birgalikda', vNo: 'birgalikda emas', freeL: 'erkin o‘zgaruvchilar',
      contra: '0 … 0 | ≠ 0 satr — 0 = c, c ≠ 0 tenglama: sistema birgalikda emas.',
      sol: (s) => 'Yechim: ' + s + '.',
      free: (s) => 'Umumiy yechim: ' + s + '.',
      a2: '$a_2$', b2: '$b_2$', c2: '$c_2$',
      homChk: 'bir jinsli sistema',
      count: 'yechimlar',
      one: 'bitta', many: 'cheksiz', zero: 'yo‘q',
      nOne: (p) => 'To‘g‘ri chiziqlar bitta ' + p + ' nuqtada kesishadi: r(A) = r(B) = 2 = n, yechim yagona (2.18-natija).',
      nMany: 'To‘g‘ri chiziqlar ustma-ust tushadi: ikkinchi tenglama birinchisiga karrali, r(A) = r(B) = 1. Yechimlar — butun c + L to‘g‘ri chiziq, bu yerda L — koordinata boshidan o‘tuvchi bir jinsli sistema yechimlarining punktir to‘g‘ri chizig‘i (2.17-teorema).',
      nNone: 'To‘g‘ri chiziqlar parallel va ustma-ust tushmaydi: r(A) = 1 < r(B) = 2 — sistema birgalikda emas (Kroneker — Kapelli teoremasi).',
      nZero: 'Ikkinchi 0 = 0 tenglama hech narsa talab qilmaydi (uni chiqarish mumkin, (γ)); yechimlar — butun birinchi to‘g‘ri chiziq.',
      nZeroBad: 'Ikkinchi 0 = c₂ tenglama (c₂ ≠ 0) — ziddiyat: yechim yo‘q.',
    },
  });

  /* ---------------------- Рисунок 1: метод Гаусса по шагам ---------------------- */
  const PRESETS = {
    unique: [[1, 2, 1, 4], [2, 1, -1, 1], [1, -1, 2, 5]],
    inf: [[1, 1, 1, 3], [1, -1, 2, 2], [2, 0, 3, 5]],
    none: [[1, 1, 1, 3], [1, -1, 2, 2], [2, 0, 3, 6]],
    hom: [[1, 1, 1, 0], [1, -1, 2, 0], [2, 0, 3, 0]],
  };
  const VARS = ['x', 'y', 'z'];

  /** Ранг (число ненулевых строк после исключения) первых cols столбцов. */
  function rank(M, cols) {
    const R = M.map((r) => r.slice(0, cols));
    let rk = 0;
    for (let c = 0; c < cols && rk < R.length; c++) {
      let p = rk;
      while (p < R.length && qzero(R[p][c])) p++;
      if (p === R.length) continue;
      [R[rk], R[p]] = [R[p], R[rk]];
      for (let i = 0; i < R.length; i++) {
        if (i === rk || qzero(R[i][c])) continue;
        const f = qdiv(R[i][c], R[rk][c]);
        R[i] = R[i].map((v, k) => qadd(v, qneg(qmul(f, R[rk][k]))));
      }
      rk++;
    }
    return rk;
  }

  /** Цепочка шагов метода Гаусса — Жордана: [{M, msg}] начиная с исходной матрицы. */
  function gaussSteps(rows) {
    let M = rows.map((r) => r.map((v) => Q(v)));
    const steps = [{ M: M.map((r) => r.slice()), msg: T.start, hl: [] }];
    const push = (msg, hl) => steps.push({ M: M.map((r) => r.slice()), msg, hl });
    const n = M[0].length - 1;
    let row = 0;
    for (let c = 0; c < n && row < M.length; c++) {
      let p = row;
      while (p < M.length && qzero(M[p][c])) p++;
      if (p === M.length) continue;
      if (p !== row) {
        [M[row], M[p]] = [M[p], M[row]];
        push(T.swap(row + 1, p + 1), [row, p]);
      }
      const piv = M[row][c];
      if (!(piv.n === 1 && piv.d === 1)) {
        const f = qdiv(Q(1), piv);
        M[row] = M[row].map((v) => qmul(v, f));
        push(T.scale(row + 1, qpar(f)), [row]);
      }
      for (let i = 0; i < M.length; i++) {
        if (i === row || qzero(M[i][c])) continue;
        const f = qneg(M[i][c]);
        M[i] = M[i].map((v, k) => qadd(v, qmul(f, M[row][k])));
        push(T.add(i + 1, qpar(f), row + 1), [i]);
      }
      row++;
    }
    for (let i = M.length - 1; i >= 0; i--) {
      if (M[i].every(qzero)) {
        M.splice(i, 1);
        push(T.drop(i + 1), []);
      }
    }
    return steps;
  }

  /** Итог по приведённой матрице: текст решения. */
  function solutionText(M) {
    const n = M[0].length - 1;
    if (M.some((r) => r.slice(0, n).every(qzero) && !qzero(r[n]))) return T.contra;
    const lead = M.map((r) => r.findIndex((v) => !qzero(v)));
    const free = [];
    for (let k = 0; k < n; k++) if (!lead.includes(k)) free.push(k);
    const params = ['t', 's', 'u'];
    const expr = [];
    for (let k = 0; k < n; k++) {
      const fi = free.indexOf(k);
      if (fi >= 0) {
        expr.push(params[fi]);
        continue;
      }
      const r = M[lead.indexOf(k)];
      let s = qzero(r[n]) ? '' : qstr(r[n]);
      free.forEach((f, j) => {
        const c = qneg(r[f]);
        if (qzero(c)) return;
        const abs = Q(Math.abs(c.n), c.d);
        const coef = abs.n === 1 && abs.d === 1 ? '' : abs.d === 1 ? qstr(abs) : '(' + qstr(abs) + ')';
        const sign = c.n < 0 ? '−' : '+';
        s += s ? ' ' + sign + ' ' + coef + params[j] : (c.n < 0 ? '−' : '') + coef + params[j];
      });
      expr.push(s || '0');
    }
    const vec = '(' + expr.join('; ') + ')';
    if (MC.lang === 'en') return (free.length ? T.free : T.sol)(vec.replace(/; /g, ', '));
    return (free.length ? T.free : T.sol)(vec);
  }

  MC.widget('gauss-steps', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { preset: cfg.preset || 'unique', k: 0, steps: [] };
    const seg = F.seg([
      { value: 'unique', label: T.unique },
      { value: 'inf', label: T.inf },
      { value: 'none', label: T.none },
      { value: 'hom', label: T.hom },
    ], st.preset, (v) => {
      st.preset = v;
      build();
    }, T.sys);
    const bBack = F.button('', T.back, () => {
      if (st.k > 0) st.k--;
      draw();
    });
    const bStep = F.button('', T.step, () => {
      if (st.k < st.steps.length - 1) st.k++;
      draw();
    });
    const bReset = F.button('', T.reset, () => {
      st.k = 0;
      draw();
    });
    const btns = H('div', { class: 'fig-buttons' }, bBack.el || bBack, bStep.el || bStep, bReset.el || bReset);
    btns.style.display = 'flex';
    btns.style.flexWrap = 'wrap';
    btns.style.gap = '8px';
    fig.controls.append(seg.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 'rA', label: T.rA },
      { key: 'rB', label: T.rB },
      { key: 'n', label: T.nVars },
      { key: 'v', label: T.verdict },
      { key: 'f', label: T.freeL },
    ]);
    const plotWidth1 = () => U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    function build() {
      st.steps = gaussSteps(PRESETS[st.preset]);
      st.k = 0;
      draw();
    }

    function draw() {
      const { M, msg, hl } = st.steps[st.k];
      const n = M[0].length - 1;
      // матрица — SVG-таблица: столбец номеров, n столбцов коэффициентов, черта, свободные члены
      const W = plotWidth1();
      const rows = M.length;
      const rowH = 34;
      const H0 = rowH * (rows + 1) + 16;
      fig.plot.replaceChildren();
      const p = new MC.Plot(fig.plot, { width: W, height: H0, x: [0, n + 2], y: [rows + 1, 0], margin: { l: 8, r: 8, t: 8, b: 8 }, label: T.t1 });
      const cx = (k) => k + 0.5;
      const cy = (i) => i + 0.5;
      hl.forEach((i) => { if (i < rows) p.polygon([[0.1, i + 1], [n + 1.9, i + 1], [n + 1.9, i + 2], [0.1, i + 2]], 'area', 'back'); });
      p.seg(0.1, 1, n + 1.9, 1, 'guide');
      p.seg(n + 1, 0.15, n + 1, rows + 0.85, 'curve');
      const t = (k, i, s, cls) => p.text(cx(k), cy(i), s, cls, { anchor: 'middle', dy: 5 });
      t(0, 0, '#', 'lbl faint');
      VARS.slice(0, n).forEach((v, k) => t(k + 1, 0, v, 'lbl'));
      t(n + 1, 0, 'β', 'lbl');
      M.forEach((r, i) => {
        t(0, i + 1, String(i + 1), 'lbl faint');
        r.forEach((v, k) => t(k + 1, i + 1, qstr(v), 'lbl'));
      });
      const rA = rank(M, n);
      const rB = rank(M, n + 1);
      ro.set('rA', String(rA));
      ro.set('rB', String(rB), rB > rA ? 'warm' : 'accent');
      ro.set('n', String(n));
      ro.set('v', rA < rB ? T.vNo : T.vYes, rA < rB ? 'warm' : 'accent');
      ro.set('f', rA < rB ? '—' : String(n - rA));
      const last = st.k === st.steps.length - 1;
      fig.note.className = 'fig-note';
      fig.note.textContent = (st.k + 1) + '/' + st.steps.length + '. ' + msg + (last ? ' ' + T.done + ' ' + solutionText(M) : '');
      (bBack.el || bBack).disabled = st.k === 0;
      (bStep.el || bStep).disabled = last;
    }
    build();
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(draw, 150);
    });
  });

  /* ---------------------- Рисунок 2: две прямые ---------------------- */
  const LPRE = {
    one: { a2: 1, b2: -1, c2: 0 },
    inf: { a2: 2, b2: 2, c2: 4 },
    none: { a2: 1, b2: 1, c2: -1 },
  };
  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const EPS = 1e-9;

  MC.widget('lines-2d', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = Object.assign({ hom: true }, LPRE[cfg.preset || 'inf']);
    const a1 = 1, b1 = 1, c1 = 2;
    let p = null;
    let W0 = 0;
    const seg = F.seg([
      { value: 'one', label: T.unique },
      { value: 'inf', label: T.inf },
      { value: 'none', label: T.none },
    ], cfg.preset || 'inf', (v) => {
      Object.assign(st, LPRE[v]);
      sA.set(st.a2);
      sB.set(st.b2);
      sC.set(st.c2);
      draw();
    }, T.sys);
    const mk = (label, key) => F.slider({ label, min: -3, max: 4, step: 0.5, value: st[key], fmt: (v) => U.fmt(v, 1), oninput: (v) => {
      st[key] = v;
      draw();
    } });
    const sA = mk(T.a2, 'a2');
    const sB = mk(T.b2, 'b2');
    const sC = mk(T.c2, 'c2');
    const chk = F.check(T.homChk, st.hom, (v) => {
      st.hom = v;
      draw();
    });
    fig.controls.append(seg.el, sA.el, sB.el, sC.el, chk.el);
    const ro = F.readout(fig.readout, [
      { key: 'e1', label: '1' },
      { key: 'e2', label: '2' },
      { key: 'rA', label: '$r(A)$' },
      { key: 'rB', label: '$r(B)$' },
      { key: 'k', label: T.count },
    ]);

    function makePlot() {
      const W = plotWidth(fig.plot);
      if (p && Math.abs(W - W0) < 8) return;
      W0 = W;
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.6)), x: [-5, 5], y: [-4, 4], equal: true, label: T.aria2 });
      p.axes({ xLabel: 'x', yLabel: 'y' });
    }

    /** Отрезок прямой a x + b y = c внутри окна. */
    function line(a, b, c, cls) {
      if (Math.abs(a) < EPS && Math.abs(b) < EPS) return;
      if (Math.abs(b) >= Math.abs(a)) p.seg(-6, (c + 6 * a) / b, 6, (c - 6 * a) / b, cls);
      else p.seg((c + 6 * b) / a, -6, (c - 6 * b) / a, 6, cls);
    }
    const eqStr = (a, b, c) => {
      const t = (k, v, first) => {
        if (Math.abs(k) < EPS) return '';
        const s = k < 0 ? '−' : first ? '' : '+';
        const m = Math.abs(k) === 1 ? '' : U.fmt(Math.abs(k), 1);
        return (first ? s : ' ' + s + ' ') + m + v;
      };
      const l = (t(a, 'x', true) + t(b, 'y', Math.abs(a) < EPS)).trim() || '0';
      return l + ' = ' + U.fmt(c, 1);
    };

    function draw() {
      makePlot();
      p.clear();
      const { a2, b2, c2 } = st;
      const det = a1 * b2 - a2 * b1;
      const zero2 = Math.abs(a2) < EPS && Math.abs(b2) < EPS;
      // ранги 2×2 и 2×3
      const rA = det !== 0 ? 2 : 1;
      const minors = [det, a1 * c2 - a2 * c1, b1 * c2 - b2 * c1];
      const rB = minors.some((m) => Math.abs(m) > EPS) ? 2 : 1;
      if (st.hom) {
        line(a1, b1, 0, 'curve accent dash');
        if (!zero2) line(a2, b2, 0, 'curve warm dash');
      }
      line(a1, b1, c1, 'curve accent');
      if (!zero2) line(a2, b2, c2, 'curve warm');
      let note;
      let k;
      if (Math.abs(det) > EPS) {
        const x = (c1 * b2 - c2 * b1) / det;
        const y = (a1 * c2 - a2 * c1) / det;
        p.dot(x, y, 'accent');
        k = T.one;
        note = T.nOne(U.pt(x, y, 2));
        if (st.hom) p.dot(0, 0, 'warm');
      } else if (rB > rA) {
        k = T.zero;
        note = zero2 ? T.nZeroBad : T.nNone;
      } else {
        k = T.many;
        note = zero2 ? T.nZero : T.nMany;
        // частное решение c — ближайшая к началу точка прямой, и вектор O → c
        const t = c1 / (a1 * a1 + b1 * b1);
        const cx = a1 * t, cy = b1 * t;
        p.arrow(0, 0, cx, cy, 'ink');
        p.text(cx, cy, 'c', 'lbl', { dx: 8, dy: -8 });
        // подписи у самих прямых: точка c + 3·направление и −3·направление на L
        const nr = Math.hypot(a1, b1);
        const ux = b1 / nr, uy = -a1 / nr;
        p.text(cx + 3 * ux, cy + 3 * uy, 'c + L', 'lbl', { dx: 10, dy: 4 });
        if (st.hom) p.text(-3 * ux, -3 * uy, 'L', 'lbl accent', { dx: 10, dy: 4 });
      }
      ro.set('e1', eqStr(a1, b1, c1), 'accent');
      ro.set('e2', eqStr(a2, b2, c2), 'warm');
      ro.set('rA', String(rA));
      ro.set('rB', String(rB), rB > rA ? 'warm' : '');
      ro.set('k', k, rB > rA ? 'warm' : 'accent');
      fig.note.className = 'fig-note';
      fig.note.textContent = note;
    }
    draw();
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(draw, 150);
    });
  });
})();
