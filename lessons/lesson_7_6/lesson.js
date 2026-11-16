/* Урок 7.6 «Бинарные операции»: рисунок «Таблица Кэли» — операция на маленьком множестве
 * и проверка её свойств по определениям Куликова (гл. 3, § 1). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  /* Строки интерфейса (пока только ru; en и uz добавятся вместе с переводом урока). */
  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title: 'Таблица Кэли: свойства операции видны по клеткам',
      preset: 'Операция',
      modn: 'элементов $n$',
      tableAria: 'Таблица Кэли операции',
      cellAria: (a, b) => 'Клетка ' + a + ', ' + b,
      comm: 'коммутативна',
      assoc: 'ассоциативна',
      neutral: 'нейтральный',
      regular: 'регулярные',
      symm: 'симметризуемые',
      yes: 'да',
      no: 'нет',
      none: 'нет',
      all: 'все',
      dash: '—',
      of: (k, n) => k + ' из ' + n,
      setWord: (items) => '{' + items.join(', ') + '}',
      commYes: 'Коммутативна: таблица симметрична относительно диагонали. ',
      commNo: (a, b, ab, ba) => 'Не коммутативна: ' + a + ' ⊤ ' + b + ' = ' + ab + ', а ' + b + ' ⊤ ' + a + ' = ' + ba + '. ',
      assocYes: (n) => 'Ассоциативна: проверены все ' + n + ' троек. ',
      assocNo: (a, b, c, l, r) => 'Не ассоциативна: ' + a + ' ⊤ (' + b + ' ⊤ ' + c + ') = ' + l + ', а (' + a + ' ⊤ ' + b + ') ⊤ ' + c + ' = ' + r + '. ',
      eYes: (e) => 'Нейтральный элемент — ' + e + '. ',
      eNone: 'Нейтральных элементов нет, даже односторонних. ',
      eLeft: (l) => 'Нейтрального нет; левые нейтральные: ' + l + ', правых нет. ',
      eRight: (r) => 'Нейтрального нет; правые нейтральные: ' + r + ', левых нет. ',
      intro: (name, size) => 'Операция: ' + name + ', элементов: ' + size + '. ',
      hint: 'Нажмите на клетку — разберу её строку и столбец.',
      cellNote: (a, b, ab, ba) => a + ' ⊤ ' + b + ' = ' + ab + ', а ' + b + ' ⊤ ' + a + ' = ' + ba + (ab === ba ? ' — совпадает. ' : ' — не совпадает: пара (' + a + '; ' + b + ') нарушает коммутативность. '),
      regBoth: (a) => 'Элемент ' + a + ' регулярен: в его строке и в его столбце нет повторов, на него можно сокращать с обеих сторон. ',
      regR: (a) => 'Элемент ' + a + ' регулярен только справа: в строке ' + a + ' повторов нет (из a ⊤ b = a ⊤ c следует b = c), а в столбце есть. ',
      regL: (a) => 'Элемент ' + a + ' регулярен только слева: в столбце ' + a + ' повторов нет, а в строке есть. ',
      regNo: (a, b, c, r) => 'Элемент ' + a + ' не регулярен ни справа, ни слева (повторы и в строке, и в столбце): например, ' + a + ' ⊤ ' + b + ' = ' + a + ' ⊤ ' + c + ' = ' + r + ', хотя ' + b + ' ≠ ' + c + '. ',
      symOk: (a, s) => 'Симметричный к ' + a + ': ' + s + ' (в обе стороны получается нейтральный элемент).',
      symHalf: (a, l, r) => 'Двустороннего симметричного к ' + a + ' нет; левые симметричные: ' + l + '; правые: ' + r + '.',
      symNone: (a) => 'Симметричных к ' + a + ' нет.',
      symNoE: 'О симметричных элементах говорить нельзя: нейтрального элемента нет.',
      ex: { add: 'сложение по модулю n', mul: 'умножение по модулю n', sub: 'вычитание по модулю n', pow: 'степень по модулю n', max: 'max', proj: 'левая проекция a ⊤ b = a', cup: '∪ на P({a, b})', cap: '∩ на P({a, b})', sym: 'Δ на P({a, b})', comp2: 'композиция отображений {1, 2} → {1, 2}', comp3: 'композиция отображений {1, 2, 3} → {1, 2}' },
    },
  });

  /* ---------- Наборы операций. Элементы — индексы 0…N−1, name(i) — подпись. ---------- */
  const mod = (a, n) => ((a % n) + n) % n;
  const SETS = ['∅', '{a}', '{b}', '{a,b}']; // биты: a — 1, b — 2
  // отображения {1,2}→{1,2}: код i, образы f(1) = 1 + (i>>1 & 1), f(2) = 1 + (i & 1)
  const maps = (dom) => {
    const out = [];
    const N = 1 << dom;
    for (let i = 0; i < N; i++) {
      const img = [];
      for (let k = dom - 1; k >= 0; k--) img.push(1 + ((i >> k) & 1));
      out.push(img);
    }
    return out;
  };
  const M2 = maps(2); // область {1,2}, значения в {1,2}
  const M3 = maps(3); // область {1,2,3}, значения в {1,2} ⊂ {1,2,3}
  const compose = (list) => (i, j) => {
    // Куликов: (f·g)(x) = f(g(x)) — сначала g, потом f
    const f = list[i];
    const g = list[j];
    const h = g.map((y) => f[y - 1]);
    return list.findIndex((m) => m.every((v, k) => v === h[k]));
  };

  const PRESETS = {
    add: { label: '$+$', num: true, f: (a, b, n) => mod(a + b, n) },
    mul: { label: '$\\cdot$', num: true, f: (a, b, n) => mod(a * b, n) },
    sub: { label: '$-$', num: true, f: (a, b, n) => mod(a - b, n) },
    pow: { label: '$a^b$', num: true, f: (a, b, n) => { let r = 1 % n; for (let k = 0; k < b; k++) r = mod(r * a, n); return r; } },
    max: { label: '$\\max$', num: true, f: (a, b) => Math.max(a, b) },
    proj: { label: '$\\pi_1$', num: true, f: (a) => a },
    cup: { label: '$\\cup$', size: 4, name: (i) => SETS[i], f: (a, b) => a | b },
    cap: { label: '$\\cap$', size: 4, name: (i) => SETS[i], f: (a, b) => a & b },
    sym: { label: '$\\Delta$', size: 4, name: (i) => SETS[i], f: (a, b) => a ^ b },
    comp2: { label: '$\\circ_2$', size: 4, name: (i) => M2[i].join(''), f: compose(M2) },
    comp3: { label: '$\\circ_3$', size: 8, name: (i) => M3[i].join(''), f: compose(M3) },
  };

  /** Все свойства операции по определениям Куликова. */
  function analyse(N, op) {
    const t = [];
    for (let i = 0; i < N; i++) {
      t.push([]);
      for (let j = 0; j < N; j++) t[i].push(op(i, j));
    }
    let commFail = null;
    for (let i = 0; i < N && !commFail; i++) for (let j = i + 1; j < N && !commFail; j++) if (t[i][j] !== t[j][i]) commFail = [i, j];
    let assocFail = null;
    for (let a = 0; a < N && !assocFail; a++)
      for (let b = 0; b < N && !assocFail; b++)
        for (let c = 0; c < N && !assocFail; c++) if (t[a][t[b][c]] !== t[t[a][b]][c]) assocFail = [a, b, c];
    const range = [...Array(N).keys()];
    const leftN = range.filter((e) => range.every((a) => t[e][a] === a)); // e ⊤ a = a
    const rightN = range.filter((e) => range.every((a) => t[a][e] === a)); // a ⊤ e = a
    const e = leftN.find((x) => rightN.includes(x));
    const has = e !== undefined;
    // регулярен справа (по Куликову): из a ⊤ b = a ⊤ c следует b = c — строка a без повторов
    const rowDup = range.map((a) => {
      for (let b = 0; b < N; b++) for (let c = b + 1; c < N; c++) if (t[a][b] === t[a][c]) return [b, c];
      return null;
    });
    const colDup = range.map((a) => {
      for (let b = 0; b < N; b++) for (let c = b + 1; c < N; c++) if (t[b][a] === t[c][a]) return [b, c];
      return null;
    });
    const sym = range.map((a) => {
      if (!has) return { l: [], r: [], two: [] };
      const l = range.filter((u) => t[u][a] === e);
      const r = range.filter((v) => t[a][v] === e);
      return { l, r, two: l.filter((u) => r.includes(u)) };
    });
    return { t, commFail, assocFail, leftN, rightN, e: has ? e : null, rowDup, colDup, sym };
  }

  MC.widget('cayley-ops', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title });
    const st = { op: cfg.preset || 'sub', n: cfg.n || 4, sel: cfg.sel || null };
    const keys = cfg.presets || Object.keys(PRESETS);
    const opSeg = F.seg(keys.map((k) => ({ value: k, label: PRESETS[k].label })), st.op, (v) => {
      st.op = v;
      st.sel = null;
      nS.el.style.display = PRESETS[v].num ? '' : 'none';
      build();
    }, T.preset);
    const nS = F.slider({ label: T.modn, min: 2, max: 7, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.sel = null;
      build();
    } });
    nS.el.style.display = PRESETS[st.op].num ? '' : 'none';
    fig.controls.append(opSeg.el, nS.el);
    const ro = F.readout(fig.readout, [
      { key: 'comm', label: T.comm },
      { key: 'assoc', label: T.assoc },
      { key: 'neutral', label: T.neutral },
      { key: 'reg', label: T.regular },
      { key: 'sym', label: T.symm },
    ]);

    let svg = null;
    let res = null;
    let P = null;
    let N = 0;
    const name = (i) => (P.name ? P.name(i) : String(i));
    const set = (arr) => T.setWord(arr.map(name));

    function build() {
      P = PRESETS[st.op];
      N = P.num ? st.n : P.size;
      res = analyse(N, (a, b) => P.f(a, b, N));
      const { t, leftN, rightN, e } = res;
      const C = N > 6 ? 54 : 60;
      const size = C * (N + 1);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = Math.max(size, 300) + 'px';
      const long = !P.num;
      const txt = (x, y, s, cls, accent) => {
        const node = S('text', { class: cls, x: x + C / 2, y: y + C / 2 }, s);
        if (long) node.style.fontSize = (s.length > 3 ? 14 : 17) + 'px';
        if (accent) node.style.fill = 'var(--accent)';
        svg.appendChild(node);
      };
      const corner = S('text', { class: 'cv corner', x: C / 2, y: C / 2 }, '⊤');
      svg.appendChild(corner);
      for (let i = 0; i < N; i++) {
        // заголовок строки: левые нейтральные; столбца — правые нейтральные
        if (rightN.includes(i)) svg.appendChild(S('rect', { x: C * (i + 1) + 2, y: 2, width: C - 4, height: C - 4, rx: 4, style: 'fill: var(--accent-soft)' }));
        if (leftN.includes(i)) svg.appendChild(S('rect', { x: 2, y: C * (i + 1) + 2, width: C - 4, height: C - 4, rx: 4, style: 'fill: var(--accent-soft)' }));
        txt(C * (i + 1), 0, name(i), 'cv ch', rightN.includes(i));
        txt(0, C * (i + 1), name(i), 'cv ch', leftN.includes(i));
      }
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const x = C * (j + 1);
          const y = C * (i + 1);
          const on = st.sel && st.sel[0] === i && st.sel[1] === j;
          const inLine = st.sel && (st.sel[0] === i || st.sel[1] === j) && !on;
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(name(i), name(j)) });
          const r = S('rect', { class: 'cell' + (on ? ' on' : ''), x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 });
          if (inLine) r.style.fill = 'var(--bg3)';
          g.appendChild(r);
          const isE = e !== null && t[i][j] === e;
          const node = S('text', { class: 'cv', x: x + C / 2, y: y + C / 2 }, name(t[i][j]));
          if (long) node.style.fontSize = (name(t[i][j]).length > 3 ? 14 : 17) + 'px';
          if (isE) node.style.fill = 'var(--accent)';
          g.appendChild(node);
          const pick = () => {
            st.sel = [i, j];
            build();
          };
          g.addEventListener('click', pick);
          g.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              pick();
            }
          });
          svg.appendChild(g);
        }
      }
      fig.plot.appendChild(svg);
      readouts();
      explain();
    }

    /** Список элементов в табло: целиком, если короткий, иначе «k из N». */
    function brief(arr) {
      if (arr.length === N) return T.all;
      if (!arr.length) return T.none;
      const txt = set(arr);
      return txt.length <= 12 ? txt : T.of(arr.length, N);
    }

    function readouts() {
      const { commFail, assocFail, e, rowDup, colDup, sym } = res;
      ro.set('comm', commFail ? T.no : T.yes, commFail ? 'warm' : 'accent');
      ro.set('assoc', assocFail ? T.no : T.yes, assocFail ? 'warm' : 'accent');
      ro.set('neutral', e !== null ? name(e) : T.none, e !== null ? 'accent' : 'warm');
      ro.set('reg', brief([...Array(N).keys()].filter((a) => !rowDup[a] && !colDup[a])));
      ro.set('sym', e === null ? T.dash : brief([...Array(N).keys()].filter((a) => sym[a].two.length)));
    }

    function summary() {
      const { t, commFail, assocFail, leftN, rightN, e } = res;
      let s = T.intro(T.ex[st.op], N);
      if (commFail) {
        const [a, b] = commFail;
        s += T.commNo(name(a), name(b), name(t[a][b]), name(t[b][a]));
      } else s += T.commYes;
      if (assocFail) {
        const [a, b, c] = assocFail;
        s += T.assocNo(name(a), name(b), name(c), name(t[a][t[b][c]]), name(t[t[a][b]][c]));
      } else s += T.assocYes(N * N * N);
      if (e !== null) s += T.eYes(name(e));
      else if (leftN.length) s += T.eLeft(set(leftN));
      else if (rightN.length) s += T.eRight(set(rightN));
      else s += T.eNone;
      return s;
    }

    function explain() {
      fig.note.className = 'fig-note';
      if (!st.sel) {
        fig.note.textContent = summary() + T.hint;
        return;
      }
      const { t, rowDup, colDup, sym, e } = res;
      const [a, b] = st.sel;
      let s = T.cellNote(name(a), name(b), name(t[a][b]), name(t[b][a]));
      if (!rowDup[a] && !colDup[a]) s += T.regBoth(name(a));
      else if (!rowDup[a]) s += T.regR(name(a));
      else if (!colDup[a]) s += T.regL(name(a));
      else s += T.regNo(name(a), name(rowDup[a][0]), name(rowDup[a][1]), name(t[a][rowDup[a][0]]));
      if (e === null) s += T.symNoE;
      else if (sym[a].two.length) s += T.symOk(name(a), set(sym[a].two));
      else if (sym[a].l.length || sym[a].r.length) s += T.symHalf(name(a), sym[a].l.length ? set(sym[a].l) : T.none, sym[a].r.length ? set(sym[a].r) : T.none);
      else s += T.symNone(name(a));
      fig.note.textContent = summary() + s;
    }

    build();
  });

  /* Для проверок в node: тот же анализ без DOM. */
  if (typeof module !== 'undefined') module.exports = { analyse, PRESETS };
})();
