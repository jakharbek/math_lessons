/* Урок 7.3 «Конгруэнция»: рисунки «Циферблат» и «Таблица ассоциированной операции». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;
  const S = MC.svg;

  /** Остаток в диапазоне 0…n−1 и для отрицательных чисел. */
  const mod = (a, n) => ((a % n) + n) % n;
  /** Целое для интерфейса: настоящий минус; отрицательное второе слагаемое — в скобках. */
  const int = (x) => U.fmt(x, 0);
  const arg = (x) => (x < 0 ? '(' + int(x) + ')' : int(x));

  const OPS = {
    add: { label: '$+$', f: (a, b) => a + b, show: (a, b) => int(a) + ' + ' + arg(b) },
    sub: { label: '$-$', f: (a, b) => a - b, show: (a, b) => int(a) + ' − ' + arg(b) },
    mul: { label: '$\\cdot$', f: (a, b) => a * b, show: (a, b) => int(a) + ' · ' + arg(b) },
    max: { label: '$\\max$', f: (a, b) => Math.max(a, b), show: (a, b) => 'max(' + int(a) + '; ' + int(b) + ')' },
    min: { label: '$\\min$', f: (a, b) => Math.min(a, b), show: (a, b) => 'min(' + int(a) + '; ' + int(b) + ')' },
  };
  const OP_WORD = { add: '«+»', sub: '«−»', mul: '«·»', max: 'max', min: 'min' };

  /* =================================================================================
   * Рисунок 1. Циферблат: классы вычетов по модулю n на окружности. Заменяем a и b
   * другими представителями c = a + kn, d = b + mn и смотрим, совпадут ли классы
   * результатов a ⊤ b и c ⊤ d.
   * ================================================================================= */
  MC.widget('clock', (el) => {
    const fig = F.shell(el, { kicker: 'Рисунок 1', title: 'Циферблат: класс результата не зависит от представителей' });
    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    const narrow = W < 520;
    const p = new MC.Plot(fig.plot, {
      width: W,
      height: Math.round(W * (narrow ? 0.9 : 0.5)),
      x: [-1.4, 1.4],
      y: [-1.32, 1.32],
      equal: true,
      margin: { l: 8, r: 8, t: 8, b: 8 },
      label: 'Классы вычетов по модулю n на окружности и классы результатов',
    });
    const st = { op: 'add', n: 12, a: 9, b: 5, k: 1, m: 1 };

    const opSeg = F.seg(['add', 'sub', 'mul', 'max'].map((k) => ({ value: k, label: OPS[k].label })), st.op, (v) => {
      st.op = v;
      draw();
    }, 'Операция');
    const sl = (key, label, min, max) =>
      F.slider({ label, min, max, step: 1, value: st[key], fmt: int, oninput: (v) => {
        st[key] = Math.round(v);
        draw();
      } });
    const nS = sl('n', 'модуль $n$', 2, 12);
    const aS = sl('a', '$a$', -20, 20);
    const bS = sl('b', '$b$', -20, 20);
    const kS = sl('k', '$k$ в $c = a + kn$', -3, 3);
    const mS = sl('m', '$m$ в $d = b + mn$', -3, 3);
    fig.controls.append(opSeg.el, nS.el, aS.el, bS.el, kS.el, mS.el);

    const ro = F.readout(fig.readout, [
      { key: 'ab', label: '$a \\top b$' },
      { key: 'cd', label: '$c \\top d$' },
      { key: 'cls', label: 'классы результатов' },
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
      ro.set('cls', '[' + r1 + '] и [' + r2 + ']', same ? '' : 'warm');

      const congruent = st.op !== 'max'; // для n ≥ 2 сравнение по модулю — конгруэнция для +, −, ·, но не для max
      const reps = 'c = ' + int(c) + ' — представитель класса [' + mod(a, n) + '], d = ' + int(d) + ' — класса [' + mod(b, n) + ']. ';
      if (same && congruent) {
        fig.note.className = 'fig-note';
        fig.note.textContent = reps + 'Результат снова в классе [' + r1 + ']: сравнение по модулю ' + n + ' — конгруэнция относительно ' + OP_WORD[st.op] + '.';
      } else if (same) {
        fig.note.className = 'fig-note';
        fig.note.textContent = reps + 'Классы совпали, но это удача: подвигайте a, b, k или m — для max сравнение по модулю не конгруэнция.';
      } else {
        fig.note.className = 'fig-note bad';
        fig.note.textContent = reps + 'Но результаты попали в разные классы [' + r1 + '] и [' + r2 + ']: сравнение по модулю ' + n + ' не конгруэнция относительно max, операция на классах не определена.';
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
      label: 'остаток mod $n$',
      key: (a, n) => mod(a, n),
      name: (c) => String(c),
      head: (c) => '[' + c + ']',
    },
    sign: {
      label: 'знак',
      key: (a) => Math.sign(a),
      name: (c) => (c < 0 ? '−' : c > 0 ? '+' : '0'),
      head: (c) => (c < 0 ? '−' : c > 0 ? '+' : '0'),
    },
    dec: {
      label: 'десяток $\\lfloor a/10 \\rfloor$',
      key: (a) => Math.floor(a / 10),
      name: (c) => int(c),
      head: (c) => int(c),
    },
  };

  MC.widget('cayley', (el) => {
    const fig = F.shell(el, { kicker: 'Рисунок 2', title: 'Таблица ассоциированной операции: в каждой клетке один класс?' });
    const st = { rel: 'sign', op: 'mul', n: 3, sel: null };

    const relSeg = F.seg(Object.keys(RELS).map((k) => ({ value: k, label: RELS[k].label })), st.rel, (v) => {
      st.rel = v;
      st.sel = null;
      nS.el.style.display = v === 'mod' ? '' : 'none';
      build();
    }, 'Отношение эквивалентности');
    const opSeg = F.seg(Object.keys(OPS).map((k) => ({ value: k, label: OPS[k].label })), st.op, (v) => {
      st.op = v;
      st.sel = null;
      build();
    }, 'Операция');
    const nS = F.slider({ label: 'модуль $n$', min: 2, max: 7, step: 1, value: st.n, fmt: int, oninput: (v) => {
      st.n = Math.round(v);
      st.sel = null;
      build();
    } });
    nS.el.style.display = 'none';
    fig.controls.append(relSeg.el, opSeg.el, nS.el);

    const ro = F.readout(fig.readout, [
      { key: 'pairs', label: 'проверено пар $(a; b)$' },
      { key: 'cells', label: 'клеток с одним классом' },
      { key: 'verdict', label: 'вывод' },
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
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': 'Таблица ассоциированной операции' });
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
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': 'Клетка ' + rel.head(classes[i]) + ', ' + rel.head(classes[j]) });
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
      ro.set('cells', good + ' из ' + total, good === total ? '' : 'warm');
      ro.set('verdict', good === total ? 'противоречий нет' : 'не конгруэнция', good === total ? 'accent' : 'warm');
      explain(st.sel || null, good === total, firstBad);
    }

    function explain(sel, allGood, firstBad) {
      const { rel, classes, cells } = table;
      const opName = OP_WORD[st.op];
      const show = OPS[st.op].show;
      const f = OPS[st.op].f;
      const cls = (c) => '«' + rel.head(c) + '»';
      if (!sel) {
        fig.note.className = 'fig-note';
        fig.note.textContent = allGood
          ? 'Во всех клетках по одному классу: на отрезке [−12; 12] разные представители всегда дают один и тот же класс. Перед вами таблица ассоциированной операции. Нажмите на клетку — покажу пример.'
          : 'Красных клеток: ' + cells.flat().filter((o) => o.size > 1).length + '. Отношение не конгруэнция относительно ' + opName + ' — нажмите на красную клетку, и рисунок покажет контрпример' + (firstBad ? ' (например, строка ' + cls(classes[firstBad[0]]) + ', столбец ' + cls(classes[firstBad[1]]) + ').' : '.');
        return;
      }
      const [i, j] = sel;
      const out = cells[i][j];
      const vals = Array.from(out.keys()).sort((x, y) => x - y);
      if (vals.length === 1) {
        const [a, b] = out.get(vals[0]);
        fig.note.className = 'fig-note ok';
        fig.note.textContent = 'Любые a из класса ' + cls(classes[i]) + ' и b из класса ' + cls(classes[j]) + ' дают класс ' + cls(vals[0]) + '. Например, ' + show(a, b) + ' = ' + int(f(a, b)) + '.';
        return;
      }
      const [a, b] = out.get(vals[0]);
      const [c, d] = out.get(vals[1]);
      fig.note.className = 'fig-note bad';
      fig.note.textContent =
        'Контрпример: a = ' + int(a) + ' и c = ' + int(c) + ' из класса ' + cls(classes[i]) + ', b = ' + int(b) + ' и d = ' + int(d) + ' из класса ' + cls(classes[j]) +
        ', но ' + show(a, b) + ' = ' + int(f(a, b)) + ' лежит в классе ' + cls(vals[0]) + ', а ' + show(c, d) + ' = ' + int(f(c, d)) + ' — в классе ' + cls(vals[1]) + '.';
    }

    build();
  });
})();
