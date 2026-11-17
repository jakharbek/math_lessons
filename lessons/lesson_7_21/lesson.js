/* Урок 7.21 «Поля. Поле рациональных чисел» (Куликов, гл. 4, § 5).
 * Рисунок 1 «zn-field»: таблица умножения кольца Z_n — обратимые элементы, делители нуля, когда Z_n — поле.
 * Рисунок 2 «fraction-lines»: пары целых ⟨p, q⟩ (q > 0) как точки решётки; равные дроби лежат на одной прямой
 *   через начало координат (ps = qr), порядок p/q < r/s ⇔ ps < qr — сравнение наклонов. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const zn = (n) => 'Z' + String(n).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
  const num = (v) => (v < 0 ? '−' + -v : String(v));
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  };

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Когда кольцо $\\mathbf{Z}_n$ — поле',
      title2: 'Дроби как точки: $\\frac{p}{q} = \\frac{r}{s} \\Leftrightarrow ps = qr$',
      nLabel: '$n$',
      field: 'поле',
      units: 'обратимых',
      zd: 'делителей нуля',
      yes: 'да',
      no: 'нет',
      tableAria: 'Таблица умножения кольца Zₙ',
      cellAria: (a, b) => 'Клетка ' + a + ' · ' + b,
      summary: (n, u, list, isField) =>
        zn(n) + ': обратимы ' + u + ' из ' + (n - 1) + ' ненулевых элементов (' + list + '). ' +
        (isField
          ? 'Каждый ненулевой элемент обратим, 0 ≠ 1, умножение коммутативно — ' + zn(n) + ' поле (n простое). '
          : 'Есть необратимые ненулевые элементы — ' + zn(n) + ' не поле' + (n > 1 ? ' (n составное: красные клетки — произведения ненулевых, равные 0).' : '.') + ' '),
      hint: 'Нажмите на клетку: строка — a, столбец — b.',
      cellNote: (a, b, p, n) => a + ' · ' + b + ' = ' + p + ' в ' + zn(n) + ' (обычное произведение ' + a * b + ', остаток от деления на ' + n + '). ',
      inv: (a, x) => 'Обратный к ' + a + ': ' + x + ', так как ' + a + ' · ' + x + ' = 1. ',
      noInv: (a, b) => a + ' необратим: в его строке нет 1' + (b ? ', а ' + a + ' · ' + b + ' = 0 — это делители нуля (по теореме 5.1 (3) в поле их нет).' : '.'),
      zeroRow: 'В строке 0 одни нули: 0 не обратим ни в каком поле (теорема 5.1 (1)).',
      who: 'Выбираю',
      A: 'дробь A',
      B: 'дробь B',
      a: 'A = p/q',
      b: 'B = r/s',
      cmp: 'ps и qr',
      rel: 'итог',
      plotAria: 'Решётка пар целых чисел: знаменатель по горизонтали, числитель по вертикали',
      xLab: 'q',
      yLab: 'p',
      note: (A, B) => {
        const [p, q] = A;
        const [r, s] = B;
        const ps = p * s;
        const qr = q * r;
        const d1 = gcd(p, q);
        const d2 = gcd(r, s);
        let t = 'A = ' + num(p) + '/' + q + ' = ' + num(p / d1) + '/' + q / d1 + ' (несократимая запись), B = ' + num(r) + '/' + s + ' = ' + num(r / d2) + '/' + s / d2 + '. ';
        t += 'ps = ' + num(p) + ' · ' + s + ' = ' + num(ps) + ', qr = ' + q + ' · ' + num(r) + ' = ' + num(qr) + '. ';
        if (ps === qr) t += 'ps = qr — дроби равны (теорема 5.1 (5)): обе точки на одной прямой через начало координат. ';
        else if (ps < qr) t += 'ps < qr — по определению Куликова A < B: прямая через A идёт ниже (наклон меньше). ';
        else t += 'ps > qr — значит, B < A: прямая через B идёт ниже. ';
        t += 'Подсвечены все точки решётки, задающие те же числа.';
        return t;
      },
      eq: 'A = B',
      lt: 'A < B',
      gt: 'B < A',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'When the ring $\\mathbf{Z}_n$ is a field',
      title2: 'Fractions as points: $\\frac{p}{q} = \\frac{r}{s} \\Leftrightarrow ps = qr$',
      nLabel: '$n$',
      field: 'field',
      units: 'invertible',
      zd: 'zero divisors',
      yes: 'yes',
      no: 'no',
      tableAria: 'Multiplication table of the ring Zₙ',
      cellAria: (a, b) => 'Cell ' + a + ' · ' + b,
      summary: (n, u, list, isField) =>
        zn(n) + ': ' + u + ' of ' + (n - 1) + ' nonzero elements are invertible (' + list + '). ' +
        (isField
          ? 'Every nonzero element is invertible, 0 ≠ 1, multiplication is commutative — ' + zn(n) + ' is a field (n is prime). '
          : 'Some nonzero elements are not invertible — ' + zn(n) + ' is not a field' + (n > 1 ? ' (n is composite: red cells are products of nonzero elements equal to 0).' : '.') + ' '),
      hint: 'Click a cell: the row is a, the column is b.',
      cellNote: (a, b, p, n) => a + ' · ' + b + ' = ' + p + ' in ' + zn(n) + ' (ordinary product ' + a * b + ', remainder mod ' + n + '). ',
      inv: (a, x) => 'The inverse of ' + a + ' is ' + x + ', since ' + a + ' · ' + x + ' = 1. ',
      noInv: (a, b) => a + ' is not invertible: there is no 1 in its row' + (b ? ', and ' + a + ' · ' + b + ' = 0 — zero divisors (by Theorem 5.1 (3) a field has none).' : '.'),
      zeroRow: 'Row 0 is all zeros: 0 is never invertible in a field (Theorem 5.1 (1)).',
      who: 'Selecting',
      A: 'fraction A',
      B: 'fraction B',
      a: 'A = p/q',
      b: 'B = r/s',
      cmp: 'ps and qr',
      rel: 'verdict',
      plotAria: 'Lattice of integer pairs: denominator horizontally, numerator vertically',
      xLab: 'q',
      yLab: 'p',
      note: (A, B) => {
        const [p, q] = A;
        const [r, s] = B;
        const ps = p * s;
        const qr = q * r;
        const d1 = gcd(p, q);
        const d2 = gcd(r, s);
        let t = 'A = ' + num(p) + '/' + q + ' = ' + num(p / d1) + '/' + q / d1 + ' (lowest terms), B = ' + num(r) + '/' + s + ' = ' + num(r / d2) + '/' + s / d2 + '. ';
        t += 'ps = ' + num(p) + ' · ' + s + ' = ' + num(ps) + ', qr = ' + q + ' · ' + num(r) + ' = ' + num(qr) + '. ';
        if (ps === qr) t += 'ps = qr — the fractions are equal (Theorem 5.1 (5)): both points lie on one line through the origin. ';
        else if (ps < qr) t += 'ps < qr — by Kulikov’s definition A < B: the line through A is lower (smaller slope). ';
        else t += 'ps > qr — so B < A: the line through B is lower. ';
        t += 'All lattice points giving the same numbers are highlighted.';
        return t;
      },
      eq: 'A = B',
      lt: 'A < B',
      gt: 'B < A',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: '$\\mathbf{Z}_n$ halqa qachon maydon bo‘ladi',
      title2: 'Kasrlar nuqta sifatida: $\\frac{p}{q} = \\frac{r}{s} \\Leftrightarrow ps = qr$',
      nLabel: '$n$',
      field: 'maydon',
      units: 'teskarilanuvchi',
      zd: 'nol bo‘luvchilari',
      yes: 'ha',
      no: 'yo‘q',
      tableAria: 'Zₙ halqaning ko‘paytirish jadvali',
      cellAria: (a, b) => 'Katak ' + a + ' · ' + b,
      summary: (n, u, list, isField) =>
        zn(n) + ': ' + (n - 1) + ' ta noldan farqli elementdan ' + u + ' tasi teskarilanuvchi (' + list + '). ' +
        (isField
          ? 'Har bir noldan farqli element teskarilanuvchi, 0 ≠ 1, ko‘paytirish kommutativ — ' + zn(n) + ' maydon (n tub). '
          : 'Teskarilanmaydigan noldan farqli elementlar bor — ' + zn(n) + ' maydon emas' + (n > 1 ? ' (n murakkab: qizil kataklar — noldan farqli elementlarning 0 ga teng ko‘paytmalari).' : '.') + ' '),
      hint: 'Katakni bosing: satr — a, ustun — b.',
      cellNote: (a, b, p, n) => a + ' · ' + b + ' = ' + p + ' (' + zn(n) + ' da; oddiy ko‘paytma ' + a * b + ', ' + n + ' ga bo‘lgandagi qoldiq). ',
      inv: (a, x) => a + ' ga teskari: ' + x + ', chunki ' + a + ' · ' + x + ' = 1. ',
      noInv: (a, b) => a + ' teskarilanmaydi: uning satrida 1 yo‘q' + (b ? ', ' + a + ' · ' + b + ' = 0 esa — nol bo‘luvchilari (5.1-teorema (3) ga ko‘ra maydonda ular yo‘q).' : '.'),
      zeroRow: '0 satrida faqat nollar: 0 hech bir maydonda teskarilanmaydi (5.1-teorema (1)).',
      who: 'Tanlayman',
      A: 'A kasr',
      B: 'B kasr',
      a: 'A = p/q',
      b: 'B = r/s',
      cmp: 'ps va qr',
      rel: 'natija',
      plotAria: 'Butun sonlar juftlari panjarasi: maxraj gorizontal, surat vertikal',
      xLab: 'q',
      yLab: 'p',
      note: (A, B) => {
        const [p, q] = A;
        const [r, s] = B;
        const ps = p * s;
        const qr = q * r;
        const d1 = gcd(p, q);
        const d2 = gcd(r, s);
        let t = 'A = ' + num(p) + '/' + q + ' = ' + num(p / d1) + '/' + q / d1 + ' (qisqarmas yozuv), B = ' + num(r) + '/' + s + ' = ' + num(r / d2) + '/' + s / d2 + '. ';
        t += 'ps = ' + num(p) + ' · ' + s + ' = ' + num(ps) + ', qr = ' + q + ' · ' + num(r) + ' = ' + num(qr) + '. ';
        if (ps === qr) t += 'ps = qr — kasrlar teng (5.1-teorema (5)): ikkala nuqta koordinatalar boshidan o‘tuvchi bitta to‘g‘ri chiziqda. ';
        else if (ps < qr) t += 'ps < qr — Kulikov ta’rifiga ko‘ra A < B: A orqali o‘tgan chiziq pastroq (qiyaligi kichik). ';
        else t += 'ps > qr — demak, B < A: B orqali o‘tgan chiziq pastroq. ';
        t += 'Xuddi shu sonlarni beruvchi barcha panjara nuqtalari ajratib ko‘rsatilgan.';
        return t;
      },
      eq: 'A = B',
      lt: 'A < B',
      gt: 'B < A',
    },
  });

  /* ---------- Рисунок 1: таблица умножения Z_n ---------- */
  MC.widget('zn-field', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { n: cfg.n || 6, sel: null };
    const nS = F.slider({ label: T.nLabel, min: 2, max: 12, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.sel = null;
      build();
    } });
    fig.controls.append(nS.el);
    const ro = F.readout(fig.readout, [
      { key: 'field', label: T.field },
      { key: 'units', label: T.units },
      { key: 'zd', label: T.zd },
    ]);
    let svg = null;

    function build() {
      const n = st.n;
      const C = n > 9 ? 36 : n > 7 ? 42 : 52;
      const size = C * (n + 1);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = Math.max(size, 300) + 'px';
      const fs = (C > 44 ? 17 : C > 38 ? 15 : 13) + 'px';
      const txt = (x, y, s, cls) => {
        const node = S('text', { class: cls, x: x + C / 2, y: y + C / 2 }, s);
        node.style.fontSize = fs;
        svg.appendChild(node);
        return node;
      };
      txt(0, 0, '·', 'cv corner');
      for (let i = 0; i < n; i++) {
        txt(C * (i + 1), 0, String(i), 'cv ch');
        txt(0, C * (i + 1), String(i), 'cv ch');
      }
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const p = (i * j) % n;
          const x = C * (j + 1);
          const y = C * (i + 1);
          const bad = p === 0 && i !== 0 && j !== 0;
          const on = st.sel && st.sel[0] === i && st.sel[1] === j;
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(i, j) });
          g.appendChild(S('rect', { class: 'cell' + (bad ? ' bad' : '') + (on ? ' on' : ''), x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 }));
          const node = S('text', { class: 'cv' + (bad ? ' bad' : ''), x: x + C / 2, y: y + C / 2 }, String(p));
          node.style.fontSize = fs;
          if (p === 1 % n && !bad) node.style.fill = 'var(--accent)';
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
      explain();
    }

    function explain() {
      const n = st.n;
      const inv = (a) => {
        for (let x = 1; x < n; x++) if ((a * x) % n === 1) return x;
        return null;
      };
      const zdOf = (a) => {
        for (let x = 1; x < n; x++) if ((a * x) % n === 0) return x;
        return null;
      };
      const units = [];
      const zds = [];
      for (let a = 1; a < n; a++) {
        if (inv(a) !== null) units.push(a);
        if (zdOf(a) !== null) zds.push(a);
      }
      const isField = units.length === n - 1;
      ro.set('field', isField ? T.yes : T.no, isField ? 'accent' : 'warm');
      ro.set('units', units.length + ' / ' + (n - 1));
      ro.set('zd', String(zds.length), zds.length ? 'warm' : '');
      let s = T.summary(n, units.length, units.join(', '), isField);
      if (!st.sel) {
        fig.note.textContent = s + T.hint;
        return;
      }
      const [a, b] = st.sel;
      s += T.cellNote(a, b, (a * b) % n, n);
      if (a === 0) s += T.zeroRow;
      else if (inv(a) !== null) s += T.inv(a, inv(a));
      else s += T.noInv(a, zdOf(a));
      fig.note.textContent = s;
    }

    build();
  });

  /* ---------- Рисунок 2: дроби как точки решётки ---------- */
  MC.widget('fraction-lines', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const QMAX = 8;
    const PMAX = 6;
    const st = { A: cfg.A || [2, 4], B: cfg.B || [2, 3], who: 'A' };
    const whoSeg = F.seg([{ value: 'A', label: T.A }, { value: 'B', label: T.B }], st.who, (v) => {
      st.who = v;
    }, T.who);
    fig.controls.append(whoSeg.el);
    const ro = F.readout(fig.readout, [
      { key: 'a', label: T.a },
      { key: 'b', label: T.b },
      { key: 'c', label: T.cmp },
      { key: 'r', label: T.rel },
    ]);
    const w = Math.max(320, Math.min(720, fig.plot.clientWidth || 640));
    const p = new MC.Plot(fig.plot, { width: w, height: Math.round(w * 0.62), x: [0, QMAX + 0.6], y: [-PMAX - 0.6, PMAX + 0.6], label: T.plotAria, margin: { l: 34, r: 14, t: 14, b: 28 } });
    p.axes({ xLabel: T.xLab, yLabel: T.yLab, xTicks: [1, 2, 3, 4, 5, 6, 7, 8], yTicks: [-6, -4, -2, 2, 4, 6] });

    function pick(e) {
      const d = p.toData(e);
      const q = Math.round(d.x);
      const pp = Math.round(d.y);
      if (q < 1 || q > QMAX || Math.abs(pp) > PMAX) return;
      st[st.who] = [pp, q];
      if (st.who === 'A') {
        st.who = 'B';
        whoSeg.set('B');
      } else {
        st.who = 'A';
        whoSeg.set('A');
      }
      draw();
    }
    p.svg.addEventListener('click', pick);
    p.svg.style.cursor = 'pointer';

    function draw() {
      p.clear();
      const [pa, qa] = st.A;
      const [pb, qb] = st.B;
      const X = QMAX + 0.6;
      p.seg(0, 0, X, (pb / qb) * X, 'curve warm');
      p.seg(0, 0, X, (pa / qa) * X, 'curve accent');
      for (let q = 1; q <= QMAX; q++) {
        for (let pp = -PMAX; pp <= PMAX; pp++) {
          const inA = pp * qa === q * pa;
          const inB = pp * qb === q * pb;
          if (inA) p.dot(q, pp, 'accent', 5);
          else if (inB) p.dot(q, pp, 'warm', 5);
          else p.dot(q, pp, 'hollow small', 2.5);
        }
      }
      p.dot(qa, pa, 'accent', 8);
      p.dot(qb, pb, 'warm', 8);
      p.text(qa + 0.15, pa + 0.45, 'A', 'lbl accent');
      p.text(qb + 0.15, pb + 0.45, 'B', 'lbl warm');
      const ps = pa * qb;
      const qr = qa * pb;
      ro.set('a', num(pa) + '/' + qa, 'accent');
      ro.set('b', num(pb) + '/' + qb, 'warm');
      ro.set('c', num(ps) + (ps === qr ? ' = ' : ps < qr ? ' < ' : ' > ') + num(qr));
      ro.set('r', ps === qr ? T.eq : ps < qr ? T.lt : T.gt);
      fig.note.textContent = T.note(st.A, st.B);
    }
    draw();
  });
})();
