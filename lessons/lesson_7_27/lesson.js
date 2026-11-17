/* Урок 7.27 «Ступенчатые матрицы и системы линейных уравнений» (Куликов, гл. 5, § 3):
 * рисунок 1 «Приведение к ступенчатому виду по шагам» — алгоритм из доказательств теорем 3.2 и 3.4
 * в точных дробях; рисунок 2 «Система двух уравнений на плоскости» — одна точка, прямая решений или
 * пустое множество; общее решение δ + tC и решения однородной системы (следствие 3.13). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  /* ---------------------------- точные дроби ---------------------------- */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const fr = (n, d = 1) => {
    if (d < 0) [n, d] = [-n, -d];
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };
  const add = (a, b) => fr(a.n * b.d + b.n * a.d, a.d * b.d);
  const mul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const neg = (a) => fr(-a.n, a.d);
  const inv = (a) => fr(a.d, a.n);
  const isZero = (a) => a.n === 0;
  const isOne = (a) => a.n === 1 && a.d === 1;
  const minus = (s) => s.replace('-', '−');
  const show = (a) => minus(a.d === 1 ? String(a.n) : a.n + '/' + a.d);
  /** Множитель в записи операции: «3», «−1/2», «(−1/2)». */
  const coef = (a) => (a.n < 0 || a.d !== 1 ? '(' + show(a) + ')' : show(a));

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Приведение матрицы к ступенчатому и приведённому виду по шагам',
      t2: 'Система двух уравнений с двумя неизвестными на плоскости',
      aria1: 'Матрица на текущем шаге: ведущие элементы обведены, основные столбцы подсвечены',
      aria2: 'Прямые, задаваемые уравнениями системы, и множество её решений',
      preset: 'Матрица',
      ex: (k) => 'пример ' + k,
      back: 'Назад', step: 'Шаг', reset: 'Сначала',
      stepNo: 'шаг', nz: 'ненулевых строк', kind: 'вид',
      kinds: { any: 'не ступенчатая', echelon: 'ступенчатая', reduced: 'приведённая' },
      start: 'Исходная матрица. Нажмите «Шаг».',
      swap: (i, j) => 'Перестановка строк ' + i + ' и ' + j + ' (цепочка элементарных преобразований, см. доказательство теоремы 3.2): ненулевой элемент — наверх.',
      scale: (i, c) => '(α): строка ' + i + ' умножается на ' + c + ' — ведущий элемент становится равен 1.',
      elim: (i, c, j) => '(β): к строке ' + i + ' прибавляется строка ' + j + ', умноженная на ' + c + ' — под (над) ведущей единицей появляется нуль.',
      drop: (k) => '(γ): вычёркиваются нулевые строки (' + k + ' шт.) — у приведённой матрицы по Куликову их нет.',
      doneEchelon: (r) => 'Матрица ступенчатая: ' + r + ' ненулевых строк — по теореме 3.3 это строчечный ранг. Дальше — обратный ход (теорема 3.4).',
      done: (r) => 'Готово: приведённая ступенчатая матрица, её основные столбцы образуют единичную матрицу. Ранг исходной матрицы — ' + r + '.',
      cases: 'Система',
      caseA: 'одна точка', caseB: 'прямая решений', caseC: 'нет решений',
      tS: 'свободная переменная $t$',
      homog: 'однородная система',
      rA: '$r(A)$', rB: '$r(B)$', sol: 'решение',
      none: 'нет',
      noteA: 'r(A) = r(B) = n = 2: прямые пересекаются в одной точке (2; 1) — единственное решение.',
      noteB: (pt) => 'r(A) = r(B) = 1 < n = 2: уравнения пропорциональны, прямые совпадают. Главная переменная x = 4 − 2y, свободная y = t; общее решение δ + tC = (4; 0) + t(−2; 1). Сейчас t даёт точку ' + pt + '.',
      noteBh: 'Пунктир — решения однородной системы x + 2y = 0 (C₁ = (−2; 1) — её ФСР): та же прямая, сдвинутая в начало координат.',
      noteC: 'r(A) = 1 < r(B) = 2: прямые параллельны и не пересекаются. После вычитания уравнений получается 0 = −3 — система несовместна.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Reducing a matrix to echelon and reduced echelon form step by step',
      t2: 'A system of two equations in two unknowns on the plane',
      aria1: 'The matrix at the current step: leading entries circled, pivot columns highlighted',
      aria2: 'The lines given by the equations of the system and its solution set',
      preset: 'Matrix',
      ex: (k) => 'example ' + k,
      back: 'Back', step: 'Step', reset: 'Restart',
      stepNo: 'step', nz: 'non-zero rows', kind: 'form',
      kinds: { any: 'not echelon', echelon: 'echelon', reduced: 'reduced' },
      start: 'The original matrix. Press “Step”.',
      swap: (i, j) => 'Swap rows ' + i + ' and ' + j + ' (a chain of elementary operations, see the proof of theorem 3.2): a non-zero entry goes to the top.',
      scale: (i, c) => '(α): row ' + i + ' is multiplied by ' + c + ' — the leading entry becomes 1.',
      elim: (i, c, j) => '(β): row ' + j + ' times ' + c + ' is added to row ' + i + ' — a zero appears below (above) the leading one.',
      drop: (k) => '(γ): the zero rows (' + k + ') are deleted — Kulikov’s reduced matrix has none.',
      doneEchelon: (r) => 'The matrix is in echelon form: ' + r + ' non-zero rows, which is the row rank by theorem 3.3. Next comes back substitution (theorem 3.4).',
      done: (r) => 'Done: a reduced echelon matrix; its pivot columns form the identity matrix. The rank of the original matrix is ' + r + '.',
      cases: 'System',
      caseA: 'one point', caseB: 'a line of solutions', caseC: 'no solutions',
      tS: 'free variable $t$',
      homog: 'homogeneous system',
      rA: '$r(A)$', rB: '$r(B)$', sol: 'solution',
      none: 'none',
      noteA: 'r(A) = r(B) = n = 2: the lines meet at the single point (2, 1) — the unique solution.',
      noteB: (pt) => 'r(A) = r(B) = 1 < n = 2: the equations are proportional and the lines coincide. Basic variable x = 4 − 2y, free variable y = t; general solution δ + tC = (4, 0) + t(−2, 1). Now t gives the point ' + pt + '.',
      noteBh: 'Dashed: the solutions of the homogeneous system x + 2y = 0 (C₁ = (−2, 1) is its fundamental system): the same line moved to the origin.',
      noteC: 'r(A) = 1 < r(B) = 2: the lines are parallel and do not meet. Subtracting the equations gives 0 = −3 — the system is inconsistent.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Matritsani pog‘onali va keltirilgan pog‘onali ko‘rinishga qadam-baqadam keltirish',
      t2: 'Ikki noma’lumli ikki tenglama sistemasi tekislikda',
      aria1: 'Joriy qadamdagi matritsa: yetakchi elementlar aylantirilgan, asosiy ustunlar ajratilgan',
      aria2: 'Sistema tenglamalari bergan to‘g‘ri chiziqlar va yechimlar to‘plami',
      preset: 'Matritsa',
      ex: (k) => k + '-misol',
      back: 'Orqaga', step: 'Qadam', reset: 'Boshidan',
      stepNo: 'qadam', nz: 'nolmas satrlar', kind: 'ko‘rinish',
      kinds: { any: 'pog‘onali emas', echelon: 'pog‘onali', reduced: 'keltirilgan' },
      start: 'Boshlang‘ich matritsa. «Qadam» tugmasini bosing.',
      swap: (i, j) => i + '- va ' + j + '-satrlar o‘rni almashtiriladi (elementar almashtirishlar zanjiri, 3.2-teorema isbotiga qarang): nolmas element yuqoriga.',
      scale: (i, c) => '(α): ' + i + '-satr ' + c + ' ga ko‘paytiriladi — yetakchi element 1 ga teng bo‘ladi.',
      elim: (i, c, j) => '(β): ' + i + '-satrga ' + c + ' ga ko‘paytirilgan ' + j + '-satr qo‘shiladi — yetakchi birning ostida (ustida) nol hosil bo‘ladi.',
      drop: (k) => '(γ): nol satrlar (' + k + ' ta) o‘chiriladi — Kulikov bo‘yicha keltirilgan matritsada ular yo‘q.',
      doneEchelon: (r) => 'Matritsa pog‘onali: ' + r + ' ta nolmas satr — 3.3-teoremaga ko‘ra bu satr rangi. Endi teskari yo‘l (3.4-teorema).',
      done: (r) => 'Tayyor: keltirilgan pog‘onali matritsa, asosiy ustunlari birlik matritsani tashkil qiladi. Boshlang‘ich matritsa rangi — ' + r + '.',
      cases: 'Sistema',
      caseA: 'bitta nuqta', caseB: 'yechimlar to‘g‘ri chizig‘i', caseC: 'yechim yo‘q',
      tS: 'erkin o‘zgaruvchi $t$',
      homog: 'bir jinsli sistema',
      rA: '$r(A)$', rB: '$r(B)$', sol: 'yechim',
      none: 'yo‘q',
      noteA: 'r(A) = r(B) = n = 2: to‘g‘ri chiziqlar bitta (2; 1) nuqtada kesishadi — yagona yechim.',
      noteB: (pt) => 'r(A) = r(B) = 1 < n = 2: tenglamalar proporsional, to‘g‘ri chiziqlar ustma-ust tushadi. Bosh o‘zgaruvchi x = 4 − 2y, erkin y = t; umumiy yechim δ + tC = (4; 0) + t(−2; 1). Hozir t ' + pt + ' nuqtani beradi.',
      noteBh: 'Punktir — x + 2y = 0 bir jinsli sistema yechimlari (C₁ = (−2; 1) — uning fundamental sistemasi): o‘sha to‘g‘ri chiziq koordinata boshiga surilgan.',
      noteC: 'r(A) = 1 < r(B) = 2: to‘g‘ri chiziqlar parallel va kesishmaydi. Tenglamalarni ayirsak, 0 = −3 hosil bo‘ladi — sistema birgalikda emas.',
    },
  });

  /* ---------------------- Рисунок 1: шаги приведения ---------------------- */
  const PRESETS = {
    a: [[0, 2, 4, 2], [1, 1, 1, 0], [2, 4, 6, 2]],
    b: [[2, 1, 1], [4, 3, 3], [8, 7, 9]],
    c: [[0, 1, 2], [0, 2, 5], [0, 3, 7]],
  };

  const lead = (row) => row.findIndex((x) => !isZero(x));
  const copy = (M) => M.map((r) => r.slice());
  function kindOf(M) {
    let last = -1;
    let zeroSeen = false;
    for (const row of M) {
      const k = lead(row);
      if (k < 0) {
        zeroSeen = true;
        continue;
      }
      if (zeroSeen || k <= last) return 'any';
      last = k;
    }
    if (zeroSeen || M.length === 0) return 'echelon';
    // приведённая: ведущие единицы, в их столбцах остальные элементы нулевые
    for (let i = 0; i < M.length; i++) {
      const k = lead(M[i]);
      if (!isOne(M[i][k])) return 'echelon';
      for (let j = 0; j < M.length; j++) if (j !== i && !isZero(M[j][k])) return 'echelon';
    }
    return 'reduced';
  }
  const nonZero = (M) => M.filter((r) => lead(r) >= 0).length;

  /** Шаги: [{M, msg: () => string, hl: номер изменённой строки}] — точно по доказательствам 3.2 и 3.4. */
  function steps(src) {
    let M = src.map((r) => r.map((x) => fr(x)));
    const out = [{ M: copy(M), msg: () => T.start, hl: -1 }];
    const m = M.length;
    const n = M[0].length;
    const piv = [];
    let row = 0;
    for (let col = 0; col < n && row < m; col++) {
      const i = M.findIndex((r, k) => k >= row && !isZero(r[col]));
      if (i < 0) continue;
      if (i !== row) {
        [M[i], M[row]] = [M[row], M[i]];
        const a = row + 1, b = i + 1;
        out.push({ M: copy(M), msg: () => T.swap(a, b), hl: row });
      }
      if (!isOne(M[row][col])) {
        const c = inv(M[row][col]);
        M[row] = M[row].map((x) => mul(x, c));
        const r1 = row + 1;
        out.push({ M: copy(M), msg: () => T.scale(r1, coef(c)), hl: row });
      }
      for (let k = row + 1; k < m; k++) {
        if (isZero(M[k][col])) continue;
        const c = neg(M[k][col]);
        M[k] = M[k].map((x, j) => add(x, mul(c, M[row][j])));
        const k1 = k + 1, r1 = row + 1;
        out.push({ M: copy(M), msg: () => T.elim(k1, coef(c), r1), hl: k });
      }
      piv.push([row, col]);
      row++;
    }
    const r = piv.length;
    out[out.length - 1].after = () => T.doneEchelon(r);
    for (let p = piv.length - 1; p >= 0; p--) {
      const [pr, pc] = piv[p];
      for (let k = 0; k < pr; k++) {
        if (isZero(M[k][pc])) continue;
        const c = neg(M[k][pc]);
        M[k] = M[k].map((x, j) => add(x, mul(c, M[pr][j])));
        const k1 = k + 1, r1 = pr + 1;
        out.push({ M: copy(M), msg: () => T.elim(k1, coef(c), r1), hl: k });
      }
    }
    const zero = M.length - nonZero(M);
    if (zero > 0) {
      M = M.filter((rr) => lead(rr) >= 0);
      out.push({ M: copy(M), msg: () => T.drop(zero), hl: -1 });
    }
    out[out.length - 1].after = () => T.done(r);
    return out;
  }

  MC.widget('echelon-steps', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { p: PRESETS[cfg.preset] ? cfg.preset : 'a', k: 0, list: [] };
    const pSeg = F.seg(Object.keys(PRESETS).map((key, i) => ({ value: key, label: T.ex(i + 1) })), st.p, (v) => {
      st.p = v;
      load();
    }, T.preset);
    const bBack = F.button('back', T.back, () => go(-1));
    const bStep = F.button('step', T.step, () => go(1));
    const bReset = F.button('reset', T.reset, () => {
      st.k = 0;
      draw();
    });
    const btns = MC.h('div', { class: 'fig-buttons' }, bBack, bStep, bReset);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(pSeg.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.stepNo },
      { key: 'nz', label: T.nz },
      { key: 'kind', label: T.kind },
    ]);
    let svg = null;

    function load() {
      st.list = steps(PRESETS[st.p]);
      st.k = 0;
      draw();
    }
    function go(d) {
      st.k = U.clamp(st.k + d, 0, st.list.length - 1);
      draw();
    }
    function draw() {
      const s = st.list[st.k];
      const M = s.M;
      const m = M.length;
      const n = M[0].length;
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(64, Math.floor((W - 40) / n));
      const H = C * m;
      const w = C * n + 28;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + (H + 8), role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const x0 = 14;
      const y0 = 4;
      const kind = kindOf(M);
      const leads = M.map(lead);
      // основные столбцы — только когда матрица уже ступенчатая
      if (kind !== 'any') {
        const cols = new Set(leads.filter((k) => k >= 0));
        cols.forEach((c) => svg.appendChild(S('rect', { x: x0 + C * c + 2, y: y0, width: C - 4, height: H, rx: 4, style: 'fill: var(--accent-soft)' })));
      }
      if (s.hl >= 0 && s.hl < m) svg.appendChild(S('rect', { x: x0, y: y0 + C * s.hl + 2, width: C * n, height: C - 4, rx: 4, style: 'fill: none; stroke: var(--warm); stroke-width: 1.5' }));
      const br = (x, dir) => svg.appendChild(S('path', { d: 'M' + (x + dir * 7) + ' ' + y0 + ' H' + x + ' V' + (y0 + H) + ' H' + (x + dir * 7), class: 'leg' }));
      br(x0 - 2, 1);
      br(x0 + C * n + 2, -1);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const cx = x0 + C * j + C / 2;
          const cy = y0 + C * i + C / 2;
          if (leads[i] === j) svg.appendChild(S('circle', { cx, cy, r: C * 0.36, style: 'fill: none; stroke: var(--accent); stroke-width: 2' }));
          const txt = show(M[i][j]);
          const t = S('text', { class: 'cv', x: cx, y: cy }, txt);
          t.style.fontSize = (txt.length > 3 ? Math.round(C * 0.26) : Math.round(C * 0.34)) + 'px';
          if (leads[i] === j) t.style.fill = 'var(--accent)';
          svg.appendChild(t);
        }
      }
      fig.plot.appendChild(svg);
      ro.set('k', st.k + ' / ' + (st.list.length - 1));
      ro.set('nz', String(nonZero(M)));
      ro.set('kind', T.kinds[kind], kind === 'any' ? '' : 'accent');
      fig.note.className = 'fig-note' + (st.k === st.list.length - 1 ? ' ok' : '');
      fig.note.textContent = s.msg() + (s.after ? ' ' + s.after() : '');
      bBack.disabled = st.k === 0;
      bStep.disabled = st.k === st.list.length - 1;
    }
    load();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });

  /* ---------------------- Рисунок 2: две прямые на плоскости ---------------------- */
  // уравнение a·x + b·y = c
  const SYSTEMS = {
    a: [[1, 2, 4], [1, -1, 1]],
    b: [[1, 2, 4], [2, 4, 8]],
    c: [[1, 2, 4], [1, 2, 1]],
  };
  const fmtEq = ([a, b, c]) => {
    const term = (k, v, first) => {
      if (k === 0) return '';
      const s = Math.abs(k) === 1 ? v : Math.abs(k) + v;
      if (first) return (k < 0 ? '−' : '') + s;
      return (k < 0 ? ' − ' : ' + ') + s;
    };
    return term(a, 'x', true) + term(b, 'y', a === 0) + ' = ' + U.fmt(c);
  };

  MC.widget('lines-2d', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { k: SYSTEMS[cfg.preset] ? cfg.preset : 'b', t: 1, h: true };
    const cSeg = F.seg([
      { value: 'a', label: T.caseA },
      { value: 'b', label: T.caseB },
      { value: 'c', label: T.caseC },
    ], st.k, (v) => {
      st.k = v;
      sync();
      draw();
    }, T.cases);
    const tS = F.slider({ label: T.tS, min: -2, max: 3, step: 0.25, value: st.t, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.t = v;
      draw();
    } });
    const hC = F.check(T.homog, st.h, (v) => {
      st.h = v;
      draw();
    });
    fig.controls.append(cSeg.el, tS.el, hC.el);
    const ro = F.readout(fig.readout, [
      { key: 'e1', label: '(1)' },
      { key: 'e2', label: '(2)' },
      { key: 'ra', label: T.rA },
      { key: 'rb', label: T.rB },
      { key: 'sol', label: T.sol },
    ]);
    let p = null;
    let lastW = 0;

    function build() {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
      if (W === lastW && p) return;
      lastW = W;
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.6)), x: [-4, 6], y: [-3, 4], equal: true, label: T.aria2 });
      p.axes({ xLabel: 'x', yLabel: 'y' });
    }
    function sync() {
      const free = st.k === 'b';
      tS.el.style.display = free ? '' : 'none';
      hC.el.style.display = free ? '' : 'none';
    }
    const line = ([a, b, c], cls) => {
      // точки прямой a x + b y = c на краях большого окна
      const pts = b !== 0 ? [[-20, (c + 20 * a) / b], [20, (c - 20 * a) / b]] : [[c / a, -20], [c / a, 20]];
      p.path(pts, cls);
    };
    function draw() {
      build();
      p.clear();
      const [e1, e2] = SYSTEMS[st.k];
      ro.set('e1', fmtEq(e1));
      ro.set('e2', fmtEq(e2));
      fig.note.className = 'fig-note';
      if (st.k === 'a') {
        line(e1, 'curve accent');
        line(e2, 'curve warm');
        p.dot(2, 1, 'accent');
        p.text(2, 1, U.pt(2, 1), 'lbl ink', { dx: 10, dy: -10 });
        ro.set('ra', '2');
        ro.set('rb', '2');
        ro.set('sol', U.pt(2, 1), 'accent');
        fig.note.textContent = T.noteA;
      } else if (st.k === 'b') {
        if (st.h) {
          line([1, 2, 0], 'curve faint dash');
          p.arrow(0, 0, -2, 1, 'warm');
          p.text(-2, 1, 'C₁', 'lbl warm', { dx: -8, dy: -8, anchor: 'end' });
        }
        line(e1, 'curve accent');
        const x = 4 - 2 * st.t;
        const y = st.t;
        p.dot(4, 0, 'hollow');
        p.text(4, 0, 'δ', 'lbl ink', { dx: 8, dy: 18 });
        p.dot(x, y, 'accent');
        p.text(x, y, U.pt(x, y), 'lbl accent', { dx: 10, dy: -10 });
        ro.set('ra', '1');
        ro.set('rb', '1');
        ro.set('sol', U.pt(x, y), 'accent');
        fig.note.textContent = T.noteB(U.pt(x, y)) + (st.h ? ' ' + T.noteBh : '');
      } else {
        line(e1, 'curve accent');
        line(e2, 'curve warm');
        ro.set('ra', '1');
        ro.set('rb', '2');
        ro.set('sol', T.none, 'warm');
        fig.note.textContent = T.noteC;
      }
    }
    sync();
    draw();
    window.addEventListener('resize', () => {
      if (Math.round(fig.plot.clientWidth) !== lastW) draw();
    });
  });
})();
