/* Урок 7.16 «Предикатные формулы. Законы логики» (Куликов, гл. 1, § 5).
 * Рисунок 1 «Законы кванторов на конечном множестве»: одноместные предикаты A(x), B(x) задаются клетками,
 * обе части равносильности считаются перебором; «Перебрать все» проверяет все пары предикатов.
 * Рисунок 2 «Двухместный предикат»: клетки Q(x, y) на n × n; ∀x∃y против ∃y∀x, перестановка кванторов,
 * транзитивность (упражнения 1 (e), 1 (f), 2 (j), 2 (k)). */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Законы кванторов: проверка перебором на конечном множестве',
      title2: 'Двухместный предикат: порядок кванторов',
      law: 'Равносильность',
      size: 'элементов $n$',
      left: 'левая часть',
      right: 'правая часть',
      same: 'совпадают',
      all: 'на всех парах',
      yes: 'И',
      no: 'Л',
      eq: 'да',
      neq: 'нет',
      checkAll: 'Перебрать все',
      counter: 'Контрпример',
      clear: 'Очистить',
      aria1: 'Значения предикатов A(x) и B(x) на элементах 1…n',
      aria2: 'Значения предиката Q(x, y): строка x, столбец y',
      cell: (p, x, v) => p + '(' + x + ') = ' + v,
      cell2: (x, y, v) => 'Q(' + x + ', ' + y + ') = ' + v,
      allOk: (k, n) => 'Проверены все ' + k + ' пар предикатов A, B на множестве из ' + n + ' элементов: части совпадают всегда. На этом множестве равносильность верна.',
      allBad: (k, bad, n) => 'Из ' + k + ' пар предикатов A, B на множестве из ' + n + ' элементов части расходятся в ' + bad + '. Формулы не равносильны — «Контрпример» покажет одну такую пару.',
      noCounter: 'На этом множестве контрпримера нет.',
      hint1: 'Нажимайте на клетки: синяя — И, пустая — Л.',
      state: (l, r) => 'Левая часть — ' + l + ', правая — ' + r + '. ',
      quant: 'Формула',
      q: { ae: '∀x∃y → ∃y∀x', swap: '∀x∀y ↔ ∀y∀x', ee: '∃x∃y ↔ ∃y∃x', tr: 'транзитивность' },
      pre: { eq: 'x = y', le: 'x ≤ y', ne: 'x ≠ y', full: 'все И' },
      v1: '∀x∃y Q(x, y)',
      v2: '∃y∀x Q(x, y)',
      vimp: 'импликация',
      trans: 'транзитивен',
      aeNote: (a, b) => (a && !b
        ? 'У каждой строки есть синяя клетка (∀x∃y — И), но ни один столбец не синий целиком (∃y∀x — Л): импликация ложна — это контрпример к упражнению 1 (e). '
        : 'Импликация ∀x∃yQ → ∃y∀xQ здесь истинна. Чтобы её опровергнуть, нужна синяя клетка в каждой строке и ни одного целиком синего столбца. '),
      swapNote: 'Обе части — «все клетки синие» (или «есть синяя клетка»): порядок одноимённых кванторов не важен, это упражнения 2 (j) и 2 (k). ',
      trYes: 'Предикат транзитивен: из Q(x, y) и Q(y, z) всегда следует Q(x, z). ',
      trNo: (x, y, z) => 'Не транзитивен: Q(' + x + ', ' + y + ') и Q(' + y + ', ' + z + ') истинны, а Q(' + x + ', ' + z + ') ложно — контрпример к упражнению 1 (f). ',
      hint2: 'Строка — x, столбец — y; нажмите на клетку, чтобы поменять значение.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Quantifier laws: checking by brute force on a finite set',
      title2: 'A two-place predicate: order of quantifiers',
      law: 'Equivalence',
      size: 'elements $n$',
      left: 'left side',
      right: 'right side',
      same: 'equal',
      all: 'for all pairs',
      yes: 'T',
      no: 'F',
      eq: 'yes',
      neq: 'no',
      checkAll: 'Check all',
      counter: 'Counterexample',
      clear: 'Clear',
      aria1: 'Values of predicates A(x) and B(x) on elements 1…n',
      aria2: 'Values of predicate Q(x, y): row x, column y',
      cell: (p, x, v) => p + '(' + x + ') = ' + v,
      cell2: (x, y, v) => 'Q(' + x + ', ' + y + ') = ' + v,
      allOk: (k, n) => 'All ' + k + ' pairs of predicates A, B on a set of ' + n + ' elements checked: the sides always agree. The equivalence holds on this set.',
      allBad: (k, bad, n) => 'Of ' + k + ' pairs of predicates A, B on a set of ' + n + ' elements, the sides differ for ' + bad + '. The formulas are not equivalent — “Counterexample” shows one such pair.',
      noCounter: 'No counterexample on this set.',
      hint1: 'Click the cells: blue is T, empty is F.',
      state: (l, r) => 'Left side is ' + l + ', right side is ' + r + '. ',
      quant: 'Formula',
      q: { ae: '∀x∃y → ∃y∀x', swap: '∀x∀y ↔ ∀y∀x', ee: '∃x∃y ↔ ∃y∃x', tr: 'transitivity' },
      pre: { eq: 'x = y', le: 'x ≤ y', ne: 'x ≠ y', full: 'all T' },
      v1: '∀x∃y Q(x, y)',
      v2: '∃y∀x Q(x, y)',
      vimp: 'implication',
      trans: 'transitive',
      aeNote: (a, b) => (a && !b
        ? 'Every row has a blue cell (∀x∃y is T), but no column is entirely blue (∃y∀x is F): the implication is false — a counterexample to exercise 1 (e). '
        : 'The implication ∀x∃yQ → ∃y∀xQ is true here. To refute it, every row needs a blue cell and no column may be entirely blue. '),
      swapNote: 'Both sides say “all cells are blue” (or “some cell is blue”): the order of like quantifiers does not matter, exercises 2 (j) and 2 (k). ',
      trYes: 'The predicate is transitive: Q(x, y) and Q(y, z) always give Q(x, z). ',
      trNo: (x, y, z) => 'Not transitive: Q(' + x + ', ' + y + ') and Q(' + y + ', ' + z + ') are true, but Q(' + x + ', ' + z + ') is false — a counterexample to exercise 1 (f). ',
      hint2: 'Row is x, column is y; click a cell to change its value.',
    },
    uz: {
      fig: (n) => 'Rasm ' + n,
      title1: 'Kvantor qonunlari: chekli to‘plamda saralab tekshirish',
      title2: 'Ikki o‘rinli predikat: kvantorlar tartibi',
      law: 'Teng kuchlilik',
      size: 'elementlar $n$',
      left: 'chap qism',
      right: 'o‘ng qism',
      same: 'teng',
      all: 'barcha juftlarda',
      yes: 'R',
      no: 'Y',
      eq: 'ha',
      neq: 'yo‘q',
      checkAll: 'Hammasini tekshirish',
      counter: 'Kontrmisol',
      clear: 'Tozalash',
      aria1: 'A(x) va B(x) predikatlarining 1…n elementlardagi qiymatlari',
      aria2: 'Q(x, y) predikatining qiymatlari: satr x, ustun y',
      cell: (p, x, v) => p + '(' + x + ') = ' + v,
      cell2: (x, y, v) => 'Q(' + x + ', ' + y + ') = ' + v,
      allOk: (k, n) => n + ' elementli to‘plamda A, B predikatlarning barcha ' + k + ' jufti tekshirildi: qismlar doim teng. Bu to‘plamda teng kuchlilik to‘g‘ri.',
      allBad: (k, bad, n) => n + ' elementli to‘plamda A, B predikatlarning ' + k + ' juftidan ' + bad + ' tasida qismlar farq qiladi. Formulalar teng kuchli emas — «Kontrmisol» shunday juftni ko‘rsatadi.',
      noCounter: 'Bu to‘plamda kontrmisol yo‘q.',
      hint1: 'Kataklarni bosing: ko‘k — R (rost), bo‘sh — Y (yolg‘on).',
      state: (l, r) => 'Chap qism — ' + l + ', o‘ng qism — ' + r + '. ',
      quant: 'Formula',
      q: { ae: '∀x∃y → ∃y∀x', swap: '∀x∀y ↔ ∀y∀x', ee: '∃x∃y ↔ ∃y∃x', tr: 'tranzitivlik' },
      pre: { eq: 'x = y', le: 'x ≤ y', ne: 'x ≠ y', full: 'hammasi R' },
      v1: '∀x∃y Q(x, y)',
      v2: '∃y∀x Q(x, y)',
      vimp: 'implikatsiya',
      trans: 'tranzitiv',
      aeNote: (a, b) => (a && !b
        ? 'Har bir satrda ko‘k katak bor (∀x∃y — R), lekin hech bir ustun to‘liq ko‘k emas (∃y∀x — Y): implikatsiya yolg‘on — 1 (e) mashqqa kontrmisol. '
        : 'Bu yerda ∀x∃yQ → ∃y∀xQ implikatsiya rost. Uni rad etish uchun har satrda ko‘k katak bo‘lishi va hech bir ustun to‘liq ko‘k bo‘lmasligi kerak. '),
      swapNote: 'Ikkala qism ham «barcha kataklar ko‘k» (yoki «ko‘k katak bor»): bir xil kvantorlar tartibi muhim emas, 2 (j) va 2 (k) mashqlar. ',
      trYes: 'Predikat tranzitiv: Q(x, y) va Q(y, z) dan doim Q(x, z) kelib chiqadi. ',
      trNo: (x, y, z) => 'Tranzitiv emas: Q(' + x + ', ' + y + ') va Q(' + y + ', ' + z + ') rost, Q(' + x + ', ' + z + ') esa yolg‘on — 1 (f) mashqqa kontrmisol. ',
      hint2: 'Satr — x, ustun — y; qiymatni almashtirish uchun katakni bosing.',
    },
  });

  /* Равносильности из книги и две неравносильности; A, B — массивы 0/1 длины n. */
  const all = (n, f) => { for (let x = 0; x < n; x++) if (!f(x)) return false; return true; };
  const ex = (n, f) => { for (let x = 0; x < n; x++) if (f(x)) return true; return false; };
  const LAWS = {
    l1: { label: '(1)', tex: '{\\rceil}(\\forall xA(x)) \\equiv \\exists x({\\rceil} A(x))', L: (A, B, n) => !all(n, (x) => A[x]), R: (A, B, n) => ex(n, (x) => !A[x]) },
    l2: { label: '(2)', tex: '{\\rceil}(\\exists xA(x)) \\equiv \\forall x({\\rceil} A(x))', L: (A, B, n) => !ex(n, (x) => A[x]), R: (A, B, n) => all(n, (x) => !A[x]) },
    l5: { label: '(5)', tex: '\\exists xA(x) \\vee \\exists xB(x) \\equiv \\exists x(A(x) \\vee B(x))', L: (A, B, n) => ex(n, (x) => A[x]) || ex(n, (x) => B[x]), R: (A, B, n) => ex(n, (x) => A[x] || B[x]) },
    l6: { label: '(6)', tex: '\\forall xA(x) \\wedge \\forall xB(x) \\equiv \\forall x(A(x) \\wedge B(x))', L: (A, B, n) => all(n, (x) => A[x]) && all(n, (x) => B[x]), R: (A, B, n) => all(n, (x) => A[x] && B[x]) },
    n1: { label: '$\\exists$, $\\wedge$', tex: '\\exists x(A(x) \\wedge B(x)) \\;?\\; \\exists xA(x) \\wedge \\exists xB(x)', L: (A, B, n) => ex(n, (x) => A[x] && B[x]), R: (A, B, n) => ex(n, (x) => A[x]) && ex(n, (x) => B[x]) },
    n2: { label: '$\\forall$, $\\vee$', tex: '\\forall x(A(x) \\vee B(x)) \\;?\\; \\forall xA(x) \\vee \\forall xB(x)', L: (A, B, n) => all(n, (x) => A[x] || B[x]), R: (A, B, n) => all(n, (x) => A[x]) || all(n, (x) => B[x]) },
  };

  /** Перебор всех пар одноместных предикатов на {1…n}: число расхождений и первый контрпример. */
  function scan(law, n) {
    let bad = 0;
    let first = null;
    const total = 1 << (2 * n);
    for (let m = 0; m < total; m++) {
      const A = [];
      const B = [];
      for (let x = 0; x < n; x++) {
        A.push((m >> x) & 1);
        B.push((m >> (n + x)) & 1);
      }
      if (law.L(A, B, n) !== law.R(A, B, n)) {
        bad++;
        if (!first) first = { A, B };
      }
    }
    return { total, bad, first };
  }

  const tv = (b) => (b ? T.yes : T.no);

  MC.widget('quant-laws', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { law: cfg.law || 'n1', n: cfg.n || 3, A: [1, 0, 0, 0, 0], B: [0, 1, 0, 0, 0] };
    const formula = MC.h('div', { class: 'fig-note' });
    fig.plot.before(formula);
    const lawSeg = F.seg(Object.keys(LAWS).map((k) => ({ value: k, label: LAWS[k].label })), st.law, (v) => {
      st.law = v;
      draw();
    }, T.law);
    const nS = F.slider({ label: T.size, min: 1, max: 5, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      draw();
    } });
    const row = MC.h('div', { class: 'row' },
      F.button(null, T.checkAll, () => draw(true)),
      F.button(null, T.counter, () => {
        const r = scan(LAWS[st.law], st.n);
        if (r.first) {
          for (let x = 0; x < st.n; x++) {
            st.A[x] = r.first.A[x];
            st.B[x] = r.first.B[x];
          }
          draw();
        } else draw(false, T.noCounter);
      }),
      F.button(null, T.clear, () => {
        st.A.fill(0);
        st.B.fill(0);
        draw();
      }));
    fig.controls.append(lawSeg.el, nS.el, row);
    const ro = F.readout(fig.readout, [
      { key: 'l', label: T.left },
      { key: 'r', label: T.right },
      { key: 's', label: T.same },
    ]);

    let svg = null;
    function draw(full, extra) {
      const law = LAWS[st.law];
      const n = st.n;
      formula.replaceChildren(F.rich('$' + law.tex + '$'));
      const C = 56;
      const W = C * (n + 1);
      const H = C * 3;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria1 });
      svg.style.maxWidth = Math.max(W, 240) + 'px';
      svg.appendChild(S('text', { class: 'cv corner', x: C / 2, y: C / 2 }, 'x'));
      for (let x = 0; x < n; x++) svg.appendChild(S('text', { class: 'cv ch', x: C * (x + 1) + C / 2, y: C / 2 }, String(x + 1)));
      [['A', st.A], ['B', st.B]].forEach(([p, arr], i) => {
        const y = C * (i + 1);
        svg.appendChild(S('text', { class: 'cv ch', x: C / 2, y: y + C / 2 }, p + '(x)'));
        for (let x = 0; x < n; x++) {
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cell(p, x + 1, tv(arr[x])) });
          const r = S('rect', { class: 'cell', x: C * (x + 1) + 3, y: y + 3, width: C - 6, height: C - 6, rx: 4 });
          if (arr[x]) r.style.fill = 'var(--accent-soft)';
          g.appendChild(r);
          const t = S('text', { class: 'cv', x: C * (x + 1) + C / 2, y: y + C / 2 }, tv(arr[x]));
          if (arr[x]) t.style.fill = 'var(--accent)';
          g.appendChild(t);
          const flip = () => {
            arr[x] = arr[x] ? 0 : 1;
            draw();
          };
          g.addEventListener('click', flip);
          g.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              flip();
            }
          });
          svg.appendChild(g);
        }
      });
      fig.plot.appendChild(svg);
      const l = law.L(st.A, st.B, n);
      const r = law.R(st.A, st.B, n);
      ro.set('l', tv(l), l ? 'accent' : '');
      ro.set('r', tv(r), r ? 'accent' : '');
      ro.set('s', l === r ? T.eq : T.neq, l === r ? 'accent' : 'warm');
      let s = T.state(tv(l), tv(r));
      if (full) {
        const res = scan(law, n);
        s += res.bad ? T.allBad(res.total, res.bad, n) : T.allOk(res.total, n);
      } else s += extra || T.hint1;
      fig.note.textContent = s;
    }
    draw();
  });

  /* ---------- Рисунок 2: двухместный предикат Q(x, y) на {1…n}. ---------- */
  const PRE = {
    eq: (x, y) => x === y,
    le: (x, y) => x <= y,
    ne: (x, y) => x !== y,
    full: () => true,
  };

  function analyse2(Q, n) {
    const ae = all(n, (x) => ex(n, (y) => Q[x][y]));
    const ea = ex(n, (y) => all(n, (x) => Q[x][y]));
    let tr = null;
    for (let x = 0; x < n && !tr; x++)
      for (let y = 0; y < n && !tr; y++)
        for (let z = 0; z < n && !tr; z++) if (Q[x][y] && Q[y][z] && !Q[x][z]) tr = [x + 1, y + 1, z + 1];
    return { ae, ea, imp: !ae || ea, tr };
  }

  MC.widget('pred-grid', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { n: cfg.n || 3, mode: cfg.mode || 'ae', Q: [] };
    const fill = (f) => {
      st.Q = [];
      for (let x = 0; x < 4; x++) {
        st.Q.push([]);
        for (let y = 0; y < 4; y++) st.Q[x].push(f(x, y) ? 1 : 0);
      }
    };
    fill(PRE[cfg.preset || 'eq']);
    const modeSeg = F.seg(Object.keys(T.q).map((k) => ({ value: k, label: T.q[k] })), st.mode, (v) => {
      st.mode = v;
      draw();
    }, T.quant);
    const nS = F.slider({ label: T.size, min: 2, max: 4, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      draw();
    } });
    const row = MC.h('div', { class: 'row' }, ...Object.keys(PRE).map((k) => F.button(null, T.pre[k], () => {
      fill(PRE[k]);
      draw();
    })));
    fig.controls.append(modeSeg.el, nS.el, row);
    const ro = F.readout(fig.readout, [
      { key: 'ae', label: T.v1 },
      { key: 'ea', label: T.v2 },
      { key: 'imp', label: T.vimp },
      { key: 'tr', label: T.trans },
    ]);

    let svg = null;
    function draw() {
      const n = st.n;
      const C = 56;
      const W = C * (n + 1);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + W + ' ' + W, role: 'img', 'aria-label': T.aria2 });
      svg.style.maxWidth = Math.max(W, 240) + 'px';
      svg.appendChild(S('text', { class: 'cv corner', x: C / 2, y: C / 2 }, 'Q'));
      for (let i = 0; i < n; i++) {
        svg.appendChild(S('text', { class: 'cv ch', x: C * (i + 1) + C / 2, y: C / 2 }, String(i + 1)));
        svg.appendChild(S('text', { class: 'cv ch', x: C / 2, y: C * (i + 1) + C / 2 }, String(i + 1)));
      }
      for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
          const v = st.Q[x][y];
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cell2(x + 1, y + 1, tv(v)) });
          const r = S('rect', { class: 'cell', x: C * (y + 1) + 3, y: C * (x + 1) + 3, width: C - 6, height: C - 6, rx: 4 });
          if (v) r.style.fill = 'var(--accent-soft)';
          g.appendChild(r);
          const t = S('text', { class: 'cv', x: C * (y + 1) + C / 2, y: C * (x + 1) + C / 2 }, tv(v));
          if (v) t.style.fill = 'var(--accent)';
          g.appendChild(t);
          const flip = () => {
            st.Q[x][y] = v ? 0 : 1;
            draw();
          };
          g.addEventListener('click', flip);
          g.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              flip();
            }
          });
          svg.appendChild(g);
        }
      }
      fig.plot.appendChild(svg);
      const a = analyse2(st.Q, n);
      ro.set('ae', tv(a.ae), a.ae ? 'accent' : '');
      ro.set('ea', tv(a.ea), a.ea ? 'accent' : '');
      ro.set('imp', tv(a.imp), a.imp ? 'accent' : 'warm');
      ro.set('tr', a.tr ? T.neq : T.eq, a.tr ? 'warm' : 'accent');
      let s = '';
      if (st.mode === 'ae') s = T.aeNote(a.ae, a.ea);
      else if (st.mode === 'tr') s = a.tr ? T.trNo(...a.tr) : T.trYes;
      else s = T.swapNote;
      fig.note.textContent = s + T.hint2;
    }
    draw();
  });

  if (typeof module !== 'undefined') module.exports = { LAWS, scan, analyse2 };
})();
