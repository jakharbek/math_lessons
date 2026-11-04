/* Урок 7.3 «Конгруэнция»: рисунки «Циферблат» и «Таблица ассоциированной операции». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;
  const S = MC.svg;

  /* Строки интерфейса на трёх языках (ru — без изменений, en, uz). */
  const T = MC.i18n.pick({
    ru: {
      opWord: { add: '«+»', sub: '«−»', mul: '«·»', max: 'max', min: 'min' },
      fig1: 'Рисунок 1',
      title1: 'Циферблат: класс результата не зависит от представителей',
      plot1: 'Классы вычетов по модулю n на окружности и классы результатов',
      op: 'Операция',
      modn: 'модуль $n$',
      kc: '$k$ в $c = a + kn$',
      md: '$m$ в $d = b + mn$',
      resCls: 'классы результатов',
      two: (r1, r2) => '[' + r1 + '] и [' + r2 + ']',
      reps: (c, ca, d, cb) => 'c = ' + c + ' — представитель класса [' + ca + '], d = ' + d + ' — класса [' + cb + ']. ',
      okNote: (r1, n, w) => 'Результат снова в классе [' + r1 + ']: сравнение по модулю ' + n + ' — конгруэнция относительно ' + w + '.',
      luckyNote: 'Классы совпали, но это удача: подвигайте a, b, k или m — для max сравнение по модулю не конгруэнция.',
      badNote: (r1, r2, n) => 'Но результаты попали в разные классы [' + r1 + '] и [' + r2 + ']: сравнение по модулю ' + n + ' не конгруэнция относительно max, операция на классах не определена.',
      relMod: 'остаток mod $n$',
      relSign: 'знак',
      relDec: 'десяток $\\lfloor a/10 \\rfloor$',
      fig2: 'Рисунок 2',
      title2: 'Таблица ассоциированной операции: в каждой клетке один класс?',
      rel: 'Отношение эквивалентности',
      pairs: 'проверено пар $(a; b)$',
      cells: 'клеток с одним классом',
      verdict: 'вывод',
      tableAria: 'Таблица ассоциированной операции',
      cellAria: (r, c) => 'Клетка ' + r + ', ' + c,
      of: (g, t) => g + ' из ' + t,
      noContra: 'противоречий нет',
      notCong: 'не конгруэнция',
      q: (s) => '«' + s + '»',
      allGood: 'Во всех клетках по одному классу: на отрезке [−12; 12] разные представители всегда дают один и тот же класс. Перед вами таблица ассоциированной операции. Нажмите на клетку — покажу пример.',
      someBad: (cnt, w, r, c) => 'Красных клеток: ' + cnt + '. Отношение не конгруэнция относительно ' + w + ' — нажмите на красную клетку, и рисунок покажет контрпример' + (r !== null ? ' (например, строка ' + r + ', столбец ' + c + ').' : '.'),
      oneCls: (ci, cj, cr, e, v) => 'Любые a из класса ' + ci + ' и b из класса ' + cj + ' дают класс ' + cr + '. Например, ' + e + ' = ' + v + '.',
      counter: (a, c, ci, b, d, cj, e1, v1, k1, e2, v2, k2) =>
        'Контрпример: a = ' + a + ' и c = ' + c + ' из класса ' + ci + ', b = ' + b + ' и d = ' + d + ' из класса ' + cj +
        ', но ' + e1 + ' = ' + v1 + ' лежит в классе ' + k1 + ', а ' + e2 + ' = ' + v2 + ' — в классе ' + k2 + '.',
    },
    en: {
      opWord: { add: '“+”', sub: '“−”', mul: '“·”', max: 'max', min: 'min' },
      fig1: 'Figure 1',
      title1: 'Clock face: the class of the result does not depend on the representatives',
      plot1: 'Residue classes modulo n on a circle and the classes of the results',
      op: 'Operation',
      modn: 'modulus $n$',
      kc: '$k$ in $c = a + kn$',
      md: '$m$ in $d = b + mn$',
      resCls: 'classes of the results',
      two: (r1, r2) => '[' + r1 + '] and [' + r2 + ']',
      reps: (c, ca, d, cb) => 'c = ' + c + ' is a representative of the class [' + ca + '], d = ' + d + ' of the class [' + cb + ']. ',
      okNote: (r1, n, w) => 'The result is again in the class [' + r1 + ']: congruence modulo ' + n + ' is a congruence with respect to ' + w + '.',
      luckyNote: 'The classes coincide, but that is luck: move a, b, k or m — for max, congruence modulo n is not a congruence.',
      badNote: (r1, r2, n) => 'But the results landed in different classes [' + r1 + '] and [' + r2 + ']: congruence modulo ' + n + ' is not a congruence with respect to max, so the operation on classes is not defined.',
      relMod: 'residue mod $n$',
      relSign: 'sign',
      relDec: 'decade $\\lfloor a/10 \\rfloor$',
      fig2: 'Figure 2',
      title2: 'Table of the associated operation: one class in every cell?',
      rel: 'Equivalence relation',
      pairs: 'pairs $(a, b)$ checked',
      cells: 'cells with one class',
      verdict: 'verdict',
      tableAria: 'Table of the associated operation',
      cellAria: (r, c) => 'Cell ' + r + ', ' + c,
      of: (g, t) => g + ' of ' + t,
      noContra: 'no contradictions',
      notCong: 'not a congruence',
      q: (s) => '“' + s + '”',
      allGood: 'Every cell holds a single class: on the interval [−12, 12] different representatives always give the same class. This is the table of the associated operation. Click a cell and the figure will show an example.',
      someBad: (cnt, w, r, c) => 'Red cells: ' + cnt + '. The relation is not a congruence with respect to ' + w + ' — click a red cell and the figure will show a counterexample' + (r !== null ? ' (for example, row ' + r + ', column ' + c + ').' : '.'),
      oneCls: (ci, cj, cr, e, v) => 'Any a from the class ' + ci + ' and any b from the class ' + cj + ' give the class ' + cr + '. For example, ' + e + ' = ' + v + '.',
      counter: (a, c, ci, b, d, cj, e1, v1, k1, e2, v2, k2) =>
        'Counterexample: a = ' + a + ' and c = ' + c + ' are in the class ' + ci + ', b = ' + b + ' and d = ' + d + ' are in the class ' + cj +
        ', but ' + e1 + ' = ' + v1 + ' lies in the class ' + k1 + ', while ' + e2 + ' = ' + v2 + ' lies in the class ' + k2 + '.',
    },
    uz: {
      opWord: { add: '«+»', sub: '«−»', mul: '«·»', max: 'max', min: 'min' },
      fig1: '1-rasm',
      title1: 'Siferblat: natija sinfi vakillarning tanloviga bog‘liq emas',
      plot1: 'n modul bo‘yicha chegirmalar sinflari aylanada va natijalar sinflari',
      op: 'Amal',
      modn: '$n$ modul',
      kc: '$c = a + kn$ dagi $k$',
      md: '$d = b + mn$ dagi $m$',
      resCls: 'natijalar sinflari',
      two: (r1, r2) => '[' + r1 + '] va [' + r2 + ']',
      reps: (c, ca, d, cb) => 'c = ' + c + ' — [' + ca + '] sinfning vakili, d = ' + d + ' — [' + cb + '] sinfning vakili. ',
      okNote: (r1, n, w) => 'Natija yana [' + r1 + '] sinfida: ' + n + ' modul bo‘yicha taqqoslama ' + w + ' amaliga nisbatan kongruensiya.',
      luckyNote: 'Sinflar mos tushdi, lekin bu tasodif: a, b, k yoki m ni o‘zgartirib ko‘ring — max uchun modul bo‘yicha taqqoslama kongruensiya emas.',
      badNote: (r1, r2, n) => 'Lekin natijalar turli sinflarga tushdi: [' + r1 + '] va [' + r2 + ']. ' + n + ' modul bo‘yicha taqqoslama max amaliga nisbatan kongruensiya emas, sinflarda amal aniqlanmagan.',
      relMod: 'qoldiq mod $n$',
      relSign: 'ishora',
      relDec: 'o‘nlik $\\lfloor a/10 \\rfloor$',
      fig2: '2-rasm',
      title2: 'Assotsiyalangan amal jadvali: har bir katakda bitta sinfmi?',
      rel: 'Ekvivalentlik munosabati',
      pairs: 'tekshirilgan $(a; b)$ juftlar',
      cells: 'bitta sinfli kataklar',
      verdict: 'xulosa',
      tableAria: 'Assotsiyalangan amal jadvali',
      cellAria: (r, c) => 'Katak ' + r + ', ' + c,
      of: (g, t) => t + ' tadan ' + g,
      noContra: 'ziddiyat yo‘q',
      notCong: 'kongruensiya emas',
      q: (s) => '«' + s + '»',
      allGood: 'Barcha kataklarda bittadan sinf: [−12; 12] kesmada turli vakillar doim bir xil sinfni beradi. Bu — assotsiyalangan amal jadvali. Katakni bosing — rasm misol ko‘rsatadi.',
      someBad: (cnt, w, r, c) => 'Qizil kataklar: ' + cnt + '. Munosabat ' + w + ' amaliga nisbatan kongruensiya emas — qizil katakni bosing, rasm qarshi misolni ko‘rsatadi' + (r !== null ? ' (masalan, ' + r + ' satr, ' + c + ' ustun).' : '.'),
      oneCls: (ci, cj, cr, e, v) => ci + ' sinfidagi istalgan a va ' + cj + ' sinfidagi istalgan b ' + cr + ' sinfini beradi. Masalan, ' + e + ' = ' + v + '.',
      counter: (a, c, ci, b, d, cj, e1, v1, k1, e2, v2, k2) =>
        'Qarshi misol: a = ' + a + ' va c = ' + c + ' — ' + ci + ' sinfidan, b = ' + b + ' va d = ' + d + ' — ' + cj + ' sinfidan, lekin ' +
        e1 + ' = ' + v1 + ' ' + k1 + ' sinfida, ' + e2 + ' = ' + v2 + ' esa ' + k2 + ' sinfida yotadi.',
    },
  });

  /** Остаток в диапазоне 0…n−1 и для отрицательных чисел. */
  const mod = (a, n) => ((a % n) + n) % n;
  /** Целое для интерфейса: настоящий минус; отрицательное второе слагаемое — в скобках. */
  const int = (x) => U.fmt(x, 0);
  const arg = (x) => (x < 0 ? '(' + int(x) + ')' : int(x));

  const OPS = {
    add: { label: '$+$', f: (a, b) => a + b, show: (a, b) => int(a) + ' + ' + arg(b) },
    sub: { label: '$-$', f: (a, b) => a - b, show: (a, b) => int(a) + ' − ' + arg(b) },
    mul: { label: '$\\cdot$', f: (a, b) => a * b, show: (a, b) => int(a) + ' · ' + arg(b) },
    max: { label: '$\\max$', f: (a, b) => Math.max(a, b), show: (a, b) => 'max(' + int(a) + U.sep() + int(b) + ')' },
    min: { label: '$\\min$', f: (a, b) => Math.min(a, b), show: (a, b) => 'min(' + int(a) + U.sep() + int(b) + ')' },
  };
  const OP_WORD = T.opWord;

  /* =================================================================================
   * Рисунок 1. Циферблат: классы вычетов по модулю n на окружности. Заменяем a и b
   * другими представителями c = a + kn, d = b + mn и смотрим, совпадут ли классы
   * результатов a ⊤ b и c ⊤ d.
   * ================================================================================= */
  MC.widget('clock', (el) => {
    const fig = F.shell(el, { kicker: T.fig1, title: T.title1 });
    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    const narrow = W < 520;
    const p = new MC.Plot(fig.plot, {
      width: W,
      height: Math.round(W * (narrow ? 0.9 : 0.5)),
      x: [-1.4, 1.4],
      y: [-1.32, 1.32],
      equal: true,
      margin: { l: 8, r: 8, t: 8, b: 8 },
      label: T.plot1,
    });
    const st = { op: 'add', n: 12, a: 9, b: 5, k: 1, m: 1 };

    const opSeg = F.seg(['add', 'sub', 'mul', 'max'].map((k) => ({ value: k, label: OPS[k].label })), st.op, (v) => {
      st.op = v;
      draw();
    }, T.op);
    const sl = (key, label, min, max) =>
      F.slider({ label, min, max, step: 1, value: st[key], fmt: int, oninput: (v) => {
        st[key] = Math.round(v);
        draw();
      } });
    const nS = sl('n', T.modn, 2, 12);
    const aS = sl('a', '$a$', -20, 20);
    const bS = sl('b', '$b$', -20, 20);
    const kS = sl('k', T.kc, -3, 3);
    const mS = sl('m', T.md, -3, 3);
    fig.controls.append(opSeg.el, nS.el, aS.el, bS.el, kS.el, mS.el);

    const ro = F.readout(fig.readout, [
      { key: 'ab', label: '$a \\top b$' },
      { key: 'cd', label: '$c \\top d$' },
      { key: 'cls', label: T.resCls },
    ]);

    const ring = [];
    for (let i = 0; i <= 160; i++) ring.push([Math.cos((2 * Math.PI * i) / 160), Math.sin((2 * Math.PI * i) / 160)]);

    function draw() {
      const { n, a, b, k, m } = st;
      const op = OPS[st.op];
      const c = a + k * n;
      const d = b + m * n;
      const r1 = mod(op.f(a, b), n);
      const r2 = mod(op.f(c, d), n);
      const at = (r, rad = 1) => {
        const t = Math.PI / 2 - (2 * Math.PI * r) / n; // 0 — наверху, по часовой стрелке, как на часах
        return [rad * Math.cos(t), rad * Math.sin(t)];
      };
      p.clear();
      p.path(ring, 'curve faint');
      for (let r = 0; r < n; r++) {
        const [x, y] = at(r);
        p.dot(x, y, 'hollow small', 3.5, 'main');
        const [lx, ly] = at(r, 1.17);
        p.text(lx, ly, String(r), 'lbl ink', { anchor: 'middle', dy: 5 });
      }
      const A = at(mod(a, n), 0.8);
      const B = at(mod(b, n), 0.62);
      p.arrow(0, 0, A[0], A[1], 'accent');
      p.arrow(0, 0, B[0], B[1], 'warm');
      const P2 = at(r2);
      const P1 = at(r1);
      p._add(S('circle', { class: 'res-ring', cx: p.sx(P2[0]).toFixed(1), cy: p.sy(P2[1]).toFixed(1), r: 12 }), 'front');
      p.dot(P1[0], P1[1], '', 6.5);
      p.dot(0, 0, '', 3);

      const same = r1 === r2;
      ro.set('ab', op.show(a, b) + ' = ' + int(op.f(a, b)));
      ro.set('cd', op.show(c, d) + ' = ' + int(op.f(c, d)));
      ro.set('cls', T.two(r1, r2), same ? '' : 'warm');

      const congruent = st.op !== 'max'; // для n ≥ 2 сравнение по модулю — конгруэнция для +, −, ·, но не для max
      const reps = T.reps(int(c), mod(a, n), int(d), mod(b, n));
      if (same && congruent) {
        fig.note.className = 'fig-note';
        fig.note.textContent = reps + T.okNote(r1, n, OP_WORD[st.op]);
      } else if (same) {
        fig.note.className = 'fig-note';
        fig.note.textContent = reps + T.luckyNote;
      } else {
        fig.note.className = 'fig-note bad';
        fig.note.textContent = reps + T.badNote(r1, r2, n);
      }
    }
    draw();
  });

  /* =================================================================================
   * Рисунок 2. Таблица ассоциированной операции. Перебираем пары a, b из [−12; 12],
   * для каждой пары классов собираем классы результатов. Один класс в клетке — значение
   * ⊤*, несколько — противоречие (контрпример к конгруэнции).
   * ================================================================================= */
  const DOMAIN = [];
  for (let i = -12; i <= 12; i++) DOMAIN.push(i);
  const RELS = {
    mod: {
      label: T.relMod,
      key: (a, n) => mod(a, n),
      name: (c) => String(c),
      head: (c) => '[' + c + ']',
    },
    sign: {
      label: T.relSign,
      key: (a) => Math.sign(a),
      name: (c) => (c < 0 ? '−' : c > 0 ? '+' : '0'),
      head: (c) => (c < 0 ? '−' : c > 0 ? '+' : '0'),
    },
    dec: {
      label: T.relDec,
      key: (a) => Math.floor(a / 10),
      name: (c) => int(c),
      head: (c) => int(c),
    },
  };

  MC.widget('cayley', (el) => {
    const fig = F.shell(el, { kicker: T.fig2, title: T.title2 });
    const st = { rel: 'sign', op: 'mul', n: 3, sel: null };

    const relSeg = F.seg(Object.keys(RELS).map((k) => ({ value: k, label: RELS[k].label })), st.rel, (v) => {
      st.rel = v;
      st.sel = null;
      nS.el.style.display = v === 'mod' ? '' : 'none';
      build();
    }, T.rel);
    const opSeg = F.seg(Object.keys(OPS).map((k) => ({ value: k, label: OPS[k].label })), st.op, (v) => {
      st.op = v;
      st.sel = null;
      build();
    }, T.op);
    const nS = F.slider({ label: T.modn, min: 2, max: 7, step: 1, value: st.n, fmt: int, oninput: (v) => {
      st.n = Math.round(v);
      st.sel = null;
      build();
    } });
    nS.el.style.display = 'none';
    fig.controls.append(relSeg.el, opSeg.el, nS.el);

    const ro = F.readout(fig.readout, [
      { key: 'pairs', label: T.pairs },
      { key: 'cells', label: T.cells },
      { key: 'verdict', label: T.verdict },
    ]);

    let svg = null;
    let table = null;

    /** Для каждой пары классов: Map(класс результата → пример (a; b) с наименьшими |a| + |b|). */
    function compute() {
      const rel = RELS[st.rel];
      const key = (a) => rel.key(a, st.n);
      const classes = Array.from(new Set(DOMAIN.map(key))).sort((x, y) => x - y);
      const members = new Map(classes.map((c) => [c, DOMAIN.filter((a) => key(a) === c).sort((x, y) => Math.abs(x) - Math.abs(y) || y - x)]));
      const op = OPS[st.op].f;
      const cells = classes.map((ci) =>
        classes.map((cj) => {
          const out = new Map();
          for (const a of members.get(ci)) {
            for (const b of members.get(cj)) {
              const r = key(op(a, b));
              const prev = out.get(r);
              if (!prev || Math.abs(a) + Math.abs(b) < Math.abs(prev[0]) + Math.abs(prev[1])) out.set(r, [a, b]);
            }
          }
          return out;
        })
      );
      return { rel, classes, cells };
    }

    function build() {
      table = compute();
      const { rel, classes, cells } = table;
      const N = classes.length;
      const C = 58;
      const size = C * (N + 1);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = Math.max(size, 300) + 'px';
      const cellText = (x, y, txt, cls) => svg.appendChild(S('text', { class: cls, x: x + C / 2, y: y + C / 2 }, txt));
      svg.appendChild(S('rect', { class: 'cell head', x: 2, y: 2, width: C - 4, height: C - 4 }));
      cellText(0, 0, { add: '+*', sub: '−*', mul: '∙*', max: 'max*', min: 'min*' }[st.op], 'cv corner');
      classes.forEach((c, i) => {
        cellText(C * (i + 1), 0, rel.head(c), 'cv ch');
        cellText(0, C * (i + 1), rel.head(c), 'cv ch');
      });
      let good = 0;
      let firstBad = null;
      cells.forEach((row, i) =>
        row.forEach((out, j) => {
          const vals = Array.from(out.keys()).sort((x, y) => x - y);
          const bad = vals.length > 1;
          if (bad && !firstBad) firstBad = [i, j];
          if (!bad) good += 1;
          const x = C * (j + 1);
          const y = C * (i + 1);
          const on = st.sel && st.sel[0] === i && st.sel[1] === j;
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(rel.head(classes[i]), rel.head(classes[j])) });
          g.appendChild(S('rect', { class: 'cell' + (bad ? ' bad' : '') + (on ? ' on' : ''), x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 }));
          const txt = bad ? vals.slice(0, 2).map(rel.name).join(', ') + (vals.length > 2 ? ',…' : '') : rel.name(vals[0]);
          g.appendChild(S('text', { class: 'cv' + (bad ? ' bad' : ''), x: x + C / 2, y: y + C / 2 }, txt));
          const pick = () => {
            st.sel = [i, j];
            build();
          };
          g.addEventListener('click', pick);
          g.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              pick();
            }
          });
          svg.appendChild(g);
        })
      );
      fig.plot.appendChild(svg);

      const total = N * N;
      ro.set('pairs', String(DOMAIN.length * DOMAIN.length));
      ro.set('cells', T.of(good, total), good === total ? '' : 'warm');
      ro.set('verdict', good === total ? T.noContra : T.notCong, good === total ? 'accent' : 'warm');
      explain(st.sel || null, good === total, firstBad);
    }

    function explain(sel, allGood, firstBad) {
      const { rel, classes, cells } = table;
      const opName = OP_WORD[st.op];
      const show = OPS[st.op].show;
      const f = OPS[st.op].f;
      const cls = (c) => T.q(rel.head(c));
      if (!sel) {
        fig.note.className = 'fig-note';
        fig.note.textContent = allGood
          ? T.allGood
          : T.someBad(cells.flat().filter((o) => o.size > 1).length, opName,
            firstBad ? cls(classes[firstBad[0]]) : null, firstBad ? cls(classes[firstBad[1]]) : null);
        return;
      }
      const [i, j] = sel;
      const out = cells[i][j];
      const vals = Array.from(out.keys()).sort((x, y) => x - y);
      if (vals.length === 1) {
        const [a, b] = out.get(vals[0]);
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.oneCls(cls(classes[i]), cls(classes[j]), cls(vals[0]), show(a, b), int(f(a, b)));
        return;
      }
      const [a, b] = out.get(vals[0]);
      const [c, d] = out.get(vals[1]);
      fig.note.className = 'fig-note bad';
      fig.note.textContent = T.counter(int(a), int(c), cls(classes[i]), int(b), int(d), cls(classes[j]),
        show(a, b), int(f(a, b)), cls(vals[0]), show(c, d), int(f(c, d)), cls(vals[1]));
    }

    build();
  });
})();
