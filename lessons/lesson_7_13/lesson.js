/* Урок 7.13 «Логическое следствие»: рисунок «Следствие и равносильность по таблице истинности»
 * (Куликов, гл. 1, § 2). Режим conseq — проверка A1, …, Am ⊨ B; режим equiv — проверка A ≡ B
 * по теореме 2.1 (столбец A ↔ B). Формулы вводятся текстом и разбираются здесь же. */
(function () {
  'use strict';

  /* ---------- Разбор формул: ~ ! ¬ ⌉ — не, & ∧ — и, | ∨ — или, -> → — импликация, <-> ↔ — эквиваленция ---------- */
  function tokenize(src) {
    const out = [];
    let i = 0;
    while (i < src.length) {
      const c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (src.startsWith('<->', i)) { out.push('<->'); i += 3; continue; }
      if (src.startsWith('->', i)) { out.push('->'); i += 2; continue; }
      if (c === '↔') { out.push('<->'); i++; continue; }
      if (c === '→') { out.push('->'); i++; continue; }
      if ('~!¬⌉'.includes(c)) { out.push('~'); i++; continue; }
      if ('&∧'.includes(c)) { out.push('&'); i++; continue; }
      if ('|∨'.includes(c)) { out.push('|'); i++; continue; }
      if ('()'.includes(c)) { out.push(c); i++; continue; }
      const m = /^[A-Za-z][0-9]*/.exec(src.slice(i));
      if (m) { out.push({ atom: m[0] }); i += m[0].length; continue; }
      throw new Error(c);
    }
    return out;
  }

  /** Приоритеты как у Куликова: ⌉ сильнее ∧, затем ∨, →, ↔; → группируется вправо. */
  function parse(src) {
    const t = tokenize(src);
    let k = 0;
    const peek = () => t[k];
    const eat = (s) => { if (t[k] === s) { k++; return true; } return false; };
    function equiv() {
      let a = impl();
      while (eat('<->')) a = { op: 'eq', a, b: impl() };
      return a;
    }
    function impl() {
      const a = disj();
      return eat('->') ? { op: 'imp', a, b: impl() } : a;
    }
    function disj() {
      let a = conj();
      while (eat('|')) a = { op: 'or', a, b: conj() };
      return a;
    }
    function conj() {
      let a = un();
      while (eat('&')) a = { op: 'and', a, b: un() };
      return a;
    }
    function un() {
      if (eat('~')) return { op: 'not', a: un() };
      if (eat('(')) {
        const e = equiv();
        if (!eat(')')) throw new Error(')');
        return e;
      }
      const x = peek();
      if (x && x.atom) { k++; return { op: 'atom', name: x.atom }; }
      throw new Error(String(x || 'end'));
    }
    const e = equiv();
    if (k !== t.length) throw new Error(String(t[k]));
    return e;
  }

  /** Посылки через запятую верхнего уровня (запятые внутри скобок не делят). */
  function splitList(src) {
    const parts = [];
    let depth = 0;
    let cur = '';
    for (const c of src) {
      if (c === '(') depth++;
      if (c === ')') depth--;
      if (c === ',' && depth === 0) { parts.push(cur); cur = ''; } else cur += c;
    }
    parts.push(cur);
    return parts.map((s) => s.trim()).filter(Boolean);
  }

  function atoms(e, set = new Set()) {
    if (e.op === 'atom') set.add(e.name);
    else { atoms(e.a, set); if (e.b) atoms(e.b, set); }
    return set;
  }

  function evaluate(e, v) {
    switch (e.op) {
      case 'atom': return v[e.name];
      case 'not': return !evaluate(e.a, v);
      case 'and': return evaluate(e.a, v) && evaluate(e.b, v);
      case 'or': return evaluate(e.a, v) || evaluate(e.b, v);
      case 'imp': return !evaluate(e.a, v) || evaluate(e.b, v);
      default: return evaluate(e.a, v) === evaluate(e.b, v);
    }
  }

  const PREC = { eq: 1, imp: 2, or: 3, and: 4, not: 5, atom: 6 };
  const SYM = { eq: '\\leftrightarrow', imp: '\\to', or: '\\vee', and: '\\wedge' };
  function tex(e) {
    if (e.op === 'atom') {
      const m = /^([A-Za-z])([0-9]+)$/.exec(e.name);
      return m ? m[1] + '_{' + m[2] + '}' : e.name;
    }
    if (e.op === 'not') {
      const s = tex(e.a);
      return '{\\rceil}' + (PREC[e.a.op] < PREC.not ? '(' + s + ')' : s);
    }
    const p = PREC[e.op];
    const left = PREC[e.a.op] < p || (e.op === 'imp' && e.a.op === 'imp') ? '(' + tex(e.a) + ')' : tex(e.a);
    const right = PREC[e.b.op] < p || e.b.op === e.op ? '(' + tex(e.b) + ')' : tex(e.b);
    return left + ' ' + SYM[e.op] + ' ' + right;
  }

  /** Таблица и вердикт. premises — деревья, concl — дерево. */
  function entails(premises, concl) {
    const names = [...[...premises, concl].reduce((s, f) => atoms(f, s), new Set())].sort();
    const rows = [];
    const n = names.length;
    for (let i = 0; i < 1 << n; i++) {
      const v = {};
      names.forEach((x, j) => (v[x] = !((i >> (n - 1 - j)) & 1))); // первая строка — все И, как в книге
      const pv = premises.map((f) => evaluate(f, v));
      const all = pv.every(Boolean);
      const c = evaluate(concl, v);
      rows.push({ v, pv, c, all, bad: all && !c });
    }
    return { names, rows, ok: rows.every((r) => !r.bad) };
  }

  const MAX_ATOMS = 6;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Логическое следствие по таблице истинности',
      title2: 'Равносильность: столбец $A \\leftrightarrow B$',
      presets: 'Готовые схемы',
      prem: 'Посылки (через запятую)',
      concl: 'Заключение',
      fa: 'Формула $A$',
      fb: 'Формула $B$',
      run: 'Проверить',
      only: 'Только строки, где посылки истинны',
      T: 'И',
      F: 'Л',
      rows: 'строк',
      good: 'посылки истинны',
      bad: 'контрпримеров',
      verdict: 'вывод',
      eqRows: 'совпадений',
      ab: '$A \\models B$',
      ba: '$B \\models A$',
      yes: 'да',
      no: 'нет',
      err: (s) => 'Не удалось разобрать формулу около «' + s + '». Знаки: ~ или ! — «не», & — «и», | — «или», -> — импликация, <-> — эквиваленция, скобки.',
      tooMany: (n) => 'Атомов ' + n + ' — таблица слишком велика; на рисунке не больше ' + MAX_ATOMS + ' атомов.',
      empty: 'Впишите заключение.',
      okC: (k, n) => 'Следствие есть: во всех ' + k + ' строках из ' + n + ', где посылки истинны, заключение истинно.',
      okVac: (n) => 'Следствие есть «пусто»: ни в одной из ' + n + ' строк посылки не истинны одновременно — совокупность посылок противоречива, и из неё следует что угодно.',
      badC: (k, row) => 'Следствия нет: контрпримеров ' + k + '. Например, строка ' + row + ': все посылки истинны, а заключение ложно.',
      okE: (n) => 'Равносильны: столбец $A \\leftrightarrow B$ — И во всех ' + n + ' строках (теорема 2.1).',
      badE: (k, row) => 'Не равносильны: значения различаются в ' + k + ' строк(ах), например в строке ' + row + '.',
      pc: { example: 'Пример', mp: 'Заключение', syl: 'Силлогизм', contra: 'От противного', fallacy: 'Ошибка', ex3d: 'Упр. 3 (d)' },
      pe: { demorgan: 'Де Морган', contrap: 'Контрапозиция', impl: 'Импликация', perm: 'Перестановка посылок', conv: 'Обращение' },
      tableAria: 'Таблица истинности',
      stripAria: 'Карта строк: синяя рамка — посылки истинны, заливка — заключение истинно, красный — контрпример',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Logical consequence by a truth table',
      title2: 'Equivalence: the column $A \\leftrightarrow B$',
      presets: 'Ready-made schemes',
      prem: 'Premises (comma-separated)',
      concl: 'Conclusion',
      fa: 'Formula $A$',
      fb: 'Formula $B$',
      run: 'Check',
      only: 'Only rows where the premises are true',
      T: 'T',
      F: 'F',
      rows: 'rows',
      good: 'premises true',
      bad: 'counterexamples',
      verdict: 'result',
      eqRows: 'matches',
      ab: '$A \\models B$',
      ba: '$B \\models A$',
      yes: 'yes',
      no: 'no',
      err: (s) => 'Could not parse the formula near “' + s + '”. Signs: ~ or ! — not, & — and, | — or, -> — implication, <-> — equivalence, brackets.',
      tooMany: (n) => n + ' atoms — the table is too large; the figure allows at most ' + MAX_ATOMS + ' atoms.',
      empty: 'Enter a conclusion.',
      okC: (k, n) => 'It follows: in all ' + k + ' of ' + n + ' rows where the premises are true, the conclusion is true.',
      okVac: (n) => 'It follows vacuously: in none of the ' + n + ' rows are all premises true — the premises are inconsistent, and anything follows from them.',
      badC: (k, row) => 'It does not follow: ' + k + ' counterexample(s). For example, row ' + row + ': all premises are true, the conclusion is false.',
      okE: (n) => 'Equivalent: the column $A \\leftrightarrow B$ is T in all ' + n + ' rows (Theorem 2.1).',
      badE: (k, row) => 'Not equivalent: the values differ in ' + k + ' row(s), e.g. row ' + row + '.',
      pc: { example: 'Example', mp: 'Modus ponens', syl: 'Syllogism', contra: 'By contradiction', fallacy: 'Fallacy', ex3d: 'Ex. 3 (d)' },
      pe: { demorgan: 'De Morgan', contrap: 'Contraposition', impl: 'Implication', perm: 'Exchange of premises', conv: 'Converse' },
      tableAria: 'Truth table',
      stripAria: 'Row map: blue frame — premises true, fill — conclusion true, red — counterexample',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: 'Mantiqiy natija rostlik jadvali bo‘yicha',
      title2: 'Teng kuchlilik: $A \\leftrightarrow B$ ustuni',
      presets: 'Tayyor sxemalar',
      prem: 'Asoslar (vergul bilan)',
      concl: 'Xulosa',
      fa: '$A$ formula',
      fb: '$B$ formula',
      run: 'Tekshirish',
      only: 'Faqat asoslar rost bo‘lgan satrlar',
      T: 'R',
      F: 'Y',
      rows: 'satrlar',
      good: 'asoslar rost',
      bad: 'qarshi misollar',
      verdict: 'natija',
      eqRows: 'mos keladi',
      ab: '$A \\models B$',
      ba: '$B \\models A$',
      yes: 'ha',
      no: 'yo‘q',
      err: (s) => '«' + s + '» atrofida formulani o‘qib bo‘lmadi. Belgilar: ~ yoki ! — inkor, & — va, | — yoki, -> — implikatsiya, <-> — ekvivalensiya, qavslar.',
      tooMany: (n) => 'Atomlar ' + n + ' ta — jadval juda katta; rasmda ' + MAX_ATOMS + ' tadan ko‘p atom bo‘lmaydi.',
      empty: 'Xulosani kiriting.',
      okC: (k, n) => 'Natija bor: jami ' + n + ' satrdan asoslar rost bo‘lgan ' + k + ' tasining barchasida xulosa rost.',
      okVac: (n) => 'Natija «bo‘sh» ma’noda bor: ' + n + ' satrning birortasida ham asoslar birga rost emas — asoslar ziddiyatli, ulardan istalgan narsa kelib chiqadi.',
      badC: (k, row) => 'Natija yo‘q: qarshi misollar ' + k + ' ta. Masalan, ' + row + ' satr: barcha asoslar rost, xulosa yolg‘on.',
      okE: (n) => 'Teng kuchli: $A \\leftrightarrow B$ ustuni barcha ' + n + ' satrda R (2.1-teorema).',
      badE: (k, row) => 'Teng kuchli emas: qiymatlar ' + k + ' satrda farq qiladi, masalan ' + row + ' satrda.',
      pc: { example: 'Misol', mp: 'Xulosa qoidasi', syl: 'Sillogizm', contra: 'Teskarisidan', fallacy: 'Xato', ex3d: '3 (d) mashq' },
      pe: { demorgan: 'De Morgan', contrap: 'Kontrapozitsiya', impl: 'Implikatsiya', perm: 'Asoslar o‘rin almashinuvi', conv: 'Teskari' },
      tableAria: 'Rostlik jadvali',
      stripAria: 'Satrlar xaritasi: ko‘k ramka — asoslar rost, bo‘yalgan — xulosa rost, qizil — qarshi misol',
    },
  });

  const PRESETS_C = {
    example: { prem: 'A -> B, A -> ~B', concl: '~A' },
    mp: { prem: 'A, A -> B', concl: 'B' },
    syl: { prem: 'A -> B, B -> C', concl: 'A -> C' },
    contra: { prem: '~B -> C, ~B -> ~C', concl: 'B' },
    fallacy: { prem: 'B, A -> B', concl: 'A' },
    ex3d: { prem: 'A | B -> C | D, D | E -> F', concl: 'A -> F', only: true },
  };
  const PRESETS_E = {
    demorgan: { a: '~(p & q)', b: '~p | ~q' },
    contrap: { a: 'p -> q', b: '~q -> ~p' },
    impl: { a: 'p -> q', b: '~p | q' },
    perm: { a: 'p -> (q -> r)', b: 'q -> (p -> r)' },
    conv: { a: 'p -> q', b: 'q -> p' },
  };

  const H = MC.h;
  const F = MC.fig;

  function textInput(label, value) {
    const input = H('input', { type: 'text', value, spellcheck: 'false', autocomplete: 'off' });
    input.style.cssText = 'width: 100%; box-sizing: border-box; font: inherit; font-family: var(--mono, monospace); font-size: 15px; padding: 6px 8px; border: 1px solid var(--line2); border-radius: 4px; background: var(--bg); color: var(--fg);';
    const el = H('label', { class: 'ctl' }, H('span', null, F.rich(label)), input);
    el.style.cssText = 'display: flex; flex-direction: column; gap: 4px; flex: 1 1 220px; min-width: 0;';
    return { el, input };
  }

  MC.widget('entail', (el, cfg) => {
    const equivMode = cfg.mode === 'equiv';
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: equivMode ? T.title2 : T.title1 });
    const presets = equivMode ? PRESETS_E : PRESETS_C;
    const names = equivMode ? T.pe : T.pc;
    const start = presets[cfg.preset] ? cfg.preset : Object.keys(presets)[0];
    const in1 = textInput(equivMode ? T.fa : T.prem, equivMode ? presets[start].a : presets[start].prem);
    const in2 = textInput(equivMode ? T.fb : T.concl, equivMode ? presets[start].b : presets[start].concl);
    let only = !!presets[start].only;
    const seg = F.seg(Object.keys(presets).map((k) => ({ value: k, label: names[k] })), start, (k) => {
      const p = presets[k];
      in1.input.value = equivMode ? p.a : p.prem;
      in2.input.value = equivMode ? p.b : p.concl;
      only = !!p.only;
      if (onlyBox) onlyBox.input.checked = only;
      run();
    }, T.presets);
    const runBtn = F.button(null, T.run, () => { seg.set(null); run(); });
    const fields = H('div');
    fields.style.cssText = 'display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; width: 100%;';
    fields.append(in1.el, in2.el, runBtn);
    let onlyBox = null;
    fig.controls.append(seg.el, fields);
    if (!equivMode) {
      onlyBox = F.check(T.only, only, (v) => { only = v; run(); });
      fig.controls.append(onlyBox.el);
    }
    [in1.input, in2.input].forEach((i) => i.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); seg.set(null); run(); } }));
    const ro = F.readout(fig.readout, equivMode
      ? [{ key: 'rows', label: T.rows }, { key: 'eq', label: T.eqRows }, { key: 'ab', label: T.ab }, { key: 'ba', label: T.ba }]
      : [{ key: 'rows', label: T.rows }, { key: 'good', label: T.good }, { key: 'bad', label: T.bad }, { key: 'verdict', label: T.verdict }]);
    const strip = H('div');
    strip.style.cssText = 'margin: 0 0 10px; overflow-x: auto;';
    const wrap = H('div', { class: 'table-wrap' });
    wrap.style.position = 'relative';
    fig.plot.append(strip, wrap);

    /** Карта строк: квадрат на строку таблицы. Заливка — заключение (или A ↔ B) истинно;
     * синяя рамка — все посылки истинны; красный — контрпример (или несовпадение A и B). */
    function drawStrip(res, isGood, isBad, isTrue) {
      const n = res.rows.length;
      const C = n > 16 ? 18 : 24;
      const per = Math.min(n, 16);
      const lines = Math.ceil(n / per);
      const w = per * C + 4;
      const h = lines * C + 4;
      const svg = MC.svg('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, role: 'img', 'aria-label': T.stripAria });
      res.rows.forEach((r, i) => {
        const x = 2 + (i % per) * C;
        const y = 2 + Math.floor(i / per) * C;
        const rect = MC.svg('rect', { x: x + 1.5, y: y + 1.5, width: C - 3, height: C - 3, rx: 3 });
        const bad = isBad(r);
        rect.style.fill = bad ? 'var(--err)' : isTrue(r) ? 'var(--accent-soft)' : 'var(--bg2)';
        rect.style.stroke = bad ? 'var(--err)' : isGood(r) ? 'var(--accent)' : 'var(--line2)';
        rect.style.strokeWidth = isGood(r) || bad ? '2' : '1';
        svg.appendChild(rect);
      });
      svg.style.width = w + 'px';
      svg.style.maxWidth = '100%';
      svg.style.height = 'auto';
      strip.replaceChildren(svg);
    }

    const val = (b) => (b ? T.T : T.F);
    function fail(msg) {
      wrap.replaceChildren();
      strip.replaceChildren();
      fig.note.className = 'fig-note';
      fig.note.textContent = msg;
      for (const k of equivMode ? ['rows', 'eq', 'ab', 'ba'] : ['rows', 'good', 'bad', 'verdict']) ro.set(k, '—');
    }
    function cell(tag, content, style) {
      const c = H(tag);
      if (typeof content === 'string') c.textContent = content;
      else c.appendChild(content);
      c.style.cssText = 'white-space: nowrap;' + (style || '');
      return c;
    }
    function run() {
      let prem;
      let concl;
      try {
        if (equivMode) {
          if (!in1.input.value.trim() || !in2.input.value.trim()) return fail(T.empty);
          prem = [parse(in1.input.value)];
          concl = parse(in2.input.value);
        } else {
          if (!in2.input.value.trim()) return fail(T.empty);
          prem = splitList(in1.input.value).map(parse);
          concl = parse(in2.input.value);
        }
      } catch (e) {
        return fail(T.err(e.message));
      }
      const res = equivMode ? entails([], { op: 'eq', a: prem[0], b: concl }) : entails(prem, concl);
      if (res.names.length > MAX_ATOMS) return fail(T.tooMany(res.names.length));
      // в режиме equiv строим свои столбцы: A, B, A ↔ B
      const cols = equivMode
        ? [{ t: 'A', f: prem[0] }, { t: 'B', f: concl }, { t: 'A \\leftrightarrow B', f: { op: 'eq', a: prem[0], b: concl } }]
        : [...prem.map((f) => ({ t: tex(f), f })), { t: tex(concl), f: concl, concl: true }];
      const table = H('table', { class: 'data', 'aria-label': T.tableAria });
      table.style.cssText = 'text-align: center; margin: 0 auto;';
      const head = H('tr');
      res.names.forEach((x) => head.appendChild(cell('th', F.rich('$' + tex({ op: 'atom', name: x }) + '$'))));
      cols.forEach((c, i) => head.appendChild(cell('th', F.rich('$' + c.t + '$'), (i === 0 ? 'border-left: 2px solid var(--line2);' : '') + (c.concl ? 'border-left: 2px solid var(--line2);' : ''))));
      const tbody = H('tbody');
      const rowLabel = (r) => res.names.map((x) => val(r.v[x])).join('');
      res.rows.forEach((r) => {
        if (!equivMode && only && !r.all) return;
        const tr = H('tr');
        const vals = cols.map((c) => evaluate(c.f, r.v));
        const bad = equivMode ? vals[0] !== vals[1] : r.bad;
        if (bad) tr.style.background = 'color-mix(in srgb, var(--err) 14%, transparent)';
        else if (!equivMode && r.all) tr.style.background = 'var(--accent-soft)';
        res.names.forEach((x) => tr.appendChild(cell('td', val(r.v[x]), 'color: var(--fg3);')));
        vals.forEach((b, i) => {
          const c = cols[i];
          let st = i === 0 || c.concl ? 'border-left: 2px solid var(--line2);' : '';
          if (((c.concl && r.bad) || (equivMode && i === 2)) && !b) st += 'color: var(--err); font-weight: 600;';
          tr.appendChild(cell('td', val(b), st));
        });
        tbody.appendChild(tr);
      });
      table.append(H('thead', null, head), tbody);
      wrap.replaceChildren(table);
      if (equivMode) drawStrip(res, () => false, (r) => evaluate(prem[0], r.v) !== evaluate(concl, r.v), (r) => evaluate(prem[0], r.v) === evaluate(concl, r.v));
      else drawStrip(res, (r) => r.all, (r) => r.bad, (r) => r.c);
      const n = res.rows.length;
      fig.note.className = 'fig-note';
      if (equivMode) {
        const diff = res.rows.filter((r) => evaluate(prem[0], r.v) !== evaluate(concl, r.v));
        const ab = entails(prem, concl).ok;
        const ba = entails([concl], prem[0]).ok;
        ro.set('rows', String(n));
        ro.set('eq', (n - diff.length) + ' / ' + n, diff.length ? 'warm' : 'accent');
        ro.set('ab', ab ? T.yes : T.no, ab ? 'accent' : 'warm');
        ro.set('ba', ba ? T.yes : T.no, ba ? 'accent' : 'warm');
        fig.note.replaceChildren(F.rich(diff.length ? T.badE(diff.length, rowLabel(diff[0])) : T.okE(n)));
      } else {
        const good = res.rows.filter((r) => r.all);
        const bad = res.rows.filter((r) => r.bad);
        ro.set('rows', String(n));
        ro.set('good', String(good.length));
        ro.set('bad', String(bad.length), bad.length ? 'warm' : 'accent');
        ro.set('verdict', res.ok ? '⊨' : '⊭', res.ok ? 'accent' : 'warm');
        fig.note.textContent = !res.ok ? T.badC(bad.length, rowLabel(bad[0])) : good.length ? T.okC(good.length, n) : T.okVac(n);
      }
    }
    run();
  });

  /* Для проверок в node: тот же разбор и перебор без DOM. */
  if (typeof module !== 'undefined') module.exports = { parse, splitList, entails, tex, evaluate };
})();
