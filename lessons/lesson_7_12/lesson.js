/* Урок 7.12 «Логика высказываний»: рисунок «Истинностная таблица» — разбор формулы по соглашениям
 * Куликова (гл. 1, § 1: старшинство ↔, →, ∨, ∧, ⌉; восстановление скобок слева направо), столбцы
 * подформул, вывод «тавтология / противоречие / ни то ни другое». */
(function () {
  'use strict';
  const H = typeof MC !== 'undefined' ? MC.h : null;

  const T = typeof MC === 'undefined' ? null : MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title: 'Истинностная таблица формулы',
      input: 'Формула',
      ops: 'Операция',
      group: 'Группа законов',
      law: 'Закон',
      groups: { imp: 'Импликации', eqv: 'Эквиваленции', via: 'Через другие' },
      tv: ['Л', 'И'],
      atoms: 'атомов',
      rows: 'строк',
      kind: 'вид',
      taut: 'тавтология',
      contr: 'противоречие',
      neither: 'нейтральная',
      full: 'Со всеми скобками: ',
      noteTaut: (n) => ' — во всех ' + n + ' строках последнего столбца И: тавтология.',
      noteContr: (n) => ' — во всех ' + n + ' строках последнего столбца Л: противоречие.',
      noteNeither: (t, f, row) => ' — строк с И: ' + t + ', с Л: ' + f + '; например, ложна при ' + row + '.',
      err: 'Не формула: ',
      errs: { end: 'неожиданный конец', paren: 'не хватает закрывающей скобки', tok: (c) => 'лишний символ «' + c + '»', empty: 'пустая строка', many: 'больше 6 атомов — таблица слишком длинная' },
      tableAria: 'Истинностная таблица',
      treeAria: 'Дерево построения формулы',
      rowHint: ' Нажмите на строку таблицы — дерево построения покажет, как вычисляется значение.',
      rowNo: (k) => 'Строка ' + k + ': ',
      laws: {
        mp: 'закон заключения', ce1: 'удаление конъюнкции (1)', ce2: 'удаление конъюнкции (2)', di1: 'введение дизъюнкции (1)', di2: 'введение дизъюнкции (2)', de: 'удаление дизъюнкции', dni: 'введение двойного отрицания', dne: 'удаление двойного отрицания', ei: 'введение эквиваленции', ee1: 'удаление эквиваленции (1)', ee2: 'удаление эквиваленции (2)', cp: 'контрапозиция', abs: 'доказательство от противного', syl: 'силлогизм', add: 'сложение посылок', mul: 'умножение заключений', tre: 'транзитивность эквиваленции',
        id: 'тождество', ica: 'идемпотентность ∧', ido: 'идемпотентность ∨', cca: 'коммутативность ∧', cdo: 'коммутативность ∨', aca: 'ассоциативность ∧', ado: 'ассоциативность ∨', dca: 'дистрибутивность ∧ относительно ∨', ddo: 'дистрибутивность ∨ относительно ∧', dn: 'двойное отрицание', ceq: 'коммутативность ↔', cpe: 'контрапозиция', ndo: 'отрицание дизъюнкции', nca: 'отрицание конъюнкции', opp: 'противоположность', perm: 'перестановка посылок',
        v1: '→ через ⌉, ∨', v2: '→ через ⌉, ∧', v3: '∨ через ⌉, →', v4: '∨ через ⌉, ∧', v5: '∧ через ⌉, →', v6: '∧ через ⌉, ∨', v7: '↔ через →, ∧',
      },
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title: 'Truth table of a formula',
      input: 'Formula',
      ops: 'Operation',
      group: 'Group of laws',
      law: 'Law',
      groups: { imp: 'Implications', eqv: 'Equivalences', via: 'Via others' },
      tv: ['F', 'T'],
      atoms: 'atoms',
      rows: 'rows',
      kind: 'kind',
      taut: 'tautology',
      contr: 'contradiction',
      neither: 'contingent',
      full: 'Fully bracketed: ',
      noteTaut: (n) => ' — T in all ' + n + ' rows of the last column: a tautology.',
      noteContr: (n) => ' — F in all ' + n + ' rows of the last column: a contradiction.',
      noteNeither: (t, f, row) => ' — rows with T: ' + t + ', with F: ' + f + '; for example, false at ' + row + '.',
      err: 'Not a formula: ',
      errs: { end: 'unexpected end', paren: 'a closing bracket is missing', tok: (c) => 'unexpected symbol “' + c + '”', empty: 'empty input', many: 'more than 6 atoms — the table is too long' },
      tableAria: 'Truth table',
      treeAria: 'Construction tree of the formula',
      rowHint: ' Click a table row — the construction tree shows how the value is computed.',
      rowNo: (k) => 'Row ' + k + ': ',
      laws: {
        mp: 'modus ponens', ce1: 'conjunction elimination (1)', ce2: 'conjunction elimination (2)', di1: 'disjunction introduction (1)', di2: 'disjunction introduction (2)', de: 'disjunction elimination', dni: 'double negation introduction', dne: 'double negation elimination', ei: 'equivalence introduction', ee1: 'equivalence elimination (1)', ee2: 'equivalence elimination (2)', cp: 'contraposition', abs: 'proof by contradiction', syl: 'syllogism', add: 'adding premises', mul: 'multiplying conclusions', tre: 'transitivity of equivalence',
        id: 'identity', ica: 'idempotence of ∧', ido: 'idempotence of ∨', cca: 'commutativity of ∧', cdo: 'commutativity of ∨', aca: 'associativity of ∧', ado: 'associativity of ∨', dca: '∧ distributes over ∨', ddo: '∨ distributes over ∧', dn: 'double negation', ceq: 'commutativity of ↔', cpe: 'contraposition', ndo: 'negation of disjunction', nca: 'negation of conjunction', opp: 'opposition', perm: 'exchange of premises',
        v1: '→ via ⌉, ∨', v2: '→ via ⌉, ∧', v3: '∨ via ⌉, →', v4: '∨ via ⌉, ∧', v5: '∧ via ⌉, →', v6: '∧ via ⌉, ∨', v7: '↔ via →, ∧',
      },
    },
    uz: {
      fig: (n) => (n + '-rasm'),
      title: 'Formulaning rostlik jadvali',
      input: 'Formula',
      ops: 'Amal',
      group: 'Qonunlar guruhi',
      law: 'Qonun',
      groups: { imp: 'Implikatsiyalar', eqv: 'Ekvivalensiyalar', via: 'Boshqalar orqali' },
      tv: ['Yo', 'R'],
      atoms: 'atomlar',
      rows: 'satrlar',
      kind: 'turi',
      taut: 'tavtologiya',
      contr: 'ziddiyat',
      neither: 'neytral',
      full: 'Barcha qavslar bilan: ',
      noteTaut: (n) => ' — oxirgi ustunning barcha ' + n + ' satrida R: tavtologiya.',
      noteContr: (n) => ' — oxirgi ustunning barcha ' + n + ' satrida Yo: ziddiyat.',
      noteNeither: (t, f, row) => ' — R satrlar: ' + t + ', Yo satrlar: ' + f + '; masalan, ' + row + ' bo‘lganda yolg‘on.',
      err: 'Formula emas: ',
      errs: { end: 'kutilmagan oxir', paren: 'yopuvchi qavs yetishmaydi', tok: (c) => 'ortiqcha belgi «' + c + '»', empty: 'bo‘sh satr', many: '6 tadan ortiq atom — jadval juda uzun' },
      tableAria: 'Rostlik jadvali',
      treeAria: 'Formulaning qurilish daraxti',
      rowHint: ' Jadval satrini bosing — qurilish daraxti qiymat qanday hisoblanishini ko‘rsatadi.',
      rowNo: (k) => k + '-satr: ',
      laws: {
        mp: 'xulosa qonuni', ce1: 'kon’yunksiyani olib tashlash (1)', ce2: 'kon’yunksiyani olib tashlash (2)', di1: 'diz’yunksiyani kiritish (1)', di2: 'diz’yunksiyani kiritish (2)', de: 'diz’yunksiyani olib tashlash', dni: 'ikki karra inkorni kiritish', dne: 'ikki karra inkorni olib tashlash', ei: 'ekvivalensiyani kiritish', ee1: 'ekvivalensiyani olib tashlash (1)', ee2: 'ekvivalensiyani olib tashlash (2)', cp: 'kontrapozitsiya', abs: 'teskarisidan isbotlash', syl: 'sillogizm', add: 'asoslarni qo‘shish', mul: 'xulosalarni ko‘paytirish', tre: 'ekvivalensiya tranzitivligi',
        id: 'ayniyat', ica: '∧ idempotentligi', ido: '∨ idempotentligi', cca: '∧ kommutativligi', cdo: '∨ kommutativligi', aca: '∧ assotsiativligi', ado: '∨ assotsiativligi', dca: '∧ ning ∨ ga nisbatan distributivligi', ddo: '∨ ning ∧ ga nisbatan distributivligi', dn: 'ikki karra inkor', ceq: '↔ kommutativligi', cpe: 'kontrapozitsiya', ndo: 'diz’yunksiya inkori', nca: 'kon’yunksiya inkori', opp: 'qarama-qarshilik', perm: 'asoslar o‘rnini almashtirish',
        v1: '→ ⌉, ∨ orqali', v2: '→ ⌉, ∧ orqali', v3: '∨ ⌉, → orqali', v4: '∨ ⌉, ∧ orqali', v5: '∧ ⌉, → orqali', v6: '∧ ⌉, ∨ orqali', v7: '↔ →, ∧ orqali',
      },
    },
  });

  /* Перечень теоремы 1.3 (с. 11–13) в записи с клавиатуры: ~ ⌉, & ∧, | ∨, -> →, <-> ↔. */
  const LAWS = {
    imp: [
      ['mp', 'p & (p -> q) -> q'], ['ce1', 'p & q -> p'], ['ce2', 'p & q -> q'], ['di1', 'p -> p | q'], ['di2', 'q -> p | q'],
      ['de', '(p | q) & ~q -> p'], ['dni', 'p -> ~~p'], ['dne', '~~p -> p'], ['ei', '(p -> q) & (q -> p) -> (p <-> q)'],
      ['ee1', '(p <-> q) -> (p -> q)'], ['ee2', '(p <-> q) -> (q -> p)'], ['cp', '(p -> q) -> (~q -> ~p)'],
      ['abs', '(~p -> q) & (~p -> ~q) -> p'], ['syl', '(p -> q) & (q -> r) -> (p -> r)'], ['add', '(p -> r) & (q -> r) -> (p | q -> r)'],
      ['mul', '(p -> q) & (p -> r) -> (p -> q & r)'], ['tre', '(p <-> q) & (q <-> r) -> (p <-> r)'],
    ],
    eqv: [
      ['id', 'p <-> p'], ['ica', 'p & p <-> p'], ['ido', 'p | p <-> p'], ['cca', 'p & q <-> q & p'], ['cdo', 'p | q <-> q | p'],
      ['aca', 'p & (q & r) <-> (p & q) & r'], ['ado', 'p | (q | r) <-> (p | q) | r'], ['dca', 'p & (q | r) <-> (p & q) | (p & r)'],
      ['ddo', 'p | (q & r) <-> (p | q) & (p | r)'], ['dn', '~~p <-> p'], ['ceq', '(p <-> q) <-> (q <-> p)'], ['cpe', '(p -> q) <-> (~q -> ~p)'],
      ['ndo', '~(p | q) <-> (~p & ~q)'], ['nca', '~(p & q) <-> (~p | ~q)'], ['opp', '(p <-> q) <-> (~p <-> ~q)'], ['perm', 'p -> (q -> r) <-> q -> (p -> r)'],
    ],
    via: [
      ['v1', 'p -> q <-> ~p | q'], ['v2', 'p -> q <-> ~(p & ~q)'], ['v3', 'p | q <-> ~p -> q'], ['v4', 'p | q <-> ~(~p & ~q)'],
      ['v5', 'p & q <-> ~(p -> ~q)'], ['v6', 'p & q <-> ~(~p | ~q)'], ['v7', '(p <-> q) <-> (p -> q) & (q -> p)'],
    ],
  };
  const OPS = [['${\\rceil} A$', '~A'], ['$A \\wedge B$', 'A & B'], ['$A \\vee B$', 'A | B'], ['$A \\rightarrow B$', 'A -> B'], ['$A \\leftrightarrow B$', 'A <-> B']];

  /* ---------- Разбор. Старшинство (область действия): ↔ 1, → 2, ∨ 3, ∧ 4; ⌉ сильнее всех. ---------- */
  const PREC = { eq: 1, imp: 2, or: 3, and: 4 };
  const TEX = { eq: '\\leftrightarrow', imp: '\\rightarrow', or: '\\vee', and: '\\wedge' };

  function lex(s) {
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      const two = s.slice(i, i + 2);
      const three = s.slice(i, i + 3);
      if (three === '<->') { out.push('eq'); i += 3; continue; }
      if (two === '->' || two === '=>') { out.push('imp'); i += 2; continue; }
      if (c === '↔' || c === '⇔' || c === '=') { out.push('eq'); i++; continue; }
      if (c === '→' || c === '⇒' || c === '>') { out.push('imp'); i++; continue; }
      if (c === '∨' || c === '|') { out.push('or'); i++; continue; }
      if (c === '∧' || c === '&') { out.push('and'); i++; continue; }
      if (c === '⌉' || c === '¬' || c === '~' || c === '!') { out.push('not'); i++; continue; }
      if (c === '(' || c === ')') { out.push(c); i++; continue; }
      const m = /^[A-Za-z][0-9]*/.exec(s.slice(i));
      if (m) { out.push({ atom: m[0] }); i += m[0].length; continue; }
      throw { code: 'tok', ch: c };
    }
    return out;
  }

  /** Строка → дерево {t:'atom',n} | {t:'not',a} | {t:op,a,b}; бинарные знаки группируются влево (с. 9). */
  function parse(s) {
    const tk = lex(s);
    if (!tk.length) throw { code: 'empty' };
    let pos = 0;
    const peek = () => tk[pos];
    function prim() {
      const x = tk[pos++];
      if (x === undefined) throw { code: 'end' };
      if (x === 'not') return { t: 'not', a: prim() };
      if (x === '(') {
        const e = expr(1);
        if (tk[pos++] !== ')') throw { code: 'paren' };
        return e;
      }
      if (typeof x === 'object') return { t: 'atom', n: x.atom };
      throw { code: 'tok', ch: x === ')' ? ')' : '?' };
    }
    function expr(min) {
      let l = prim();
      while (typeof peek() === 'string' && PREC[peek()] >= min) {
        const op = tk[pos++];
        const r = expr(PREC[op] + 1);
        l = { t: op, a: l, b: r };
      }
      return l;
    }
    const e = expr(1);
    if (pos < tk.length) throw { code: 'tok', ch: tk[pos] === ')' ? ')' : '?' };
    return e;
  }

  const atomTex = (n) => n.replace(/^([A-Za-z])([0-9]+)$/, '$1_{$2}');
  /** TeX с минимумом скобок по соглашениям Куликова. */
  function tex(e) {
    if (e.t === 'atom') return atomTex(e.n);
    if (e.t === 'not') return '{\\rceil} ' + (e.a.t === 'atom' || e.a.t === 'not' ? tex(e.a) : '(' + tex(e.a) + ')');
    const p = PREC[e.t];
    const L = e.a.t in PREC && PREC[e.a.t] < p ? '(' + tex(e.a) + ')' : tex(e.a);
    const R = e.b.t in PREC && PREC[e.b.t] <= p ? '(' + tex(e.b) + ')' : tex(e.b);
    return L + ' ' + TEX[e.t] + ' ' + R;
  }
  /** TeX точно по определению формулы: каждая сложная формула в своих скобках. */
  function full(e) {
    if (e.t === 'atom') return atomTex(e.n);
    if (e.t === 'not') return '({\\rceil} ' + full(e.a) + ')';
    return '(' + full(e.a) + ' ' + TEX[e.t] + ' ' + full(e.b) + ')';
  }
  function atomsOf(e, out = []) {
    if (e.t === 'atom') { if (!out.includes(e.n)) out.push(e.n); } else { atomsOf(e.a, out); if (e.b) atomsOf(e.b, out); }
    return out;
  }
  /** Сложные подформулы снизу вверх, без повторов. */
  function subs(e, out = [], seen = new Set()) {
    if (e.t === 'atom') return out;
    subs(e.a, out, seen);
    if (e.b) subs(e.b, out, seen);
    const k = full(e);
    if (!seen.has(k)) { seen.add(k); out.push(e); }
    return out;
  }
  function value(e, v) {
    switch (e.t) {
      case 'atom': return v[e.n];
      case 'not': return !value(e.a, v);
      case 'and': return value(e.a, v) && value(e.b, v);
      case 'or': return value(e.a, v) || value(e.b, v);
      case 'imp': return !value(e.a, v) || value(e.b, v);
      default: return value(e.a, v) === value(e.b, v);
    }
  }
  /** Полный анализ: атомы, столбцы, строки (первая — все И), вид формулы. */
  function analyse(src) {
    const e = parse(src);
    const at = atomsOf(e);
    if (at.length > 6) throw { code: 'many' };
    const cols = subs(e);
    const rows = [];
    const n = at.length;
    for (let i = 0; i < 1 << n; i++) {
      const v = {};
      at.forEach((a, k) => (v[a] = !((i >> (n - 1 - k)) & 1)));
      rows.push({ v, c: cols.map((c) => value(c, v)), f: value(e, v) });
    }
    const t = rows.filter((r) => r.f).length;
    return { e, at, cols, rows, t, kind: t === rows.length ? 'taut' : t === 0 ? 'contr' : 'neither' };
  }

  const GLYPH = { not: '⌉', and: '∧', or: '∨', imp: '→', eq: '↔' };
  /** Дерево построения: листья — атомы, узлы — знаки; у каждого узла — его значение в строке v. */
  function drawTree(e, v, tv) {
    const S = MC.svg;
    const nodes = [];
    let leaf = 0;
    let depth = 0;
    (function place(n, d) {
      depth = Math.max(depth, d);
      const kids = n.t === 'atom' ? [] : n.b ? [n.a, n.b] : [n.a];
      const ks = kids.map((k) => place(k, d + 1));
      const x = ks.length ? ks.reduce((s, k) => s + k.x, 0) / ks.length : leaf++;
      const me = { n, x, d, ks };
      nodes.push(me);
      return me;
    })(e, 0);
    const DX = 52;
    const DY = 58;
    const W = Math.max(leaf, 1) * DX;
    const Hh = (depth + 1) * DY;
    const svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': T.treeAria });
    svg.style.cssText = 'display:block;margin:0 auto 12px;width:100%;max-width:' + Math.max(W, 160) + 'px;height:auto;';
    const X = (x) => DX / 2 + x * DX;
    const Y = (d) => DY / 2 + d * DY;
    for (const m of nodes) for (const k of m.ks) svg.appendChild(S('line', { x1: X(m.x), y1: Y(m.d), x2: X(k.x), y2: Y(k.d), style: 'stroke: var(--line2); stroke-width: 1.5' }));
    for (const m of nodes) {
      const val = value(m.n, v);
      const isRoot = m.d === 0;
      svg.appendChild(S('circle', { cx: X(m.x), cy: Y(m.d), r: 15, style: 'fill: ' + (val ? 'var(--accent-soft)' : 'var(--warm-soft)') + '; stroke: ' + (val ? 'var(--accent)' : 'var(--warm)') + '; stroke-width: ' + (isRoot ? 2 : 1) }));
      const lab = m.n.t === 'atom' ? m.n.n : GLYPH[m.n.t];
      const t1 = S('text', { x: X(m.x), y: Y(m.d) + 5, 'text-anchor': 'middle', class: m.n.t === 'atom' ? 'lbl ink' : '' }, lab);
      if (m.n.t !== 'atom') t1.style.cssText = 'font-size:16px;fill:var(--fg)';
      svg.appendChild(t1);
      const t2 = S('text', { x: X(m.x) + 19, y: Y(m.d) - 9, 'text-anchor': 'start' }, tv(val));
      t2.style.cssText = 'font-size:11px;font-weight:600;fill:' + (val ? 'var(--accent)' : 'var(--warm)');
      svg.appendChild(t2);
    }
    return svg;
  }

  if (typeof MC !== 'undefined') {
    MC.widget('truth-table', (el, cfg) => {
      const fig = MC.fig.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title });
      const inp = H('input', { type: 'text', value: cfg.formula || 'A -> B', spellcheck: 'false', autocomplete: 'off', 'aria-label': T.input });
      inp.style.cssText = 'width:100%;box-sizing:border-box;font:16px var(--mono);padding:8px 10px;border:1px solid var(--line2);border-radius:4px;background:var(--bg);color:var(--fg);';
      const keys = H('div', { class: 'seg', role: 'group', 'aria-label': T.input });
      [['⌉', '~'], ['∧', ' & '], ['∨', ' | '], ['→', ' -> '], ['↔', ' <-> '], ['(', '('], [')', ')']].forEach(([lab, ins]) => {
        const b = H('button', { type: 'button' }, lab);
        b.addEventListener('click', () => {
          const s = inp.selectionStart ?? inp.value.length;
          const e2 = inp.selectionEnd ?? s;
          inp.value = inp.value.slice(0, s) + ins + inp.value.slice(e2);
          inp.focus();
          inp.setSelectionRange(s + ins.length, s + ins.length);
          build();
        });
        keys.appendChild(b);
      });

      if (cfg.set === 'laws') {
        let group = 'imp';
        const sel = H('select', { 'aria-label': T.law });
        sel.style.cssText = 'max-width:100%;font:inherit;font-size:14px;padding:6px 8px;border:1px solid var(--line2);border-radius:4px;background:var(--bg);color:var(--fg);';
        const fill = () => {
          sel.replaceChildren(...LAWS[group].map(([k, f]) => H('option', { value: f }, T.laws[k])));
        };
        const gs = MC.fig.seg(Object.keys(LAWS).map((g) => ({ value: g, label: T.groups[g] })), group, (g) => {
          group = g;
          fill();
          inp.value = sel.value;
          build();
        }, T.group);
        fill();
        const syl = LAWS.imp.find((x) => x[0] === 'syl');
        if (syl && inp.value === syl[1]) sel.value = syl[1];
        sel.addEventListener('change', () => {
          inp.value = sel.value;
          build();
        });
        fig.controls.append(gs.el, sel);
      } else {
        const os = MC.fig.seg(OPS.map(([l, f]) => ({ value: f, label: l })), OPS.some((o) => o[1] === inp.value) ? inp.value : null, (f) => {
          inp.value = f;
          build();
        }, T.ops);
        fig.controls.append(os.el);
      }
      fig.controls.append(keys, inp);
      inp.addEventListener('input', build);

      const ro = MC.fig.readout(fig.readout, [
        { key: 'atoms', label: T.atoms },
        { key: 'rows', label: T.rows },
        { key: 'kind', label: T.kind },
      ]);
      const treeBox = H('div');
      const wrap = H('div', { class: 'table-wrap' });
      fig.plot.append(treeBox, wrap);
      let sel = null;
      let lastSrc = null;

      function build() {
        let r;
        try {
          r = analyse(inp.value);
        } catch (err) {
          const c = err && err.code;
          const msg = c === 'tok' ? T.errs.tok(err.ch) : (T.errs[c] || String(err));
          fig.note.className = 'fig-note bad';
          fig.note.textContent = T.err + msg;
          ro.set('atoms', '—');
          ro.set('rows', '—');
          ro.set('kind', '—');
          treeBox.replaceChildren();
          wrap.replaceChildren();
          return;
        }
        if (inp.value !== lastSrc) {
          lastSrc = inp.value;
          const firstBad = r.rows.findIndex((x) => !x.f);
          sel = firstBad >= 0 ? firstBad : 0;
        }
        if (sel >= r.rows.length) sel = 0;
        const tv = (b) => T.tv[b ? 1 : 0];
        const table = H('table', { class: 'data', 'aria-label': T.tableAria });
        table.style.minWidth = '0';
        const th = (src, last) => {
          const c = H('th');
          c.style.cssText = 'text-align:center;padding:8px 10px;white-space:nowrap;' + (last ? 'color:var(--fg);' : '');
          MC.math.set(c, src);
          return c;
        };
        const cols = r.cols.length ? r.cols : [];
        const lastIsAtom = r.e.t === 'atom';
        const head = H('tr', null, ...r.at.map((a) => th(atomTex(a))), ...cols.map((c, i) => th(tex(c), i === cols.length - 1)));
        if (lastIsAtom) head.lastChild.style.color = 'var(--fg)';
        const body = r.rows.map((row, ri) => {
          const cells = [...r.at.map((a) => row.v[a]), ...row.c];
          const tr = H('tr', null, ...cells.map((b, i) => {
            const td = H('td', null, tv(b));
            td.style.cssText = 'text-align:center;padding:6px 10px;' + (i === cells.length - 1 ? 'font-weight:600;color:' + (b ? 'var(--fg)' : 'var(--warm)') + ';' : '');
            if (i === r.at.length && cols.length) td.style.borderLeft = '1px solid var(--line2)';
            return td;
          }));
          if (!row.f) tr.style.background = 'var(--warm-soft)';
          tr.style.cursor = 'pointer';
          tr.tabIndex = 0;
          if (ri === sel) tr.style.outline = '2px solid var(--accent)';
          const pick = () => {
            sel = ri;
            build();
          };
          tr.addEventListener('click', pick);
          tr.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              pick();
            }
          });
          return tr;
        });
        if (cols.length) head.children[r.at.length].style.borderLeft = '1px solid var(--line2)';
        table.append(H('thead', null, head), H('tbody', null, ...body));
        wrap.replaceChildren(table);
        treeBox.replaceChildren(drawTree(r.e, r.rows[sel].v, tv));

        const n = r.rows.length;
        ro.set('atoms', String(r.at.length));
        ro.set('rows', String(n));
        ro.set('kind', T[r.kind], r.kind === 'taut' ? 'accent' : r.kind === 'contr' ? 'warm' : '');
        fig.note.className = 'fig-note';
        const fullEl = H('span');
        MC.math.set(fullEl, full(r.e));
        let tail;
        if (r.kind === 'taut') tail = T.noteTaut(n);
        else if (r.kind === 'contr') tail = T.noteContr(n);
        else {
          const bad = r.rows.find((x) => !x.f);
          tail = T.noteNeither(r.t, n - r.t, r.at.map((a) => a + ' = ' + tv(bad.v[a])).join(', '));
        }
        const rowTxt = T.rowNo(sel + 1) + r.at.map((a) => a + ' = ' + tv(r.rows[sel].v[a])).join(', ') + ' → ' + tv(r.rows[sel].f) + '.';
        fig.note.replaceChildren(T.full, fullEl, tail, ' ' + rowTxt, T.rowHint);
      }
      build();
    });
  }

  /* Для проверок в node: тот же разбор без DOM. */
  if (typeof module !== 'undefined') module.exports = { parse, analyse, tex, full, LAWS };
})();
