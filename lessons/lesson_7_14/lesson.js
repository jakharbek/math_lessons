/* Урок 7.14 «Предикаты» (Куликов, гл. 1, § 3): два рисунка.
 * Рисунок 1 — операции над предикатами: P(x) ∘ Q(y) (двухместный, таблица наборов) и P(x) ∘ Q(x) (одноместный).
 * Рисунок 2 — логическое следствие и равносильность одноместных предикатов перебором по конечной области. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;
  const H = MC.h;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Операции над предикатами: $P(x) \\circ Q(y)$ и $P(x) \\circ Q(x)$',
      title2: 'Логическое следствие и равносильность: перебор по области',
      opLabel: 'операция',
      modeLabel: 'переменные',
      mode2: 'разные: $x$ и $y$',
      mode1: 'одна: $x$',
      T: 'И',
      F: 'Л',
      sets: 'наборов',
      trueSets: 'значение И',
      kind: 'вид предиката',
      kTrue: 'тождественно истинный',
      kSat: 'выполнимый',
      kFalse: 'тождественно ложный',
      yes: 'да',
      no: 'нет',
      aria1: 'Таблица истинностных значений предиката',
      cellAria: (s) => 'Набор ' + s,
      p: {
        prime: '$x$ — простое',
        even: '$x$ — четное',
        lt5: '$x < 5$',
        div3: '$x$ кратно 3',
      },
      plain: { prime: 'простое', even: 'четное', lt5: 'меньше 5', div3: 'кратно 3' },
      intro1two: (n) => 'Двухместный предикат от $x$ и $y$: в $x$ и $y$ подставляют значения независимо, наборов $(a; b)$ — ' + n + '. ',
      intro1one: (n) => 'Одноместный предикат от $x$: в оба предиката подставляют одно и то же число, наборов — ' + n + '. ',
      count: (k, n) => 'Значение И — на ' + k + ' из ' + n + '. ',
      hint1: 'Нажмите на клетку — разберу набор.',
      cell2: (a, b, pa, qb, op, r) => 'Набор $(' + a + '; ' + b + ')$: $P(' + a + ')$ — ' + pa + ', $Q(' + b + ')$ — ' + qb + ', значит, ' + op + ' — ' + r + '. ',
      cell1: (a, pa, qa, op, r) => 'Значение $x = ' + a + '$: $P(' + a + ')$ — ' + pa + ', $Q(' + a + ')$ — ' + qa + ', значит, ' + op + ' — ' + r + '. ',
      domain1: 'Область допустимых значений: натуральные числа от 0 до 9.',
      aLabel: '$A(x)$',
      bLabel: '$B(x)$',
      ab: '$A \\models B$',
      ba: '$B \\models A$',
      eqv: '$A \\equiv B$',
      kindA: 'вид $A$',
      kindB: 'вид $B$',
      q: {
        even: '$2 \\mid x$',
        m4: '$4 \\mid x$',
        m3: '$3 \\mid x$',
        m6: '$6 \\mid x$',
        pos: '$x > 0$',
        sq: '$x^2 > 0$',
        quad: '$x^2 - 5x + 6 = 0$',
        never: '$x + 1 = x$',
        always: '$x^2 \\geqslant 0$',
      },
      entOk: (a, b) => b + ' — логическое следствие ' + a + ': каждое $x$, где ' + a + ' истинно, удовлетворяет и ' + b + '. ',
      entNo: (a, b, x) => b + ' не следует из ' + a + ': при $x = ' + x + '$ предикат ' + a + ' истинен, а ' + b + ' ложен. ',
      eqOk: 'Предикаты равносильны: значения совпадают на всех наборах. ',
      eqNo: 'Предикаты не равносильны. ',
      domain2: 'Область — целые числа от −12 до 12. Для этих предикатов ответы те же, что и на всём $\\mathbf{Z}$: контрпримеры, если они есть на $\\mathbf{Z}$, есть и здесь.',
      rowX: 'x',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Operations on predicates: $P(x) \\circ Q(y)$ and $P(x) \\circ Q(x)$',
      title2: 'Logical consequence and equivalence: checking every value',
      opLabel: 'operation',
      modeLabel: 'variables',
      mode2: 'different: $x$ and $y$',
      mode1: 'one: $x$',
      T: 'T',
      F: 'F',
      sets: 'tuples',
      trueSets: 'value T',
      kind: 'kind of predicate',
      kTrue: 'identically true',
      kSat: 'satisfiable',
      kFalse: 'identically false',
      yes: 'yes',
      no: 'no',
      aria1: 'Truth table of the predicate',
      cellAria: (s) => 'Tuple ' + s,
      p: { prime: '$x$ is prime', even: '$x$ is even', lt5: '$x < 5$', div3: '$x$ is a multiple of 3' },
      plain: { prime: 'prime', even: 'even', lt5: 'less than 5', div3: 'multiple of 3' },
      intro1two: (n) => 'A two-place predicate in $x$ and $y$: values are substituted for $x$ and $y$ independently; there are ' + n + ' tuples $(a, b)$. ',
      intro1one: (n) => 'A one-place predicate in $x$: the same number is substituted into both predicates; there are ' + n + ' values. ',
      count: (k, n) => 'Value T on ' + k + ' of ' + n + '. ',
      hint1: 'Click a cell to see that tuple explained.',
      cell2: (a, b, pa, qb, op, r) => 'Tuple $(' + a + ', ' + b + ')$: $P(' + a + ')$ is ' + pa + ', $Q(' + b + ')$ is ' + qb + ', so ' + op + ' is ' + r + '. ',
      cell1: (a, pa, qa, op, r) => 'Value $x = ' + a + '$: $P(' + a + ')$ is ' + pa + ', $Q(' + a + ')$ is ' + qa + ', so ' + op + ' is ' + r + '. ',
      domain1: 'Domain: natural numbers from 0 to 9.',
      aLabel: '$A(x)$',
      bLabel: '$B(x)$',
      ab: '$A \\models B$',
      ba: '$B \\models A$',
      eqv: '$A \\equiv B$',
      kindA: 'kind of $A$',
      kindB: 'kind of $B$',
      q: {
        even: '$2 \\mid x$', m4: '$4 \\mid x$', m3: '$3 \\mid x$', m6: '$6 \\mid x$', pos: '$x > 0$', sq: '$x^2 > 0$',
        quad: '$x^2 - 5x + 6 = 0$', never: '$x + 1 = x$', always: '$x^2 \\geqslant 0$',
      },
      entOk: (a, b) => b + ' is a logical consequence of ' + a + ': every $x$ satisfying ' + a + ' also satisfies ' + b + '. ',
      entNo: (a, b, x) => b + ' does not follow from ' + a + ': at $x = ' + x + '$ the predicate ' + a + ' is true and ' + b + ' is false. ',
      eqOk: 'The predicates are equivalent: their values agree on every tuple. ',
      eqNo: 'The predicates are not equivalent. ',
      domain2: 'Domain: integers from −12 to 12. For these predicates the answers are the same as on all of $\\mathbf{Z}$: every counterexample on $\\mathbf{Z}$ has a twin here.',
      rowX: 'x',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: 'Predikatlar ustida amallar: $P(x) \\circ Q(y)$ va $P(x) \\circ Q(x)$',
      title2: 'Mantiqiy natija va teng kuchlilik: sohani to‘liq tekshirish',
      opLabel: 'amal',
      modeLabel: 'o‘zgaruvchilar',
      mode2: 'har xil: $x$ va $y$',
      mode1: 'bitta: $x$',
      T: 'R',
      F: 'Y',
      sets: 'to‘plamlar',
      trueSets: 'qiymati R',
      kind: 'predikat turi',
      kTrue: 'aynan rost',
      kSat: 'bajariladigan',
      kFalse: 'aynan yolg‘on',
      yes: 'ha',
      no: 'yo‘q',
      aria1: 'Predikatning rostlik jadvali',
      cellAria: (s) => 'To‘plam ' + s,
      p: { prime: '$x$ — tub', even: '$x$ — juft', lt5: '$x < 5$', div3: '$x$ 3 ga karrali' },
      plain: { prime: 'tub', even: 'juft', lt5: '5 dan kichik', div3: '3 ga karrali' },
      intro1two: (n) => '$x$ va $y$ dan ikki o‘rinli predikat: $x$ va $y$ o‘rniga qiymatlar mustaqil qo‘yiladi, $(a; b)$ to‘plamlar soni — ' + n + '. ',
      intro1one: (n) => '$x$ dan bir o‘rinli predikat: ikkala predikatga bir xil son qo‘yiladi, qiymatlar soni — ' + n + '. ',
      count: (k, n) => 'Qiymati R — ' + n + ' tadan ' + k + ' tasida. ',
      hint1: 'Katakni bosing — to‘plamni tahlil qilaman.',
      cell2: (a, b, pa, qb, op, r) => '$(' + a + '; ' + b + ')$ to‘plam: $P(' + a + ')$ — ' + pa + ', $Q(' + b + ')$ — ' + qb + ', demak, ' + op + ' — ' + r + '. ',
      cell1: (a, pa, qa, op, r) => '$x = ' + a + '$: $P(' + a + ')$ — ' + pa + ', $Q(' + a + ')$ — ' + qa + ', demak, ' + op + ' — ' + r + '. ',
      domain1: 'Joiz qiymatlar sohasi: 0 dan 9 gacha natural sonlar.',
      aLabel: '$A(x)$',
      bLabel: '$B(x)$',
      ab: '$A \\models B$',
      ba: '$B \\models A$',
      eqv: '$A \\equiv B$',
      kindA: '$A$ turi',
      kindB: '$B$ turi',
      q: {
        even: '$2 \\mid x$', m4: '$4 \\mid x$', m3: '$3 \\mid x$', m6: '$6 \\mid x$', pos: '$x > 0$', sq: '$x^2 > 0$',
        quad: '$x^2 - 5x + 6 = 0$', never: '$x + 1 = x$', always: '$x^2 \\geqslant 0$',
      },
      entOk: (a, b) => b + ' — ' + a + ' ning mantiqiy natijasi: ' + a + ' rost bo‘lgan har bir $x$ ' + b + ' ni ham qanoatlantiradi. ',
      entNo: (a, b, x) => b + ' predikat ' + a + ' dan kelib chiqmaydi: $x = ' + x + '$ da ' + a + ' rost, ' + b + ' esa yolg‘on. ',
      eqOk: 'Predikatlar teng kuchli: qiymatlari barcha to‘plamlarda bir xil. ',
      eqNo: 'Predikatlar teng kuchli emas. ',
      domain2: 'Soha — −12 dan 12 gacha butun sonlar. Bu predikatlar uchun javoblar butun $\\mathbf{Z}$ dagidek: $\\mathbf{Z}$ dagi har bir kontrmisolning bu yerda ham o‘xshashi bor.',
      rowX: 'x',
    },
  });

  /* ---------- предикаты и операции (без DOM: проверяются в node) ---------- */
  const isPrime = (n) => {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  };
  const mod = (a, n) => ((a % n) + n) % n;
  const P1 = {
    prime: isPrime,
    even: (x) => mod(x, 2) === 0,
    lt5: (x) => x < 5,
    div3: (x) => mod(x, 3) === 0,
  };
  const OPS = {
    and: { label: '$\\wedge$', f: (p, q) => p && q, tex: (a, b) => a + ' \\wedge ' + b },
    or: { label: '$\\vee$', f: (p, q) => p || q, tex: (a, b) => a + ' \\vee ' + b },
    imp: { label: '$\\to$', f: (p, q) => !p || q, tex: (a, b) => a + ' \\to ' + b },
    eqv: { label: '$\\leftrightarrow$', f: (p, q) => p === q, tex: (a, b) => a + ' \\leftrightarrow ' + b },
    not: { label: '$\\rceil P$', f: (p) => !p, tex: (a) => '\\rceil ' + a },
  };
  const Q2 = {
    even: (x) => mod(x, 2) === 0,
    m4: (x) => mod(x, 4) === 0,
    m3: (x) => mod(x, 3) === 0,
    m6: (x) => mod(x, 6) === 0,
    pos: (x) => x > 0,
    sq: (x) => x * x > 0,
    quad: (x) => x * x - 5 * x + 6 === 0,
    never: (x) => x + 1 === x,
    always: (x) => x * x >= 0,
  };
  const D1 = [...Array(10).keys()];
  const D2 = [];
  for (let x = -12; x <= 12; x++) D2.push(x);

  /** Вид предиката по списку его значений: 'true' | 'sat' | 'false'. */
  const kindOf = (vals) => (vals.every(Boolean) ? 'true' : vals.some(Boolean) ? 'sat' : 'false');
  /** Первый x, где A истинно, а B ложно (контрпример к A ⊨ B), или null. */
  const counter = (A, B, dom) => {
    const x = dom.find((v) => A(v) && !B(v));
    return x === undefined ? null : x;
  };

  const num = (x) => (x < 0 ? '−' + -x : String(x));
  const TF = (b) => (b ? T.T : T.F);

  /** Рисует строки-таблицы: rows [{label, vals[], cls?}] над значениями dom; блоки по k столбцов, чтобы читалось на телефоне. */
  function rowTable(dom, rows, width, opts = {}) {
    const LW = opts.labelW || 92;
    const minC = 26;
    const maxC = 40;
    const fit = Math.max(5, Math.min(dom.length, Math.floor((width - LW) / minC)));
    const blocks = Math.ceil(dom.length / fit);
    const per = Math.ceil(dom.length / blocks); // поровну по блокам, без «хвоста» из одного столбца
    const C = Math.min(maxC, Math.floor((width - LW) / Math.min(per, dom.length)));
    const RH = 30;
    const gap = 14;
    const blockH = RH * (rows.length + 1);
    const W = LW + C * Math.min(per, dom.length);
    const Hh = blocks * blockH + (blocks - 1) * gap;
    const svg = S('svg', { class: 'pl pred-rows', viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': opts.aria || '' });
    svg.style.maxWidth = W + 'px';
    for (let b = 0; b < blocks; b++) {
      const y0 = b * (blockH + gap);
      const part = dom.slice(b * per, (b + 1) * per);
      svg.appendChild(S('text', { class: 'cv ch', x: 6, y: y0 + RH / 2, style: 'text-anchor: start; font-size: 14px; font-style: italic' }, T.rowX));
      part.forEach((v, j) => svg.appendChild(S('text', { class: 'cv ch', x: LW + C * j + C / 2, y: y0 + RH / 2, style: 'font-size: 13px' }, num(v))));
      rows.forEach((r, i) => {
        const y = y0 + RH * (i + 1);
        svg.appendChild(S('text', { class: 'cv', x: 6, y: y + RH / 2, style: 'text-anchor: start; font-size: 14px' }, r.label));
        part.forEach((v, j) => {
          const k = b * per + j;
          const on = r.vals[k];
          const rect = S('rect', { class: 'cell', x: LW + C * j + 1.5, y: y + 1.5, width: C - 3, height: RH - 3, rx: 3 });
          if (on) rect.style.fill = r.warm ? 'var(--warm-soft)' : 'var(--accent-soft)';
          if (r.bad && r.bad[k]) rect.classList.add('bad');
          svg.appendChild(rect);
          const t = S('text', { class: 'cv', x: LW + C * j + C / 2, y: y + RH / 2, style: 'font-size: 14px' }, TF(on));
          if (on) t.style.fill = r.warm ? 'var(--warm)' : 'var(--accent)';
          else t.style.fill = 'var(--fg4)';
          svg.appendChild(t);
        });
      });
    }
    return svg;
  }

  function labeled(label, el) {
    return H('div', { class: 'row' }, H('span', null, F.rich(label)), el);
  }

  /* ---------- Рисунок 1: операции над предикатами ---------- */
  MC.widget('pred-ops', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { p: cfg.p || 'prime', q: cfg.q || 'even', op: cfg.op || 'and', mode: cfg.mode || 'two', sel: null };
    const keys = Object.keys(P1);
    const pSeg = F.seg(keys.map((k) => ({ value: k, label: T.p[k] })), st.p, (v) => { st.p = v; st.sel = null; draw(); }, 'P(x)');
    const opSeg = F.seg(Object.keys(OPS).map((k) => ({ value: k, label: OPS[k].label })), st.op, (v) => { st.op = v; st.sel = null; draw(); }, T.opLabel);
    const mSeg = F.seg([{ value: 'two', label: T.mode2 }, { value: 'one', label: T.mode1 }], st.mode, (v) => { st.mode = v; st.sel = null; rebuildQ(); draw(); }, T.modeLabel);
    const qWrap = H('div', { class: 'row' });
    function rebuildQ() {
      const v = st.mode === 'two' ? 'y' : 'x';
      const s = F.seg(keys.map((k) => ({ value: k, label: T.p[k].replace(/\$x/g, '$' + v) })), st.q, (val) => { st.q = val; st.sel = null; draw(); }, 'Q');
      qWrap.replaceChildren(H('span', null, F.rich('$Q(' + v + ')$:')), s.el);
    }
    rebuildQ();
    fig.controls.append(labeled('$P(x)$:', pSeg.el), qWrap, labeled(T.opLabel + ':', opSeg.el), labeled(T.modeLabel + ':', mSeg.el));
    const ro = F.readout(fig.readout, [
      { key: 'n', label: T.sets },
      { key: 'k', label: T.trueSets },
      { key: 'kind', label: T.kind },
    ]);
    let svg = null;

    const opTex = (a, b) => OPS[st.op].tex('P(' + a + ')', 'Q(' + b + ')');

    function draw() {
      const P = P1[st.p];
      const Q = P1[st.q];
      const f = OPS[st.op].f;
      if (svg) svg.remove();
      const width = Math.max(300, Math.min(720, fig.plot.clientWidth || 600));
      let vals;
      if (st.mode === 'two') {
        const N = D1.length;
        const C = 40;
        const size = C * (N + 1);
        svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.aria1 });
        svg.style.maxWidth = size + 'px';
        svg.appendChild(S('text', { class: 'cv corner', x: C / 2, y: C / 2, style: 'font-size: 13px' }, 'x\\y'));
        vals = [];
        D1.forEach((a, i) => {
          const hy = S('text', { class: 'cv ch', x: C * (i + 1) + C / 2, y: C / 2 }, String(a));
          if (Q(a)) hy.style.fill = 'var(--warm)';
          svg.appendChild(hy);
          const hx = S('text', { class: 'cv ch', x: C / 2, y: C * (i + 1) + C / 2 }, String(a));
          if (P(a)) hx.style.fill = 'var(--warm)';
          svg.appendChild(hx);
        });
        D1.forEach((a, i) => D1.forEach((b, j) => {
          const r = st.op === 'not' ? f(P(a)) : f(P(a), Q(b));
          vals.push(r);
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria('(' + a + '; ' + b + ')') });
          const on = st.sel && st.sel[0] === a && st.sel[1] === b;
          const rect = S('rect', { class: 'cell' + (on ? ' on' : ''), x: C * (j + 1) + 2, y: C * (i + 1) + 2, width: C - 4, height: C - 4, rx: 4 });
          if (r) rect.style.fill = 'var(--accent-soft)';
          g.appendChild(rect);
          const t = S('text', { class: 'cv', x: C * (j + 1) + C / 2, y: C * (i + 1) + C / 2, style: 'font-size: 15px' }, TF(r));
          t.style.fill = r ? 'var(--accent)' : 'var(--fg4)';
          g.appendChild(t);
          const pick = () => { st.sel = [a, b]; draw(); };
          g.addEventListener('click', pick);
          g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
          svg.appendChild(g);
        }));
      } else {
        vals = D1.map((a) => (st.op === 'not' ? f(P(a)) : f(P(a), Q(a))));
        const rows = [
          { label: 'P(x)', vals: D1.map(P), warm: true },
          { label: 'Q(x)', vals: D1.map(Q), warm: true },
          { label: st.op === 'not' ? '⌉P(x)' : 'P ' + { and: '∧', or: '∨', imp: '→', eqv: '↔' }[st.op] + ' Q', vals },
        ];
        svg = rowTable(D1, rows, width, { aria: T.aria1, labelW: 70 });
      }
      fig.plot.appendChild(svg);
      const k = vals.filter(Boolean).length;
      const kind = kindOf(vals);
      ro.set('n', String(vals.length));
      ro.set('k', String(k), k ? 'accent' : 'warm');
      ro.set('kind', kind === 'true' ? T.kTrue : kind === 'sat' ? T.kSat : T.kFalse, kind === 'false' ? 'warm' : 'accent');
      let s = (st.mode === 'two' ? T.intro1two(vals.length) : T.intro1one(vals.length)) + T.count(k, vals.length);
      if (st.mode === 'two' && st.sel) {
        const [a, b] = st.sel;
        const r = st.op === 'not' ? f(P(a)) : f(P(a), Q(b));
        s += T.cell2(a, b, TF(P(a)), TF(Q(b)), '$' + opTex(a, b) + '$', TF(r));
      } else if (st.mode === 'two') s += T.hint1 + ' ';
      s += T.domain1;
      fig.note.replaceChildren(F.rich(s));
    }
    let tm = null;
    window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(draw, 150); });
    draw();
  });

  /* ---------- Рисунок 2: следствие и равносильность ---------- */
  MC.widget('pred-entail', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { a: cfg.a || 'm4', b: cfg.b || 'even' };
    const keys = Object.keys(Q2);
    const aSeg = F.seg(keys.map((k) => ({ value: k, label: T.q[k] })), st.a, (v) => { st.a = v; draw(); }, 'A(x)');
    const bSeg = F.seg(keys.map((k) => ({ value: k, label: T.q[k] })), st.b, (v) => { st.b = v; draw(); }, 'B(x)');
    fig.controls.append(labeled(T.aLabel + ':', aSeg.el), labeled(T.bLabel + ':', bSeg.el));
    const ro = F.readout(fig.readout, [
      { key: 'ab', label: T.ab },
      { key: 'ba', label: T.ba },
      { key: 'eq', label: T.eqv },
      { key: 'ka', label: T.kindA },
      { key: 'kb', label: T.kindB },
    ]);
    let svg = null;
    const kindName = (k) => (k === 'true' ? T.kTrue : k === 'sat' ? T.kSat : T.kFalse);

    function draw() {
      const A = Q2[st.a];
      const B = Q2[st.b];
      const av = D2.map(A);
      const bv = D2.map(B);
      const imp1 = D2.map((x) => !A(x) || B(x));
      const imp2 = D2.map((x) => !B(x) || A(x));
      const eq = D2.map((x) => A(x) === B(x));
      if (svg) svg.remove();
      const width = Math.max(300, Math.min(720, fig.plot.clientWidth || 600));
      svg = rowTable(D2, [
        { label: 'A(x)', vals: av, warm: true },
        { label: 'B(x)', vals: bv, warm: true },
        { label: 'A → B', vals: imp1, bad: imp1.map((v) => !v) },
        { label: 'B → A', vals: imp2, bad: imp2.map((v) => !v) },
        { label: 'A ↔ B', vals: eq, bad: eq.map((v) => !v) },
      ], width, { aria: T.aria1 });
      fig.plot.appendChild(svg);
      const c1 = counter(A, B, D2);
      const c2 = counter(B, A, D2);
      ro.set('ab', c1 === null ? T.yes : T.no, c1 === null ? 'accent' : 'warm');
      ro.set('ba', c2 === null ? T.yes : T.no, c2 === null ? 'accent' : 'warm');
      ro.set('eq', c1 === null && c2 === null ? T.yes : T.no, c1 === null && c2 === null ? 'accent' : 'warm');
      ro.set('ka', kindName(kindOf(av)));
      ro.set('kb', kindName(kindOf(bv)));
      const an = '$A(x)$';
      const bn = '$B(x)$';
      let s = (c1 === null ? T.entOk(an, bn) : T.entNo(an, bn, num(c1))) + (c2 === null ? T.entOk(bn, an) : T.entNo(bn, an, num(c2)));
      s += (c1 === null && c2 === null ? T.eqOk : T.eqNo) + T.domain2;
      fig.note.replaceChildren(F.rich(s));
    }
    let tm = null;
    window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(draw, 150); });
    draw();
  });

  /* Для проверок в node. */
  if (typeof module !== 'undefined') module.exports = { P1, Q2, OPS, D1, D2, kindOf, counter, isPrime };
})();
