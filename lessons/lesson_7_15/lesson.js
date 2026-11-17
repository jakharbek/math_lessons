/* Урок 7.15 «Кванторы» (Куликов, гл. 1, § 4). Два рисунка:
 * 1) «quant-grid» — двухместный предикат на конечной области и шесть кванторных приставок: перебором видно,
 *    почему ∀x∃y и ∃y∀x — разные высказывания;
 * 2) «quant-types» — четыре основных типа высказываний на числах 1…N (с ловушкой ∃x(A(x) → B(x))). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;
  const H = MC.h;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      gridTitle: 'Кванторы перебором: предикат $A(x, y)$ на области $\\{-3, \\dots, 3\\}$',
      typesTitle: 'Четыре типа высказываний на числах $1, \\dots, N$',
      pred: 'Предикат',
      prefix: 'Кванторы',
      value: 'значение',
      T: 'И',
      F: 'Л',
      tableAria: 'Таблица значений предиката A(x, y): строки — x, столбцы — y',
      corner: 'x \\ y',
      // пояснения к рисунку 1
      allT: 'Все 49 клеток истинны — предикат тождественно истинен на области, поэтому ∀x∀y A(x, y) истинно. ',
      allF: (x, y) => 'Найдена ложная клетка: x = ' + x + ', y = ' + y + '. Одной такой клетки достаточно, чтобы ∀x∀y A(x, y) было ложно. ',
      anyT: (x, y) => 'Найдена истинная клетка: x = ' + x + ', y = ' + y + ' — предикат выполним, ∃x∃y A(x, y) истинно. ',
      anyF: 'Истинных клеток нет — предикат невыполним, ∃x∃y A(x, y) ложно. ',
      aeT: 'В каждой строке x есть хотя бы одна истинная клетка (отмечена синим) — свидетель y свой для каждого x. Поэтому ∀x∃y A(x, y) истинно. ',
      aeF: (x) => 'В строке x = ' + x + ' нет ни одной истинной клетки: для этого x подходящего y нет. Поэтому ∀x∃y A(x, y) ложно. ',
      eaT: (y) => 'Столбец y = ' + y + ' истинен целиком — одно y годится сразу для всех x. Поэтому ∃y∀x A(x, y) истинно. ',
      eaF: 'Ни один столбец не истинен целиком: для каждого y есть x, на котором A(x, y) ложно (отмечено оранжевым). Поэтому ∃y∀x A(x, y) ложно. ',
      exT: (x) => 'Строка x = ' + x + ' истинна целиком — одно x годится сразу для всех y. Поэтому ∃x∀y A(x, y) истинно. ',
      exF: 'Ни одна строка не истинна целиком: для каждого x есть y, на котором A(x, y) ложно. Поэтому ∃x∀y A(x, y) ложно. ',
      yeT: 'В каждом столбце y есть истинная клетка — для каждого y найдётся свой x. Поэтому ∀y∃x A(x, y) истинно. ',
      yeF: (y) => 'В столбце y = ' + y + ' нет ни одной истинной клетки. Поэтому ∀y∃x A(x, y) ложно. ',
      zNote: 'На всех целых числах (как в книге, с. 30) ∀x∃y(x + y > 0) истинно: для x = −3 подошло бы y = 4. Но в нашей области чисел больше 3 нет — значение высказывания с кванторами зависит от области допустимых значений.',
      swap: 'Сравните приставки ∀x∃y и ∃y∀x на одном предикате: первая может быть истинна, когда вторая ложна, но не наоборот.',
      // рисунок 2
      a: 'Предикат $A(x)$',
      b: 'Предикат $B(x)$',
      form: 'Запись',
      nLabel: 'Числа до $N$',
      preds: { odd: 'нечетное', even: 'четное', prime: 'простое', div3: 'делится на 3', sq: 'точный квадрат' },
      numsAria: 'Числа от 1 до N',
      legendA: 'кольцо — A(x) истинно',
      legendB: 'заливка — B(x) истинно',
      t1T: (a, b) => 'Контрпримеров нет: каждое число, которое ' + a + ', также ' + b + '. Высказывание истинно. ',
      t1F: (x, a, b) => 'Контрпример: ' + x + ' — ' + a + ', но не ' + b + '. Одного контрпримера достаточно — высказывание ложно. ',
      t2T: (a, b) => 'Ни одно число, которое ' + a + ', не является ' + b + '. Высказывание истинно. ',
      t2F: (x, a, b) => 'Контрпример: ' + x + ' — ' + a + ' и при этом ' + b + '. Высказывание ложно. ',
      t3T: (x, a, b) => 'Свидетель: ' + x + ' — ' + a + ' и ' + b + '. Высказывание истинно. ',
      t3F: (a, b) => 'Нет числа, которое одновременно ' + a + ' и ' + b + '. Высказывание ложно. ',
      t4T: (x, a, b) => 'Свидетель: ' + x + ' — ' + a + ', но не ' + b + '. Высказывание истинно. ',
      t4F: (a, b) => 'Каждое число, которое ' + a + ', также ' + b + ' — свидетеля нет. Высказывание ложно. ',
      trapT: (x, a) => 'Ловушка: ∃x(A(x) → B(x)) истинно уже потому, что ' + x + ' — не ' + a + ': при ложной посылке импликация истинна. Эта запись почти ничего не утверждает (с. 31). ',
      trapT2: (x) => 'Свидетель: ' + x + ' — импликация A(' + x + ') → B(' + x + ') истинна. ',
      trapF: 'Все числа таковы, что A(x) истинно, а B(x) ложно — только тогда ∃x(A(x) → B(x)) ложно. ',
      within: (n) => 'Проверка — на числах 1…' + n + '; на всех целых числах значение может быть другим.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      gridTitle: 'Quantifiers by brute force: a predicate $A(x, y)$ on $\\{-3, \\dots, 3\\}$',
      typesTitle: 'Four kinds of statements on the numbers $1, \\dots, N$',
      pred: 'Predicate',
      prefix: 'Quantifiers',
      value: 'value',
      T: 'T',
      F: 'F',
      tableAria: 'Table of values of A(x, y): rows are x, columns are y',
      corner: 'x \\ y',
      allT: 'All 49 cells are true: the predicate is identically true on the domain, so ∀x∀y A(x, y) is true. ',
      allF: (x, y) => 'A false cell: x = ' + x + ', y = ' + y + '. One such cell makes ∀x∀y A(x, y) false. ',
      anyT: (x, y) => 'A true cell: x = ' + x + ', y = ' + y + '. The predicate is satisfiable, ∃x∃y A(x, y) is true. ',
      anyF: 'No true cells: the predicate is not satisfiable, ∃x∃y A(x, y) is false. ',
      aeT: 'Every row x has a true cell (blue): each x has its own witness y. So ∀x∃y A(x, y) is true. ',
      aeF: (x) => 'Row x = ' + x + ' has no true cell: no y works for this x. So ∀x∃y A(x, y) is false. ',
      eaT: (y) => 'Column y = ' + y + ' is entirely true: one y works for every x. So ∃y∀x A(x, y) is true. ',
      eaF: 'No column is entirely true: for each y some x makes A(x, y) false (orange). So ∃y∀x A(x, y) is false. ',
      exT: (x) => 'Row x = ' + x + ' is entirely true: one x works for every y. So ∃x∀y A(x, y) is true. ',
      exF: 'No row is entirely true: for each x some y makes A(x, y) false. So ∃x∀y A(x, y) is false. ',
      yeT: 'Every column y has a true cell: each y has its own x. So ∀y∃x A(x, y) is true. ',
      yeF: (y) => 'Column y = ' + y + ' has no true cell. So ∀y∃x A(x, y) is false. ',
      zNote: 'On all integers (as in the book, p. 30) ∀x∃y(x + y > 0) is true: for x = −3 take y = 4. Our domain has no numbers above 3, so the value of a quantified statement depends on the domain.',
      swap: 'Compare ∀x∃y with ∃y∀x on the same predicate: the first can be true while the second is false, never the other way round.',
      a: 'Predicate $A(x)$',
      b: 'Predicate $B(x)$',
      form: 'Formula',
      nLabel: 'Numbers up to $N$',
      preds: { odd: 'odd', even: 'even', prime: 'prime', div3: 'divisible by 3', sq: 'a perfect square' },
      numsAria: 'Numbers from 1 to N',
      legendA: 'ring: A(x) is true',
      legendB: 'fill: B(x) is true',
      t1T: (a, b) => 'No counterexamples: every number that is ' + a + ' is also ' + b + '. The statement is true. ',
      t1F: (x, a, b) => 'Counterexample: ' + x + ' is ' + a + ' but not ' + b + '. One counterexample makes the statement false. ',
      t2T: (a, b) => 'No number that is ' + a + ' is ' + b + '. The statement is true. ',
      t2F: (x, a, b) => 'Counterexample: ' + x + ' is ' + a + ' and also ' + b + '. The statement is false. ',
      t3T: (x, a, b) => 'Witness: ' + x + ' is ' + a + ' and ' + b + '. The statement is true. ',
      t3F: (a, b) => 'No number is both ' + a + ' and ' + b + '. The statement is false. ',
      t4T: (x, a, b) => 'Witness: ' + x + ' is ' + a + ' but not ' + b + '. The statement is true. ',
      t4F: (a, b) => 'Every number that is ' + a + ' is also ' + b + ': no witness. The statement is false. ',
      trapT: (x, a) => 'Trap: ∃x(A(x) → B(x)) is true simply because ' + x + ' is not ' + a + ': an implication with a false premise is true. This formula says almost nothing (p. 31). ',
      trapT2: (x) => 'Witness: ' + x + ', the implication A(' + x + ') → B(' + x + ') is true. ',
      trapF: 'Every number has A(x) true and B(x) false; only then is ∃x(A(x) → B(x)) false. ',
      within: (n) => 'Checked on 1…' + n + '; on all integers the value may differ.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      gridTitle: 'Kvantorlar saralash orqali: $\\{-3, \\dots, 3\\}$ sohada $A(x, y)$ predikat',
      typesTitle: '$1, \\dots, N$ sonlarda mulohazalarning to‘rt turi',
      pred: 'Predikat',
      prefix: 'Kvantorlar',
      value: 'qiymat',
      T: 'R',
      F: 'Y',
      tableAria: 'A(x, y) predikat qiymatlari jadvali: satrlar — x, ustunlar — y',
      corner: 'x \\ y',
      allT: 'Barcha 49 katak rost: predikat sohada aynan rost, shuning uchun ∀x∀y A(x, y) rost. ',
      allF: (x, y) => 'Yolg‘on katak topildi: x = ' + x + ', y = ' + y + '. Bitta shunday katak ∀x∀y A(x, y) ni yolg‘on qiladi. ',
      anyT: (x, y) => 'Rost katak topildi: x = ' + x + ', y = ' + y + '. Predikat bajariluvchi, ∃x∃y A(x, y) rost. ',
      anyF: 'Rost katak yo‘q: predikat bajarilmaydi, ∃x∃y A(x, y) yolg‘on. ',
      aeT: 'Har bir x satrida rost katak bor (ko‘k): har bir x uchun o‘z y si topiladi. Shuning uchun ∀x∃y A(x, y) rost. ',
      aeF: (x) => 'x = ' + x + ' satrida rost katak yo‘q: bu x uchun mos y yo‘q. Shuning uchun ∀x∃y A(x, y) yolg‘on. ',
      eaT: (y) => 'y = ' + y + ' ustuni butunlay rost: bitta y barcha x lar uchun yaraydi. Shuning uchun ∃y∀x A(x, y) rost. ',
      eaF: 'Hech bir ustun butunlay rost emas: har bir y uchun A(x, y) yolg‘on bo‘ladigan x bor (to‘q sariq). Shuning uchun ∃y∀x A(x, y) yolg‘on. ',
      exT: (x) => 'x = ' + x + ' satri butunlay rost: bitta x barcha y lar uchun yaraydi. Shuning uchun ∃x∀y A(x, y) rost. ',
      exF: 'Hech bir satr butunlay rost emas. Shuning uchun ∃x∀y A(x, y) yolg‘on. ',
      yeT: 'Har bir y ustunida rost katak bor. Shuning uchun ∀y∃x A(x, y) rost. ',
      yeF: (y) => 'y = ' + y + ' ustunida rost katak yo‘q. Shuning uchun ∀y∃x A(x, y) yolg‘on. ',
      zNote: 'Barcha butun sonlarda (kitobdagidek, 30-bet) ∀x∃y(x + y > 0) rost: x = −3 uchun y = 4 yaraydi. Bizning sohada 3 dan katta son yo‘q — kvantorli mulohaza qiymati sohaga bog‘liq.',
      swap: 'Bir predikatda ∀x∃y va ∃y∀x ni solishtiring: birinchisi rost, ikkinchisi yolg‘on bo‘lishi mumkin, aksincha emas.',
      a: '$A(x)$ predikat',
      b: '$B(x)$ predikat',
      form: 'Yozuv',
      nLabel: '$N$ gacha sonlar',
      preds: { odd: 'toq', even: 'juft', prime: 'tub', div3: '3 ga bo‘linadi', sq: 'to‘liq kvadrat' },
      numsAria: '1 dan N gacha sonlar',
      legendA: 'halqa — A(x) rost',
      legendB: 'bo‘yoq — B(x) rost',
      t1T: (a, b) => 'Qarshi misol yo‘q: ' + a + ' bo‘lgan har bir son ' + b + ' ham. Mulohaza rost. ',
      t1F: (x, a, b) => 'Qarshi misol: ' + x + ' — ' + a + ', lekin ' + b + ' emas. Mulohaza yolg‘on. ',
      t2T: (a, b) => a + ' bo‘lgan hech bir son ' + b + ' emas. Mulohaza rost. ',
      t2F: (x, a, b) => 'Qarshi misol: ' + x + ' — ' + a + ' va ' + b + '. Mulohaza yolg‘on. ',
      t3T: (x, a, b) => 'Guvoh: ' + x + ' — ' + a + ' va ' + b + '. Mulohaza rost. ',
      t3F: (a, b) => 'Bir vaqtda ' + a + ' va ' + b + ' bo‘lgan son yo‘q. Mulohaza yolg‘on. ',
      t4T: (x, a, b) => 'Guvoh: ' + x + ' — ' + a + ', lekin ' + b + ' emas. Mulohaza rost. ',
      t4F: (a, b) => a + ' bo‘lgan har bir son ' + b + ' ham — guvoh yo‘q. Mulohaza yolg‘on. ',
      trapT: (x, a) => 'Tuzoq: ∃x(A(x) → B(x)) rost, chunki ' + x + ' — ' + a + ' emas: asos yolg‘on bo‘lsa, implikatsiya rost. ',
      trapT2: (x) => 'Guvoh: ' + x + ', A(' + x + ') → B(' + x + ') implikatsiya rost. ',
      trapF: 'Barcha sonlarda A(x) rost, B(x) yolg‘on — faqat shunda ∃x(A(x) → B(x)) yolg‘on. ',
      within: (n) => 'Tekshiruv 1…' + n + ' sonlarda; barcha butun sonlarda qiymat boshqacha bo‘lishi mumkin.',
    },
  });

  /* ---------------------------- Рисунок 1: A(x, y) на {−3, …, 3} ---------------------------- */
  const DOM = [-3, -2, -1, 0, 1, 2, 3];
  const PREDS2 = {
    sum: { label: '$x + y > 0$', f: (x, y) => x + y > 0 },
    neg: { label: '$x + y = 0$', f: (x, y) => x + y === 0 },
    lt: { label: '$x < y$', f: (x, y) => x < y },
    le: { label: '$x \\le y$', f: (x, y) => x <= y },
    eq: { label: '$x = y$', f: (x, y) => x === y },
    zero: { label: '$xy = 0$', f: (x, y) => x * y === 0 },
  };
  const PREFIX = {
    AA: '$\\forall x\\forall y$',
    EE: '$\\exists x\\exists y$',
    AE: '$\\forall x\\exists y$',
    EyAx: '$\\exists y\\forall x$',
    EA: '$\\exists x\\forall y$',
    AyEx: '$\\forall y\\exists x$',
  };

  /** Значение приставки и что подсветить: cells — клетки-свидетели (accent), bad — клетки-контрпримеры (warm). */
  function evaluate(f, pre) {
    const val = (x, y) => f(x, y);
    const res = { value: false, cells: [], bad: [], note: '' };
    const s = (v) => U.fmt(v, 0);
    if (pre === 'AA') {
      for (const x of DOM) for (const y of DOM) if (!val(x, y) && !res.bad.length) res.bad.push([x, y]);
      res.value = !res.bad.length;
      res.note = res.value ? T.allT : T.allF(s(res.bad[0][0]), s(res.bad[0][1]));
    } else if (pre === 'EE') {
      for (const x of DOM) for (const y of DOM) if (val(x, y) && !res.cells.length) res.cells.push([x, y]);
      res.value = !!res.cells.length;
      res.note = res.value ? T.anyT(s(res.cells[0][0]), s(res.cells[0][1])) : T.anyF;
    } else if (pre === 'AE') {
      let fail = null;
      for (const x of DOM) {
        const y = DOM.find((v) => val(x, v));
        if (y === undefined) { if (fail === null) fail = x; DOM.forEach((v) => res.bad.push([x, v])); } else res.cells.push([x, y]);
      }
      res.value = fail === null;
      res.note = res.value ? T.aeT : T.aeF(s(fail));
    } else if (pre === 'AyEx') {
      let fail = null;
      for (const y of DOM) {
        const x = DOM.find((v) => val(v, y));
        if (x === undefined) { if (fail === null) fail = y; DOM.forEach((v) => res.bad.push([v, y])); } else res.cells.push([x, y]);
      }
      res.value = fail === null;
      res.note = res.value ? T.yeT : T.yeF(s(fail));
    } else if (pre === 'EyAx') {
      const y = DOM.find((v) => DOM.every((x) => val(x, v)));
      res.value = y !== undefined;
      if (res.value) { DOM.forEach((x) => res.cells.push([x, y])); res.note = T.eaT(s(y)); } else {
        DOM.forEach((v) => res.bad.push([DOM.find((x) => !val(x, v)), v]));
        res.note = T.eaF;
      }
    } else if (pre === 'EA') {
      const x = DOM.find((v) => DOM.every((y) => val(v, y)));
      res.value = x !== undefined;
      if (res.value) { DOM.forEach((y) => res.cells.push([x, y])); res.note = T.exT(s(x)); } else {
        DOM.forEach((v) => res.bad.push([v, DOM.find((y) => !val(v, y))]));
        res.note = T.exF;
      }
    }
    return res;
  }

  MC.widget('quant-grid', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.gridTitle });
    const st = { p: cfg.pred || 'sum', q: cfg.prefix || 'AE' };
    const pSeg = F.seg(Object.keys(PREDS2).map((k) => ({ value: k, label: PREDS2[k].label })), st.p, (v) => { st.p = v; draw(); }, T.pred);
    const qSeg = F.seg(Object.keys(PREFIX).map((k) => ({ value: k, label: PREFIX[k] })), st.q, (v) => { st.q = v; draw(); }, T.prefix);
    fig.controls.append(pSeg.el, qSeg.el);
    const ro = F.readout(fig.readout, [{ key: 'v', label: T.value }]);
    const C = 46;
    const N = DOM.length;
    const size = C * (N + 1);
    let svg = null;

    function draw() {
      const f = PREDS2[st.p].f;
      const r = evaluate(f, st.q);
      const key = (x, y) => x + ':' + y;
      const good = new Set(r.cells.map((c) => key(c[0], c[1])));
      const bad = new Set(r.bad.map((c) => key(c[0], c[1])));
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = size + 'px';
      svg.appendChild(S('text', { class: 'cv corner', x: C / 2, y: C / 2, style: 'font-size: 14px' }, T.corner));
      DOM.forEach((v, i) => {
        svg.appendChild(S('text', { class: 'cv ch', x: C * (i + 1) + C / 2, y: C / 2 }, U.fmt(v, 0)));
        svg.appendChild(S('text', { class: 'cv ch', x: C / 2, y: C * (i + 1) + C / 2 }, U.fmt(v, 0)));
      });
      DOM.forEach((x, i) => {
        DOM.forEach((y, j) => {
          const v = f(x, y);
          const k = key(x, y);
          const rect = S('rect', { class: 'cell', x: C * (j + 1) + 2, y: C * (i + 1) + 2, width: C - 4, height: C - 4, rx: 4 });
          if (good.has(k)) rect.style.fill = 'var(--accent-soft)';
          else if (bad.has(k)) rect.style.fill = 'var(--warm-soft)';
          if (good.has(k)) { rect.style.stroke = 'var(--accent)'; rect.style.strokeWidth = '2'; }
          svg.appendChild(rect);
          const t = S('text', { class: 'cv', x: C * (j + 1) + C / 2, y: C * (i + 1) + C / 2 }, v ? T.T : T.F);
          t.style.fontSize = '17px';
          if (!v) t.style.fill = 'var(--fg3)';
          svg.appendChild(t);
        });
      });
      fig.plot.appendChild(svg);
      ro.set('v', r.value ? T.T : T.F, r.value ? 'accent' : 'warm');
      let note = r.note;
      if (st.p === 'sum' && st.q === 'AE') note += T.zNote;
      else if (st.q === 'AE' || st.q === 'EyAx') note += T.swap;
      fig.note.textContent = note;
    }
    draw();
  });

  /* ------------------------- Рисунок 2: четыре типа высказываний ------------------------- */
  const isPrime = (n) => {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  };
  const PREDS1 = {
    odd: (n) => n % 2 === 1,
    even: (n) => n % 2 === 0,
    prime: isPrime,
    div3: (n) => n % 3 === 0,
    sq: (n) => Number.isInteger(Math.sqrt(n)),
  };
  const FORMS = {
    t1: '$\\forall x(A(x) \\to B(x))$',
    t2: '$\\forall x(A(x) \\to \\rceil B(x))$',
    t3: '$\\exists x(A(x) \\wedge B(x))$',
    t4: '$\\exists x(A(x) \\wedge \\rceil B(x))$',
    trap: '$\\exists x(A(x) \\to B(x))$',
  };

  MC.widget('quant-types', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.typesTitle });
    const st = { a: cfg.a || 'odd', b: cfg.b || 'prime', form: cfg.form || 't1', n: cfg.n || 20 };
    const predOpts = Object.keys(PREDS1).map((k) => ({ value: k, label: T.preds[k] }));
    const aSeg = F.seg(predOpts, st.a, (v) => { st.a = v; draw(); }, T.a.replace(/\$/g, ''));
    const bSeg = F.seg(predOpts, st.b, (v) => { st.b = v; draw(); }, T.b.replace(/\$/g, ''));
    const fSeg = F.seg(Object.keys(FORMS).map((k) => ({ value: k, label: FORMS[k] })), st.form, (v) => { st.form = v; draw(); }, T.form);
    const nS = F.slider({ label: T.nLabel, min: 5, max: 40, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => { st.n = Math.round(v); draw(); } });
    const lab = (t, c) => H('div', { class: 'ctl' }, H('span', null, F.rich(t)), c);
    fig.controls.append(lab(T.a, aSeg.el), lab(T.b, bSeg.el), fSeg.el, nS.el);
    const ro = F.readout(fig.readout, [{ key: 'v', label: T.value }]);
    const legend = H('p', { class: 'figcaption', style: { textAlign: 'center', margin: '0' } });
    fig.plot.append(legend);
    let svg = null;

    function draw() {
      const A = PREDS1[st.a];
      const B = PREDS1[st.b];
      const nums = Array.from({ length: st.n }, (_, i) => i + 1);
      const an = T.preds[st.a];
      const bn = T.preds[st.b];
      let value;
      let mark = null;
      let note;
      if (st.form === 't1') {
        mark = nums.find((x) => A(x) && !B(x));
        value = mark === undefined;
        note = value ? T.t1T(an, bn) : T.t1F(mark, an, bn);
      } else if (st.form === 't2') {
        mark = nums.find((x) => A(x) && B(x));
        value = mark === undefined;
        note = value ? T.t2T(an, bn) : T.t2F(mark, an, bn);
      } else if (st.form === 't3') {
        mark = nums.find((x) => A(x) && B(x));
        value = mark !== undefined;
        note = value ? T.t3T(mark, an, bn) : T.t3F(an, bn);
      } else if (st.form === 't4') {
        mark = nums.find((x) => A(x) && !B(x));
        value = mark !== undefined;
        note = value ? T.t4T(mark, an, bn) : T.t4F(an, bn);
      } else {
        const vac = nums.find((x) => !A(x));
        mark = vac !== undefined ? vac : nums.find((x) => B(x));
        value = mark !== undefined;
        note = !value ? T.trapF : vac !== undefined ? T.trapT(vac, an) : T.trapT2(mark);
      }
      const witness = st.form === 't3' || st.form === 't4' || st.form === 'trap';
      const per = fig.plot.clientWidth && fig.plot.clientWidth < 480 ? 5 : 10;
      const C = 42;
      const rows = Math.ceil(nums.length / per);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + per * C + ' ' + rows * C, role: 'img', 'aria-label': T.numsAria });
      svg.style.maxWidth = per * C + 'px';
      nums.forEach((x, i) => {
        const cx = (i % per) * C + C / 2;
        const cy = Math.floor(i / per) * C + C / 2;
        const on = mark === x;
        if (on) svg.appendChild(S('circle', { cx, cy, r: C / 2 - 1, style: 'fill: none; stroke-width: 3; stroke: ' + (witness ? 'var(--accent)' : 'var(--warm)') }));
        svg.appendChild(S('circle', { cx, cy, r: C / 2 - 6, style: 'fill: ' + (B(x) ? 'var(--bg3)' : 'none') + '; stroke-width: 2; stroke: ' + (A(x) ? 'var(--fg2)' : 'var(--line)') }));
        const t = S('text', { class: 'cv', x: cx, y: cy }, String(x));
        t.style.fontSize = '16px';
        if (!A(x) && !B(x)) t.style.fill = 'var(--fg3)';
        svg.appendChild(t);
      });
      fig.plot.insertBefore(svg, legend);
      legend.textContent = T.legendA + ' · ' + T.legendB;
      ro.set('v', value ? T.T : T.F, value ? 'accent' : 'warm');
      fig.note.textContent = note + T.within(st.n);
    }
    draw();
  });
})();
