/* Урок 7.18 «Свойства сложения и умножения натуральных чисел» (Куликов, гл. 4, § 2):
 * рисунок «Счёт по аксиомам» — сумма m + n и произведение m · n, вычисленные шаг за шагом
 * только по рекурсивным аксиомам III, IV (сложение) и V, VI (умножение) из § 1. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;
  const H = MC.h;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      titleAdd: 'Сложение по аксиомам: $m + n$ шаг за шагом',
      titleMul: 'Умножение по аксиомам: $m \\cdot n$ шаг за шагом',
      m: 'Число $m$',
      n: 'Число $n$',
      step: 'Шаг',
      all: 'Всё сразу',
      reset: 'Сначала',
      k: 'вычислено до',
      value: 'значение',
      uses: 'применений аксиом',
      axiom: (a) => 'аксиома ' + a,
      start: (op, m, n) => 'Считаем $' + m + ' ' + op + ' ' + n + '$. Нажмите «Шаг»: каждый шаг применяет одну аксиому и увеличивает второе слагаемое (сомножитель) на 1.',
      doneAdd: (m, n, v) => 'Готово: $' + m + ' + ' + n + ' = ' + v + '$. Понадобилось ' + (n + 1) + ' применений аксиом (одно — III, остальные — IV): ровно столько, сколько раз к $' + m + '$ прибавляли единицу, плюс начальный шаг.',
      doneMul: (m, n, v) => 'Готово: $' + m + ' \\cdot ' + n + ' = ' + v + '$ — это $' + n + '$ слагаемых, равных $' + m + '$ (аксиома V один раз, аксиома VI — ' + n + ' раз). На сетке — ' + n + ' рядов по ' + m + ' точек.',
      midAdd: (m, k) => 'Аксиома IV сводит $' + m + ' + ' + (k + 1) + '$ к уже найденной сумме $' + m + ' + ' + k + '$ и прибавляет 1 — новая точка справа.',
      midMul: (m, k) => 'Аксиома VI сводит $' + m + ' \\cdot ' + (k + 1) + '$ к уже найденному $' + m + ' \\cdot ' + k + '$ и прибавляет ещё одно $' + m + '$ — новый ряд точек.',
      aria: 'Точки: число m и добавленные единицы',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      titleAdd: 'Addition from the axioms: $m + n$ step by step',
      titleMul: 'Multiplication from the axioms: $m \\cdot n$ step by step',
      m: 'Number $m$',
      n: 'Number $n$',
      step: 'Step',
      all: 'All at once',
      reset: 'Reset',
      k: 'computed up to',
      value: 'value',
      uses: 'axiom applications',
      axiom: (a) => 'axiom ' + a,
      start: (op, m, n) => 'We compute $' + m + ' ' + op + ' ' + n + '$. Press “Step”: each step applies one axiom and increases the second argument by 1.',
      doneAdd: (m, n, v) => 'Done: $' + m + ' + ' + n + ' = ' + v + '$. It took ' + (n + 1) + ' axiom applications (one of III, the rest of IV).',
      doneMul: (m, n, v) => 'Done: $' + m + ' \\cdot ' + n + ' = ' + v + '$ — that is $' + n + '$ summands equal to $' + m + '$ (axiom V once, axiom VI ' + n + ' times). The grid shows ' + n + ' rows of ' + m + ' dots.',
      midAdd: (m, k) => 'Axiom IV reduces $' + m + ' + ' + (k + 1) + '$ to the sum $' + m + ' + ' + k + '$ already found and adds 1 — a new dot on the right.',
      midMul: (m, k) => 'Axiom VI reduces $' + m + ' \\cdot ' + (k + 1) + '$ to $' + m + ' \\cdot ' + k + '$ already found and adds one more $' + m + '$ — a new row of dots.',
      aria: 'Dots: the number m and the added ones',
    },
    uz: {
      fig: (n) => n + '-rasm',
      titleAdd: 'Aksiomalar bo‘yicha qo‘shish: $m + n$ qadamma-qadam',
      titleMul: 'Aksiomalar bo‘yicha ko‘paytirish: $m \\cdot n$ qadamma-qadam',
      m: '$m$ soni',
      n: '$n$ soni',
      step: 'Qadam',
      all: 'Hammasi birdan',
      reset: 'Boshidan',
      k: 'hisoblangan',
      value: 'qiymat',
      uses: 'aksioma qo‘llanishlari',
      axiom: (a) => a + '-aksioma',
      start: (op, m, n) => '$' + m + ' ' + op + ' ' + n + '$ ni hisoblaymiz. «Qadam» tugmasini bosing: har bir qadam bitta aksiomani qo‘llaydi va ikkinchi argumentni 1 ga oshiradi.',
      doneAdd: (m, n, v) => 'Tayyor: $' + m + ' + ' + n + ' = ' + v + '$. ' + (n + 1) + ' marta aksioma qo‘llandi (bir marta III, qolganlari IV).',
      doneMul: (m, n, v) => 'Tayyor: $' + m + ' \\cdot ' + n + ' = ' + v + '$ — bu $' + m + '$ ga teng $' + n + '$ ta qo‘shiluvchi (V aksioma bir marta, VI aksioma ' + n + ' marta).',
      midAdd: (m, k) => 'IV aksioma $' + m + ' + ' + (k + 1) + '$ ni topilgan $' + m + ' + ' + k + '$ yig‘indiga keltiradi va 1 qo‘shadi.',
      midMul: (m, k) => 'VI aksioma $' + m + ' \\cdot ' + (k + 1) + '$ ni topilgan $' + m + ' \\cdot ' + k + '$ ga keltiradi va yana bitta $' + m + '$ qo‘shadi.',
      aria: 'Nuqtalar: m soni va qo‘shilgan birlar',
    },
  });

  /** Строки вычисления по аксиомам: [{tex, axiom, value}] для k = 0…n. */
  function rows(op, m, n) {
    const out = [];
    let v = 0;
    for (let k = 0; k <= n; k++) {
      if (op === 'add') {
        if (k === 0) {
          v = m;
          out.push({ tex: m + ' + 0 = ' + m, axiom: 'III', value: v });
        } else {
          const prev = v;
          v = prev + 1;
          out.push({ tex: m + ' + ' + k + ' = ' + m + ' + (' + (k - 1) + ' + 1) = (' + m + ' + ' + (k - 1) + ') + 1 = ' + prev + ' + 1 = ' + v, axiom: 'IV', value: v });
        }
      } else if (k === 0) {
        v = 0;
        out.push({ tex: m + ' \\cdot 0 = 0', axiom: 'V', value: 0 });
      } else {
        const prev = v;
        v = prev + m;
        out.push({ tex: m + ' \\cdot ' + k + ' = ' + m + ' \\cdot (' + (k - 1) + ' + 1) = ' + m + ' \\cdot ' + (k - 1) + ' + ' + m + ' = ' + prev + ' + ' + m + ' = ' + v, axiom: 'VI', value: v });
      }
    }
    return out;
  }

  MC.widget('peano-calc', (el, cfg) => {
    const op = cfg.op === 'mul' ? 'mul' : 'add';
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: op === 'add' ? T.titleAdd : T.titleMul });
    const st = { m: cfg.m != null ? cfg.m : 5, n: cfg.n != null ? cfg.n : 3, k: -1 };
    const intFmt = (v) => String(Math.round(v));
    const mS = F.slider({ label: T.m, min: 0, max: 9, step: 1, value: st.m, fmt: intFmt, oninput: (v) => { st.m = Math.round(v); st.k = -1; draw(); } });
    const nS = F.slider({ label: T.n, min: 0, max: 9, step: 1, value: st.n, fmt: intFmt, oninput: (v) => { st.n = Math.round(v); st.k = -1; draw(); } });
    const bStep = F.button(null, T.step, () => { if (st.k < st.n) { st.k += 1; draw(); } });
    const bAll = F.button(null, T.all, () => { st.k = st.n; draw(); });
    const bReset = F.button(null, T.reset, () => { st.k = -1; draw(); });
    fig.controls.append(mS.el, nS.el, bStep, bAll, bReset);
    const ro = F.readout(fig.readout, [
      { key: 'k', label: T.k },
      { key: 'v', label: T.value },
      { key: 'u', label: T.uses },
    ]);
    const sym = op === 'add' ? '+' : '\\cdot';

    function dots(list) {
      const R = 8;
      const G = 22;
      const done = st.k >= 0 ? list[st.k].value : null;
      let w;
      let h;
      const items = [];
      if (op === 'add') {
        const total = st.m + Math.max(st.k, 0);
        w = Math.max(G * (st.m + st.n) + 16, 200);
        h = 2 * R + 16;
        for (let i = 0; i < st.m + st.n; i++) {
          const filled = i < st.m || (st.k > 0 && i < total);
          const fresh = i >= st.m && i < total;
          items.push({ x: 8 + R + i * G, y: 8 + R, filled: filled && st.k >= 0, accent: fresh });
        }
      } else {
        w = Math.max(G * Math.max(st.m, 1) + 16, 200);
        h = G * Math.max(st.n, 1) + 16;
        for (let r = 0; r < st.n; r++) {
          for (let c = 0; c < st.m; c++) {
            items.push({ x: 8 + R + c * G, y: 8 + R + r * G, filled: st.k > r, accent: st.k === r + 1 });
          }
        }
      }
      const svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.aria });
      svg.style.maxWidth = w + 'px';
      for (const d of items) {
        const c = S('circle', { cx: d.x, cy: d.y, r: R });
        c.style.fill = d.filled ? (d.accent ? 'var(--accent)' : 'var(--fg)') : 'none';
        c.style.stroke = d.accent && d.filled ? 'var(--accent)' : 'var(--curve)';
        c.style.strokeWidth = '1.5';
        svg.appendChild(c);
      }
      return { svg, done };
    }

    function draw() {
      const list = rows(op, st.m, st.n);
      fig.plot.replaceChildren();
      const { svg, done } = dots(list);
      fig.plot.appendChild(svg);
      const ol = H('div', { class: 'peano-steps' });
      list.forEach((r, i) => {
        if (i > st.k) return;
        const line = H('p', null, F.rich('$' + r.tex + '$ — ' + T.axiom(r.axiom)));
        line.style.margin = '4px 0';
        line.style.fontSize = '15px';
        if (i === st.k) line.style.color = 'var(--accent)';
        ol.appendChild(line);
      });
      fig.plot.appendChild(ol);
      ro.set('k', st.k < 0 ? '—' : (op === 'add' ? st.m + ' + ' + st.k : st.m + ' · ' + st.k));
      ro.set('v', done === null ? '—' : String(done), done === null ? '' : 'accent');
      ro.set('u', String(st.k + 1));
      let note;
      if (st.k < 0) note = T.start(sym, st.m, st.n);
      else if (st.k >= st.n) note = op === 'add' ? T.doneAdd(st.m, st.n, done) : T.doneMul(st.m, st.n, done);
      else if (st.k === 0) note = '$' + list[0].tex + '$ — ' + T.axiom(list[0].axiom) + '.';
      else note = op === 'add' ? T.midAdd(st.m, st.k - 1) : T.midMul(st.m, st.k - 1);
      fig.note.replaceChildren(F.rich(note));
    }

    draw();
  });

  if (typeof module !== 'undefined') module.exports = { rows };
})();
