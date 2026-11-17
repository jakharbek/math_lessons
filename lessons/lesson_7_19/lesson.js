/* Урок 7.19 «Отношение порядка на множестве натуральных чисел» (Куликов, гл. 4, § 3).
 * Рисунок 1 «order-line»: определение a < b через «a + k = b, k ≠ 0», закон трихотомии и монотонность
 * (теорема 3.8, следствие 3.9) на числовой прямой.
 * Рисунок 2 «well-order»: доказательство теоремы 3.11 по шагам — формула A(b): a ∈ A → b ≤ a
 * верна, пока b не превысит наименьший элемент множества A. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Порядок на $\\mathbf{N}$: $a < b$, если $a + k = b$ и $k \\ne 0$',
      t2: 'Наименьший элемент: индукция по $b$ из доказательства теоремы 3.11',
      op: 'Действие',
      add: '$+\\,c$',
      mul: '$\\cdot\\,c$',
      rel: 'отношение',
      k: 'разность $k$',
      after: 'после действия',
      lessW: 'меньше',
      eqW: 'равно',
      moreW: 'больше',
      top: 'исходные числа',
      bottom: (add, c) => (add ? 'прибавили c = ' : 'умножили на c = ') + c,
      aria1: 'Числовая прямая с числами a и b',
      lessNote: (a, b, k) => 'a = ' + a + ', b = ' + b + ': число k = ' + k + ' ≠ 0 и a + k = ' + a + ' + ' + k + ' = ' + b + ' = b, поэтому a < b (определение). ',
      eqNote: (a) => 'a = b = ' + a + ': подходит только k = 0, а определение требует k ≠ 0, поэтому a < b неверно; верно a ≤ b и a ≥ b. ',
      moreNote: (a, b, k) => 'a = ' + a + ', b = ' + b + ': b + ' + k + ' = a и ' + k + ' ≠ 0, поэтому b < a, т. е. a > b. ',
      tri: 'Выполняется ровно одно из трёх: a < b, a = b, a > b (теорема 3.2). ',
      addKeep: (c) => 'Прибавили c = ' + c + ': разность k не изменилась, знак сохранился — теорема 3.8 (1). ',
      mulKeep: (c, k) => 'Умножили на c = ' + c + ' ≠ 0: разность стала k·c = ' + k + ' ≠ 0, знак сохранился — теорема 3.8 (2). ',
      mulZero: 'Умножили на c = 0: оба числа стали 0. Строгое неравенство не сохранилось — поэтому в теореме 3.8 (2) условие c ≠ 0; нестрогое 0 ≤ 0 верно — следствие 3.9 (2).',
      mulEq: (c) => 'Умножили на c = ' + c + ': равные числа остались равными.',
      mulKeepEq: '',
      ka: 'k',
      none: '—',
      A: 'Множество $A$',
      step: 'Шаг b → b + 1',
      reset: 'Сначала',
      min: 'наименьший в $A$',
      bLabel: '$b$',
      Ab: '$A(b)$',
      yes: 'истинна',
      no: 'ложна',
      presets: { prime: 'простые', sq: '$\\{9, 16, 25\\}$', m7: 'кратные 7, $\\ne 0$', empty: '$\\varnothing$' },
      aria2: 'Числа от 0 до 29; выделены элементы множества A',
      cellAria: (n, inA) => 'Число ' + n + (inA ? ', входит в A' : ', не входит в A'),
      start: (b) => 'b = ' + b + '. Формула A(b): «для любого a: если a ∈ A, то b ≤ a». ',
      holds: (b) => 'A(' + b + ') истинна: все элементы A не меньше ' + b + '. ',
      notIn: (b) => 'Число ' + b + ' не входит в A — значит, все элементы A строго больше ' + b + ' и A(' + (b + 1) + ') тоже будет истинна. ',
      isMin: (b) => 'Число ' + b + ' входит в A, и все элементы A не меньше его: ' + b + ' — наименьший элемент A. В доказательстве Куликова (A без наименьшего) этот случай невозможен — отсюда «n ∉ A». ',
      fails: (b, m) => 'A(' + b + ') ложна: m = ' + m + ' ∈ A, но ' + b + ' ≤ ' + m + ' неверно. Если бы у A не было наименьшего элемента, шаг индукции не оборвался бы, и при b = m + 1 получилось бы m + 1 ≤ m — противоречие.',
      emptyNote: 'A = ∅: формула A(b) истинна при любом b (посылка «a ∈ A» всегда ложна). Противоречия нет — поэтому теорема 3.11 говорит только о непустых подмножествах.',
      hint: 'Нажимайте на числа, чтобы менять A.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Order on $\\mathbf{N}$: $a < b$ if $a + k = b$ and $k \\ne 0$',
      t2: 'The least element: induction on $b$ from the proof of Theorem 3.11',
      op: 'Operation',
      add: '$+\\,c$',
      mul: '$\\cdot\\,c$',
      rel: 'relation',
      k: 'difference $k$',
      after: 'after the operation',
      lessW: 'less',
      eqW: 'equal',
      moreW: 'greater',
      top: 'original numbers',
      bottom: (add, c) => (add ? 'added c = ' : 'multiplied by c = ') + c,
      aria1: 'Number line with a and b',
      lessNote: (a, b, k) => 'a = ' + a + ', b = ' + b + ': k = ' + k + ' ≠ 0 and a + k = ' + a + ' + ' + k + ' = ' + b + ' = b, so a < b (definition). ',
      eqNote: (a) => 'a = b = ' + a + ': only k = 0 works, but the definition requires k ≠ 0, so a < b is false; a ≤ b and a ≥ b hold. ',
      moreNote: (a, b, k) => 'a = ' + a + ', b = ' + b + ': b + ' + k + ' = a and ' + k + ' ≠ 0, so b < a, i.e. a > b. ',
      tri: 'Exactly one of a < b, a = b, a > b holds (Theorem 3.2). ',
      addKeep: (c) => 'Added c = ' + c + ': the difference k is unchanged, the sign is kept — Theorem 3.8 (1). ',
      mulKeep: (c, k) => 'Multiplied by c = ' + c + ' ≠ 0: the difference became k·c = ' + k + ' ≠ 0, the sign is kept — Theorem 3.8 (2). ',
      mulZero: 'Multiplied by c = 0: both numbers became 0. The strict inequality is lost — hence the condition c ≠ 0 in Theorem 3.8 (2); the non-strict 0 ≤ 0 holds — Corollary 3.9 (2).',
      mulEq: (c) => 'Multiplied by c = ' + c + ': equal numbers stay equal.',
      mulKeepEq: '',
      ka: 'k',
      none: '—',
      A: 'Set $A$',
      step: 'Step b → b + 1',
      reset: 'Restart',
      min: 'least in $A$',
      bLabel: '$b$',
      Ab: '$A(b)$',
      yes: 'true',
      no: 'false',
      presets: { prime: 'primes', sq: '$\\{9, 16, 25\\}$', m7: 'multiples of 7, $\\ne 0$', empty: '$\\varnothing$' },
      aria2: 'Numbers 0 to 29; elements of A are highlighted',
      cellAria: (n, inA) => 'Number ' + n + (inA ? ', in A' : ', not in A'),
      start: (b) => 'b = ' + b + '. Formula A(b): “for every a: if a ∈ A, then b ≤ a”. ',
      holds: (b) => 'A(' + b + ') is true: all elements of A are at least ' + b + '. ',
      notIn: (b) => b + ' is not in A, so all elements of A are greater than ' + b + ' and A(' + (b + 1) + ') will be true as well. ',
      isMin: (b) => b + ' is in A and no element of A is smaller: ' + b + ' is the least element of A. In Kulikov’s proof (A without a least element) this case is impossible — hence “n ∉ A”. ',
      fails: (b, m) => 'A(' + b + ') is false: m = ' + m + ' ∈ A, but ' + b + ' ≤ ' + m + ' fails. If A had no least element, the induction would never break, and b = m + 1 would give m + 1 ≤ m — a contradiction.',
      emptyNote: 'A = ∅: A(b) is true for every b (the premise “a ∈ A” is always false). No contradiction — that is why Theorem 3.11 speaks only of non-empty subsets.',
      hint: 'Click numbers to change A.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: '$\\mathbf{N}$ dagi tartib: $a + k = b$ va $k \\ne 0$ bo‘lsa, $a < b$',
      t2: 'Eng kichik element: 3.11-teorema isbotidagi $b$ bo‘yicha induksiya',
      op: 'Amal',
      add: '$+\\,c$',
      mul: '$\\cdot\\,c$',
      rel: 'munosabat',
      k: '$k$ ayirma',
      after: 'amaldan keyin',
      lessW: 'kichik',
      eqW: 'teng',
      moreW: 'katta',
      top: 'boshlang‘ich sonlar',
      bottom: (add, c) => (add ? 'c = ' + c + ' qo‘shildi' : 'c = ' + c + ' ga ko‘paytirildi'),
      aria1: 'a va b sonlari belgilangan son o‘qi',
      lessNote: (a, b, k) => 'a = ' + a + ', b = ' + b + ': k = ' + k + ' ≠ 0 va a + k = ' + a + ' + ' + k + ' = ' + b + ' = b, demak a < b (ta’rif). ',
      eqNote: (a) => 'a = b = ' + a + ': faqat k = 0 mos keladi, ta’rif esa k ≠ 0 ni talab qiladi, shuning uchun a < b noto‘g‘ri; a ≤ b va a ≥ b to‘g‘ri. ',
      moreNote: (a, b, k) => 'a = ' + a + ', b = ' + b + ': b + ' + k + ' = a va ' + k + ' ≠ 0, demak b < a, ya’ni a > b. ',
      tri: 'a < b, a = b, a > b dan aynan bittasi bajariladi (3.2-teorema). ',
      addKeep: (c) => 'c = ' + c + ' qo‘shildi: k ayirma o‘zgarmadi, belgi saqlandi — 3.8-teorema (1). ',
      mulKeep: (c, k) => 'c = ' + c + ' ≠ 0 ga ko‘paytirildi: ayirma k·c = ' + k + ' ≠ 0 bo‘ldi, belgi saqlandi — 3.8-teorema (2). ',
      mulZero: 'c = 0 ga ko‘paytirildi: ikkala son 0 bo‘ldi. Qat’iy tengsizlik saqlanmadi — shuning uchun 3.8-teorema (2) da c ≠ 0 sharti bor; noqat’iy 0 ≤ 0 to‘g‘ri — 3.9-natija (2).',
      mulEq: (c) => 'c = ' + c + ' ga ko‘paytirildi: teng sonlar teng qoldi.',
      mulKeepEq: '',
      ka: 'k',
      none: '—',
      A: '$A$ to‘plam',
      step: 'Qadam b → b + 1',
      reset: 'Boshidan',
      min: '$A$ dagi eng kichik',
      bLabel: '$b$',
      Ab: '$A(b)$',
      yes: 'rost',
      no: 'yolg‘on',
      presets: { prime: 'tub sonlar', sq: '$\\{9, 16, 25\\}$', m7: '7 ga karrali, $\\ne 0$', empty: '$\\varnothing$' },
      aria2: '0 dan 29 gacha sonlar; A ning elementlari ajratilgan',
      cellAria: (n, inA) => n + ' soni' + (inA ? ', A ga tegishli' : ', A ga tegishli emas'),
      start: (b) => 'b = ' + b + '. A(b) formula: «har qanday a uchun: agar a ∈ A bo‘lsa, b ≤ a». ',
      holds: (b) => 'A(' + b + ') rost: A ning barcha elementlari ' + b + ' dan kichik emas. ',
      notIn: (b) => b + ' soni A ga tegishli emas, demak A ning barcha elementlari ' + b + ' dan katta va A(' + (b + 1) + ') ham rost bo‘ladi. ',
      isMin: (b) => b + ' soni A ga tegishli va A da undan kichik element yo‘q: ' + b + ' — A ning eng kichik elementi. Kulikov isbotida (eng kichik elementsiz A) bu hol mumkin emas — shuning uchun «n ∉ A». ',
      fails: (b, m) => 'A(' + b + ') yolg‘on: m = ' + m + ' ∈ A, lekin ' + b + ' ≤ ' + m + ' noto‘g‘ri. Agar A da eng kichik element bo‘lmaganida, induksiya uzilmas edi va b = m + 1 da m + 1 ≤ m — ziddiyat hosil bo‘lardi.',
      emptyNote: 'A = ∅: A(b) har qanday b da rost («a ∈ A» sharti doim yolg‘on). Ziddiyat yo‘q — shuning uchun 3.11-teorema faqat bo‘sh bo‘lmagan qism to‘plamlar haqida.',
      hint: 'A ni o‘zgartirish uchun sonlarni bosing.',
    },
  });

  /* ---------- Рисунок 1: числовая прямая ---------- */
  MC.widget('order-line', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { a: cfg.a ?? 3, b: cfg.b ?? 7, c: cfg.c ?? 2, op: cfg.op || 'add' };
    const sa = F.slider({ label: '$a$', min: 0, max: 12, step: 1, value: st.a, fmt: (v) => String(Math.round(v)), oninput: (v) => { st.a = Math.round(v); draw(); } });
    const sb = F.slider({ label: '$b$', min: 0, max: 12, step: 1, value: st.b, fmt: (v) => String(Math.round(v)), oninput: (v) => { st.b = Math.round(v); draw(); } });
    const sc = F.slider({ label: '$c$', min: 0, max: 5, step: 1, value: st.c, fmt: (v) => String(Math.round(v)), oninput: (v) => { st.c = Math.round(v); draw(); } });
    const opSeg = F.seg([{ value: 'add', label: T.add }, { value: 'mul', label: T.mul }], st.op, (v) => { st.op = v; draw(); }, T.op);
    fig.controls.append(sa.el, sb.el, sc.el, opSeg.el);
    const ro = F.readout(fig.readout, [
      { key: 'rel', label: T.rel },
      { key: 'k', label: T.k },
      { key: 'after', label: T.after },
    ]);
    const H = 230;
    const L = 30;
    let W = 720;
    let R = W - 30;
    const width = () => Math.max(320, Math.min(720, Math.round(fig.plot.clientWidth || 720)));
    const svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria1 });
    fig.plot.appendChild(svg);
    const relSign = (x, y) => (x < y ? '<' : x === y ? '=' : '>');

    function line(y, max, x, xName, z, zName, caption) {
      const step = max <= 20 ? 1 : 5;
      const X = (v) => L + ((R - L) * v) / max;
      const gap = ((R - L) * step) / max;
      const every = gap >= 28 ? 1 : gap >= 14 ? 2 : 4;
      svg.appendChild(S('line', { class: 'axis', x1: L, y1: y, x2: R, y2: y }));
      for (let v = 0; v <= max; v += step) {
        svg.appendChild(S('line', { class: 'axis', x1: X(v), y1: y - 4, x2: X(v), y2: y + 4 }));
        if ((v / step) % every === 0 || (step === 1 && max <= 12 && every === 1)) svg.appendChild(S('text', { class: 'tick-label', x: X(v), y: y + 20, 'text-anchor': 'middle' }, String(v)));
      }
      svg.appendChild(S('text', { x: L, y: y - 46 }, caption));
      if (x !== z) {
        const lo = Math.min(x, z);
        const hi = Math.max(x, z);
        const yy = y - 22;
        svg.appendChild(S('path', { class: 'arrow accent', d: 'M' + X(lo) + ',' + yy + ' L' + X(hi) + ',' + yy + ' M' + (X(hi) - 7) + ',' + (yy - 5) + ' L' + X(hi) + ',' + yy + ' L' + (X(hi) - 7) + ',' + (yy + 5) }));
        svg.appendChild(S('text', { class: 'lbl accent', x: (X(lo) + X(hi)) / 2, y: yy - 7, 'text-anchor': 'middle' }, 'k = ' + (hi - lo)));
      }
      svg.appendChild(S('circle', { class: 'dot accent', cx: X(x), cy: y, r: 7 }));
      svg.appendChild(S('circle', { class: 'dot warm', cx: X(z), cy: y, r: x === z ? 4 : 7 }));
      const same = x === z;
      svg.appendChild(S('text', { class: 'lbl accent', x: X(x) - (same ? 10 : 0), y: y + 40, 'text-anchor': 'middle' }, xName));
      svg.appendChild(S('text', { class: 'lbl warm', x: X(z) + (same ? 10 : 0), y: y + 40, 'text-anchor': 'middle' }, zName));
    }

    function draw() {
      W = width();
      R = W - 30;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.replaceChildren();
      const { a, b, c } = st;
      const add = st.op === 'add';
      const a2 = add ? a + c : a * c;
      const b2 = add ? b + c : b * c;
      line(80, 12, a, 'a', b, 'b', T.top);
      const max2 = add ? 20 : 60;
      line(190, max2, a2, add ? 'a+c' : 'ac', b2, add ? 'b+c' : 'bc', T.bottom(add, c));
      ro.set('rel', 'a ' + relSign(a, b) + ' b', a === b ? '' : 'accent');
      ro.set('k', a === b ? '0' : String(Math.abs(b - a)));
      ro.set('after', String(a2) + ' ' + relSign(a2, b2) + ' ' + String(b2), relSign(a, b) === relSign(a2, b2) ? 'accent' : 'warm');
      let s = a < b ? T.lessNote(a, b, b - a) : a === b ? T.eqNote(a) : T.moreNote(a, b, a - b);
      s += T.tri;
      if (add) s += T.addKeep(c);
      else if (a === b) s += T.mulEq(c);
      else if (c === 0) s += T.mulZero;
      else s += T.mulKeep(c, Math.abs(b - a) * c);
      fig.note.textContent = s;
    }
    draw();
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (width() !== W) draw();
      }, 150);
    });
  });

  /* ---------- Рисунок 2: наименьший элемент и индукция по b ---------- */
  const N = 30;
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
  const PRESETS = { prime: PRIMES, sq: [9, 16, 25], m7: [7, 14, 21, 28], empty: [] };

  /** Состояние шага b для множества A (массив чисел): истинна ли A(b) и почему. */
  function stepInfo(A, b) {
    const m = A.length ? Math.min(...A) : null;
    const holds = A.every((a) => b <= a);
    return { m, holds, inA: A.includes(b) };
  }

  MC.widget('well-order', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { A: new Set(PRESETS[cfg.preset || 'sq']), b: 0, preset: cfg.preset || 'sq' };
    const pSeg = F.seg(Object.keys(PRESETS).map((k) => ({ value: k, label: T.presets[k] })), st.preset, (v) => {
      st.preset = v;
      st.A = new Set(PRESETS[v]);
      st.b = 0;
      draw();
    }, T.A);
    const bStep = F.button(null, T.step, () => {
      const info = stepInfo([...st.A], st.b);
      if (info.holds && st.b < N) st.b += 1;
      draw();
    });
    const bReset = F.button(null, T.reset, () => {
      st.b = 0;
      draw();
    });
    fig.controls.append(pSeg.el, bStep, bReset);
    const ro = F.readout(fig.readout, [
      { key: 'min', label: T.min },
      { key: 'b', label: T.bLabel },
      { key: 'Ab', label: T.Ab },
    ]);
    const C = 64;
    const COLS = 10;
    const W = C * COLS;
    const Hh = C * Math.ceil(N / COLS);
    const svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': T.aria2 });
    svg.style.maxWidth = W + 'px';
    fig.plot.appendChild(svg);

    function draw() {
      svg.replaceChildren();
      const A = [...st.A].sort((x, y) => x - y);
      const info = stepInfo(A, st.b);
      for (let n = 0; n < N; n++) {
        const x = (n % COLS) * C;
        const y = Math.floor(n / COLS) * C;
        const inA = st.A.has(n);
        const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(n, inA) });
        const r = S('rect', { class: 'cell' + (n === st.b ? ' on' : '') + (!info.holds && n === info.m ? ' bad' : ''), x: x + 3, y: y + 3, width: C - 6, height: C - 6, rx: 4 });
        const bad = !info.holds && n === info.m;
        if (bad) r.style.stroke = 'var(--err)';
        else if (inA) r.style.fill = 'var(--accent-soft)';
        else if (n < st.b) r.style.fill = 'var(--bg3)';
        g.appendChild(r);
        const t = S('text', { class: 'cv' + (!info.holds && n === info.m ? ' bad' : ''), x: x + C / 2, y: y + C / 2 }, String(n));
        t.style.fontSize = '22px';
        if (inA && info.holds) t.style.fill = 'var(--accent)';
        if (!inA && n < st.b) t.style.fill = 'var(--fg4)';
        g.appendChild(t);
        const toggle = () => {
          if (st.A.has(n)) st.A.delete(n);
          else st.A.add(n);
          st.preset = null;
          pSeg.set(null);
          draw();
        };
        g.addEventListener('click', toggle);
        g.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            toggle();
          }
        });
        svg.appendChild(g);
      }
      ro.set('min', info.m === null ? T.none : String(info.m), 'accent');
      ro.set('b', String(st.b));
      ro.set('Ab', info.holds ? T.yes : T.no, info.holds ? 'accent' : 'warm');
      let s = T.start(st.b);
      if (!A.length) s += T.emptyNote;
      else if (!info.holds) s += T.fails(st.b, info.m);
      else {
        s += T.holds(st.b);
        s += info.inA ? T.isMin(st.b) : T.notIn(st.b);
      }
      fig.note.textContent = s + ' ' + T.hint;
    }
    draw();
  });

  if (typeof module !== 'undefined') module.exports = { stepInfo, PRESETS };
})();
