/* Урок 7.1 «Множества»: рисунки «Операции на диаграмме Эйлера — Венна» и «Проверка тождеств по областям». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;
  const S = MC.svg;

  /* Строки интерфейса (пока только русский; переводы добавятся словарями en и uz). */
  const T = MC.i18n.pick({
    ru: {
      fig1: 'Рисунок 1',
      title1: 'Операции над множествами на диаграмме Эйлера — Венна',
      plot1: 'Диаграмма Эйлера — Венна: прямоугольник U и круги A, B, C с элементами',
      op: 'Операция',
      showC: 'Показать $C$',
      expr: 'выражение',
      count: 'элементов',
      regions: 'закрашено областей',
      of: (a, b) => a + ' из ' + b,
      note1: (cond, list) => 'Закрашены точки x, для которых ' + cond + '. Элементы: ' + list + '.',
      fig2: 'Рисунок 2',
      title2: 'Проверка равенства по областям диаграммы',
      plot2: (side) => 'Диаграмма Эйлера — Венна: закрашена ' + side,
      law: 'Равенство',
      left: 'левая часть',
      right: 'правая часть',
      leftShort: 'левая',
      rightShort: 'правая',
      region: 'область',
      elems: 'элементы',
      match: 'совпало областей',
      verdict: 'вывод',
      yes: 'тождество',
      no: 'не тождество',
      tableAria: 'Таблица принадлежности по областям диаграммы',
      okNote: (n, src) => 'Левая и правая части закрашивают одни и те же области во всех ' + n + ' строках таблицы. Значит, равенство верно для любых множеств (' + src + ').',
      badNote: (k, reg, side, x) => 'Не совпало строк: ' + k + '. Например, область ' + reg + ' закрашена ' + side + '. Контрпример уже на этих множествах: элемент ' + x + ' лежит в одной части равенства и не лежит в другой.',
      onlyLeft: 'слева, но не справа',
      onlyRight: 'справа, но не слева',
    },
  });

  /* ---------------------------------------------------------------------------------
   * Данные: U = {1, …, 12}, A — чётные, B — кратные 3, C = {1, …, 6}.
   * Все восемь областей трёх кругов непусты, все четыре области двух кругов — тоже.
   * --------------------------------------------------------------------------------- */
  const UNI = [];
  for (let i = 1; i <= 12; i++) UNI.push(i);
  const mem = (x) => [x % 2 === 0, x % 3 === 0, x <= 6];
  const setText = (xs) => (xs.length ? '{' + xs.join(', ') + '}' : '∅');

  /* Геометрия в условных единицах: прямоугольник U и круги. */
  const BOX = [0.25, 0.25, 9.75, 6.75];
  const LAYOUTS = {
    two: { circles: [[3.9, 3.5, 2.4], [6.1, 3.5, 2.4]] },
    three: { circles: [[3.8, 4.3, 2.0], [6.2, 4.3, 2.0], [5.0, 2.45, 2.0]] },
  };
  const NAMES = ['A', 'B', 'C'];

  /** Позиции подписей кругов и универсального множества. */
  function labelSpots(L) {
    const c = L.circles;
    const out = [
      [c[0][0] - c[0][2] * 0.86, c[0][1] + c[0][2] * 0.78],
      [c[1][0] + c[1][2] * 0.86, c[1][1] + c[1][2] * 0.78],
    ];
    if (c[2]) out.push([c[2][0] + c[2][2] * 1.02, c[2][1] - c[2][2] * 0.78]);
    out.push([0.6, 6.3]); // U
    return out;
  }

  /** Сигнатура точки: в каких кругах она лежит (битовая маска). */
  function sigAt(L, x, y) {
    let s = 0;
    L.circles.forEach((c, i) => {
      if (Math.hypot(x - c[0], y - c[1]) < c[2]) s |= 1 << i;
    });
    return s;
  }
  function sigOf(x, k) {
    const m = mem(x);
    let s = 0;
    for (let i = 0; i < k; i++) if (m[i]) s |= 1 << i;
    return s;
  }

  /* Жадная раскладка элементов: каждый — в точку своей области, дальше всего от границ и соседей. */
  function placeElements(L) {
    const k = L.circles.length;
    const grid = [];
    for (let x = BOX[0] + 0.3; x <= BOX[2] - 0.3; x += 0.08) {
      for (let y = BOX[1] + 0.3; y <= BOX[3] - 0.3; y += 0.08) {
        let d = Math.min(x - BOX[0], BOX[2] - x, y - BOX[1], BOX[3] - y);
        for (const c of L.circles) d = Math.min(d, Math.abs(Math.hypot(x - c[0], y - c[1]) - c[2]));
        grid.push({ x, y, s: sigAt(L, x, y), d });
      }
    }
    const placed = labelSpots(L).slice();
    const pos = {};
    for (const e of UNI) {
      const s = sigOf(e, k);
      let best = null;
      let bestScore = -1;
      for (const g of grid) {
        if (g.s !== s) continue;
        let dp = Infinity;
        for (const p of placed) dp = Math.min(dp, Math.hypot(g.x - p[0], (g.y - p[1]) * 1.4));
        const score = Math.min(g.d, dp * 0.5);
        if (score > bestScore) {
          bestScore = score;
          best = g;
        }
      }
      pos[e] = [best.x, best.y];
      placed.push(pos[e]);
    }
    return pos;
  }
  LAYOUTS.two.pos = placeElements(LAYOUTS.two);
  LAYOUTS.three.pos = placeElements(LAYOUTS.three);

  /** Новый график под диаграмму. */
  function vennPlot(parent, W, label) {
    return new MC.Plot(parent, {
      width: W,
      height: Math.round(W * 0.7),
      x: [0, 10],
      y: [0, 7],
      equal: true,
      margin: { l: 4, r: 4, t: 4, b: 4 },
      label,
    });
  }

  /**
   * Рисует диаграмму: закрашивает области, где pred(a, b, c) истинно, и подписывает элементы.
   * Каждая область — прямоугольник U под вложенными масками «внутри / снаружи круга».
   */
  function drawVenn(p, three, pred) {
    const L = three ? LAYOUTS.three : LAYOUTS.two;
    const k = L.circles.length;
    const key = three ? 'three' : 'two';
    p._vm = p._vm || {};
    if (!p._vm[key]) {
      const defs = p.svg.querySelector('defs');
      p._vm[key] = L.circles.map((c) =>
        [true, false].map((inside) => {
          const id = U.uid('venn-mask');
          defs.appendChild(S('mask', { id, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: p.W, height: p.H },
            S('rect', { x: 0, y: 0, width: p.W, height: p.H, fill: inside ? 'black' : 'white' }),
            S('circle', { cx: p.sx(c[0]), cy: p.sy(c[1]), r: c[2] * (p.sx(1) - p.sx(0)), fill: inside ? 'white' : 'black' })));
          return id;
        })
      );
    }
    const masks = p._vm[key];
    const rect = (cls, style) => S('rect', {
      class: cls,
      x: p.sx(BOX[0]),
      y: p.sy(BOX[3]),
      width: p.sx(BOX[2]) - p.sx(BOX[0]),
      height: p.sy(BOX[1]) - p.sy(BOX[3]),
      style,
    });
    p.clear();
    let shaded = 0;
    for (let s = 0; s < 1 << k; s++) {
      const m = [!!(s & 1), !!(s & 2), !!(s & 4)];
      if (!pred(m[0], m[1], m[2])) continue;
      shaded += 1;
      let node = rect('venn-fill', { fill: 'var(--accent-soft)', stroke: 'none' });
      for (let i = k - 1; i >= 0; i--) node = S('g', { mask: 'url(#' + masks[i][m[i] ? 0 : 1] + ')' }, node);
      p.main.appendChild(node);
    }
    p.main.appendChild(rect('curve thin', null));
    const sc = p.sx(1) - p.sx(0);
    L.circles.forEach((c) => p.main.appendChild(S('circle', { class: 'curve', cx: p.sx(c[0]), cy: p.sy(c[1]), r: c[2] * sc })));
    const spots = labelSpots(L);
    for (let i = 0; i < k; i++) p.text(spots[i][0], spots[i][1], NAMES[i], 'lbl ink', { anchor: 'middle', dy: 6 }).style.fontSize = '19px';
    p.text(spots[k][0], spots[k][1], 'U', 'lbl ink', { anchor: 'middle', dy: 6 }).style.fontSize = '19px';
    const result = [];
    for (const e of UNI) {
      const m = mem(e);
      const on = pred(m[0], m[1], three ? m[2] : false);
      if (on) result.push(e);
      const t = p.text(L.pos[e][0], L.pos[e][1], String(e), on ? 'lbl accent' : 'lbl', { anchor: 'middle', dy: 5 });
      t.style.fontStyle = 'normal';
      if (on) t.style.fontWeight = '600';
    }
    return { result, shaded, total: 1 << k };
  }

  const plotWidth = (fig) => U.clamp(Math.round(fig.plot.clientWidth || 720), 280, 720);

  /* =================================================================================
   * Рисунок 1. Операции: выбираем выражение — закрашивается область, перечисляются элементы.
   * ================================================================================= */
  const OPS = [
    { id: 'union', label: '$A \\cup B$', text: 'A ∪ B', c: false, f: (a, b) => a || b, cond: 'x ∈ A или x ∈ B' },
    { id: 'inter', label: '$A \\cap B$', text: 'A ∩ B', c: false, f: (a, b) => a && b, cond: 'x ∈ A и x ∈ B' },
    { id: 'diff', label: '$A \\setminus B$', text: 'A \\ B', c: false, f: (a, b) => a && !b, cond: 'x ∈ A и x ∉ B' },
    { id: 'rdiff', label: '$B \\setminus A$', text: 'B \\ A', c: false, f: (a, b) => b && !a, cond: 'x ∈ B и x ∉ A' },
    { id: 'comp', label: "$A'$", text: 'A′', c: false, f: (a) => !a, cond: 'x ∉ A (x ∈ U)' },
    { id: 'dm', label: "$(A \\cup B)'$", text: '(A ∪ B)′', c: false, f: (a, b) => !(a || b), cond: 'x ∉ A и x ∉ B' },
    { id: 'abc', label: '$A \\cap B \\cap C$', text: 'A ∩ B ∩ C', c: true, f: (a, b, c) => a && b && c, cond: 'x лежит во всех трёх множествах' },
    { id: 'd7', label: '$A \\cup (B \\cap C)$', text: 'A ∪ (B ∩ C)', c: true, f: (a, b, c) => a || (b && c), cond: 'x ∈ A или (x ∈ B и x ∈ C)' },
    { id: 'd8', label: '$A \\cap (B \\cup C)$', text: 'A ∩ (B ∪ C)', c: true, f: (a, b, c) => a && (b || c), cond: 'x ∈ A и (x ∈ B или x ∈ C)' },
    { id: 'e1e', label: '$A \\setminus (B \\cup C)$', text: 'A \\ (B ∪ C)', c: true, f: (a, b, c) => a && !(b || c), cond: 'x ∈ A, но x ∉ B и x ∉ C' },
  ];

  MC.widget('venn', (el) => {
    const fig = F.shell(el, { kicker: T.fig1, title: T.title1 });
    const p = vennPlot(fig.plot, plotWidth(fig), T.plot1);
    const st = { op: 'union', three: false };
    const opSeg = F.seg(OPS.map((o) => ({ value: o.id, label: o.label })), st.op, (v) => {
      st.op = v;
      if (OPS.find((o) => o.id === v).c && !st.three) {
        st.three = true;
        chk.input.checked = true;
      }
      draw();
    }, T.op);
    const chk = F.check(T.showC, st.three, (on) => {
      st.three = on;
      if (!on && OPS.find((o) => o.id === st.op).c) {
        st.op = 'union';
        opSeg.set('union');
      }
      draw();
    });
    fig.controls.append(opSeg.el, chk.el);
    const ro = F.readout(fig.readout, [
      { key: 'expr', label: T.expr },
      { key: 'count', label: T.count },
      { key: 'reg', label: T.regions },
    ]);
    function draw() {
      const op = OPS.find((o) => o.id === st.op);
      const r = drawVenn(p, st.three, op.f);
      ro.set('expr', op.text, 'accent');
      ro.set('count', String(r.result.length));
      ro.set('reg', T.of(r.shaded, r.total));
      fig.note.className = 'fig-note';
      fig.note.textContent = T.note1(op.cond, setText(r.result));
    }
    draw();
  });

  /* =================================================================================
   * Рисунок 2. Тождества: левая и правая части на двух диаграммах + таблица по областям.
   * ================================================================================= */
  const LAWS = [
    { id: 'd7', label: '(7)', three: true, src: 'теорема 1.3, (7)', L: 'A \\cup (B \\cap C)', R: '(A \\cup B) \\cap (A \\cup C)', l: (a, b, c) => a || (b && c), r: (a, b, c) => (a || b) && (a || c) },
    { id: 'd8', label: '(8)', three: true, src: 'теорема 1.3, (8)', L: 'A \\cap (B \\cup C)', R: '(A \\cap B) \\cup (A \\cap C)', l: (a, b, c) => a && (b || c), r: (a, b, c) => (a && b) || (a && c) },
    { id: 'dm4', label: 'де Морган (4)', three: false, src: 'теорема 1.6, (4)', L: "(A \\cup B)'", R: "A' \\cap B'", l: (a, b) => !(a || b), r: (a, b) => !a && !b },
    { id: 'dm5', label: 'де Морган (5)', three: false, src: 'теорема 1.6, (5)', L: "(A \\cap B)'", R: "A' \\cup B'", l: (a, b) => !(a && b), r: (a, b) => !a || !b },
    { id: 'e1a', label: 'упр. 1 (a)', three: false, src: 'упражнение 1 (a)', L: 'A \\setminus B', R: "A \\cap B'", l: (a, b) => a && !b, r: (a, b) => a && !b },
    { id: 'e1b', label: 'упр. 1 (b)', three: false, src: 'упражнение 1 (b)', L: 'A \\setminus (A \\setminus B)', R: 'A \\cap B', l: (a, b) => a && !(a && !b), r: (a, b) => a && b },
    { id: 'e1c', label: 'упр. 1 (c)', three: false, src: 'упражнение 1 (c)', L: 'B \\cup (A \\setminus B)', R: 'A \\cup B', l: (a, b) => b || (a && !b), r: (a, b) => a || b },
    { id: 'e1d', label: 'упр. 1 (d)', three: false, src: 'упражнение 1 (d)', L: 'B \\cap (A \\setminus B)', R: '\\varnothing', l: (a, b) => b && a && !b, r: () => false },
    { id: 'e1e', label: 'упр. 1 (e)', three: true, src: 'упражнение 1 (e)', L: 'A \\setminus (B \\cup C)', R: '(A \\setminus B) \\cap (A \\setminus C)', l: (a, b, c) => a && !(b || c), r: (a, b, c) => a && !b && a && !c },
    { id: 'e1f', label: 'упр. 1 (f)', three: true, src: 'упражнение 1 (f)', L: 'A \\setminus (B \\cap C)', R: '(A \\setminus B) \\cup (A \\setminus C)', l: (a, b, c) => a && !(b && c), r: (a, b, c) => (a && !b) || (a && !c) },
    { id: 'e2a', label: 'упр. 2 (a)', three: false, src: 'упражнение 2 (a)', L: '(A \\cup B) \\setminus B', R: 'A', l: (a, b) => (a || b) && !b, r: (a) => a },
    { id: 'e2b', label: 'упр. 2 (b)', three: false, src: 'упражнение 2 (b)', L: '(A \\setminus B) \\cup B', R: 'A', l: (a, b) => (a && !b) || b, r: (a) => a },
    { id: 'bad', label: 'ошибка де Моргана', three: false, src: '', L: "(A \\cup B)'", R: "A' \\cup B'", l: (a, b) => !(a || b), r: (a, b) => !a || !b },
  ];

  /** Название области: A ∩ B′ ∩ C. */
  const regionName = (m, k) => m.slice(0, k).map((v, i) => NAMES[i] + (v ? '' : '′')).join(' ∩ ');

  MC.widget('laws', (el) => {
    const fig = F.shell(el, { kicker: T.fig2, title: T.title2 });
    const st = { law: 'd7' };
    const seg = F.seg(LAWS.map((o) => ({ value: o.id, label: o.label })), st.law, (v) => {
      st.law = v;
      build();
    }, T.law);
    fig.controls.append(seg.el);
    const ro = F.readout(fig.readout, [
      { key: 'match', label: T.match },
      { key: 'verdict', label: T.verdict },
    ]);

    function build() {
      const law = LAWS.find((o) => o.id === st.law);
      const k = law.three ? 3 : 2;
      fig.plot.replaceChildren();
      const cw = plotWidth(fig);
      const twoCols = cw >= 600;
      const W = twoCols ? Math.floor((cw - 16) / 2) : cw;

      const rows = [];
      for (let s = 0; s < 1 << k; s++) {
        const m = [!!(s & 1), !!(s & 2), !!(s & 4)];
        const lv = law.l(m[0], m[1], m[2]);
        const rv = law.r(m[0], m[1], m[2]);
        const els = UNI.filter((x) => sigOf(x, k) === s);
        rows.push({ m, lv, rv, els });
      }
      rows.sort((x, y) => Number(y.m[0]) - Number(x.m[0]) || Number(y.m[1]) - Number(x.m[1]) || Number(y.m[2]) - Number(x.m[2]));
      const bad = rows.filter((r) => r.lv !== r.rv);

      const formula = H('p', { style: { margin: '0 0 12px', textAlign: 'center', fontSize: '18px' } },
        F.rich('$' + law.L + (bad.length ? ' \\overset{?}{=} ' : ' = ') + law.R + '$'));
      const wrap = H('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '16px' } });
      [[T.left, law.L, law.l], [T.right, law.R, law.r]].forEach(([side, tex, f]) => {
        const box = H('div', { style: { flex: '1 1 ' + W + 'px', minWidth: '0' } });
        box.appendChild(H('div', { style: { textAlign: 'center', fontSize: '14px', color: 'var(--fg3)', marginBottom: '4px' } }, F.rich(side + ': $' + tex + '$')));
        wrap.appendChild(box);
        const p = vennPlot(box, W, T.plot2(side));
        drawVenn(p, law.three, f);
      });

      const th = (t) => H('th', null, t);
      const cell = (v, warn) => H('td', { style: warn ? { color: 'var(--warm)', fontWeight: '600' } : null }, v ? '1' : '0');
      const head = H('tr', null, th(T.region), NAMES.slice(0, k).map(th), th(T.leftShort), th(T.rightShort), th(T.elems));
      const body = rows.map((r) => {
        const w = r.lv !== r.rv;
        return H('tr', null,
          H('td', null, regionName(r.m, k)),
          r.m.slice(0, k).map((v) => H('td', null, v ? '1' : '0')),
          cell(r.lv, w), cell(r.rv, w),
          H('td', null, r.els.join(', ')));
      });
      const table = H('div', { class: 'table-wrap', style: { marginTop: '12px' } },
        H('table', { class: 'data', 'aria-label': T.tableAria }, H('thead', null, head), H('tbody', null, body)));
      fig.plot.append(formula, wrap, table);

      ro.set('match', T.of(rows.length - bad.length, rows.length), bad.length ? 'warm' : '');
      ro.set('verdict', bad.length ? T.no : T.yes, bad.length ? 'warm' : 'accent');
      if (!bad.length) {
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.okNote(rows.length, law.src);
      } else {
        const b = bad[0];
        fig.note.className = 'fig-note bad';
        fig.note.textContent = T.badNote(bad.length, regionName(b.m, k), b.lv ? T.onlyLeft : T.onlyRight, b.els[0]);
      }
    }
    build();
  });
})();
