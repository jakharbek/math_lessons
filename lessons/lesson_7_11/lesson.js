/* Урок 7.11 «Алгебраические системы» (Куликов, гл. 3, § 5).
 * Рисунок 1 «system-maps»: отображение h между двумя системами ⟨A, R⟩ и ⟨B, S⟩ с одним бинарным отношением —
 *   гомоморфизм, мономорфизм или изоморфизм по определениям Куликова.
 * Рисунок 2 «subsystems»: подмножества системы ⟨Z_n, +, ≤⟩, замкнутость и подсистемы. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;
  const H = MC.h;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Гомоморфизм, мономорфизм или изоморфизм?',
      title2: 'Подсистемы $\\langle \\mathbb{Z}_n, +, \\leqslant\\rangle$',
      preset: 'Пример',
      presets: { ex2: 'Упражнение 2', order: 'Порядок', bins: 'Корзины', cycle: 'Цикл' },
      inj: 'инъективно',
      onto: '«на»',
      fwd: 'вперёд $\\rightarrow$',
      back: 'назад $\\leftarrow$',
      kind: 'итог',
      yes: 'да',
      no: 'нет',
      iso: 'изоморфизм',
      mono: 'мономорфизм',
      hom: 'гомоморфизм',
      none: 'не гомоморфизм',
      sysA: 'система ⟨A, R⟩',
      sysB: 'система ⟨B, S⟩',
      nodeAria: (side, x) => (side === 'A' ? 'Элемент A: ' : 'Элемент B: ') + x,
      pickHint: 'Нажмите на элемент слева, затем на его образ справа.',
      picked: (x) => 'Выбран ' + x + ' — теперь нажмите на образ справа.',
      fwdBad: (x, y, hx, hy) => 'Вперёд нарушено: ' + x + ' → ' + y + ' в R, а ' + hx + ' → ' + hy + ' не в S. ',
      backBad: (x, y, hx, hy) => 'Назад нарушено: ' + hx + ' → ' + hy + ' в S, а ' + x + ' → ' + y + ' не в R. ',
      notInj: (x, y, v) => 'Не инъективно: h(' + x + ') = h(' + y + ') = ' + v + '. ',
      notOnto: (v) => 'Не «на»: ' + v + ' ничей не образ. ',
      verdict: {
        iso: 'Итог: изоморфизм — биекция, отношение сохраняется в обе стороны.',
        mono: 'Итог: мономорфизм (вложение), но не изоморфизм.',
        homBij: 'Итог: взаимно однозначный гомоморфизм, но не изоморфизм — как в упражнении 2.',
        hom: 'Итог: гомоморфизм — стрелки переходят в стрелки, но обратное не выполнено.',
        none: 'Итог: не гомоморфизм — есть стрелка, образ которой не стрелка.',
      },
      n: 'элементов $n$',
      close: 'Замкнуть',
      clear: 'Очистить',
      all: 'Все подсистемы',
      size: '$|C|$',
      closed: 'замкнуто',
      pairs: 'пар в $\\leqslant | C$',
      subs: 'подсистем',
      tableAria: 'Таблица сложения, ограниченного множеством C',
      clockAria: 'Элементы Z_n: нажмите, чтобы добавить в C или убрать',
      elAria: (a, on) => 'Элемент ' + a + (on ? ', в C' : ', не в C'),
      empty: 'C пусто — носитель системы должен быть непустым. Нажмите на элементы круга.',
      closedYes: (c) => 'C = ' + c + ' замкнуто относительно +: ограничение + | C — операция на C, и ⟨C, +, ≤⟩ — подсистема. ',
      closedNo: (a, b, s, c) => 'C = ' + c + ' не замкнуто: ' + a + ' + ' + b + ' = ' + s + ' ∉ C (красные клетки таблицы). Подсистемы на C нет. ',
      zero: 'Заметьте: каждое непустое замкнутое C содержит 0.',
      list: (n, arr) => 'Все непустые замкнутые подмножества Z_' + n + ' (их ' + arr.length + '): ' + arr.join(', ') + '.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Homomorphism, monomorphism or isomorphism?',
      title2: 'Subsystems of $\\langle \\mathbb{Z}_n, +, \\leqslant\\rangle$',
      preset: 'Example',
      presets: { ex2: 'Exercise 2', order: 'Order', bins: 'Bins', cycle: 'Cycle' },
      inj: 'injective',
      onto: 'onto',
      fwd: 'forward $\\rightarrow$',
      back: 'backward $\\leftarrow$',
      kind: 'verdict',
      yes: 'yes',
      no: 'no',
      iso: 'isomorphism',
      mono: 'monomorphism',
      hom: 'homomorphism',
      none: 'not a homomorphism',
      sysA: 'system ⟨A, R⟩',
      sysB: 'system ⟨B, S⟩',
      nodeAria: (side, x) => (side === 'A' ? 'Element of A: ' : 'Element of B: ') + x,
      pickHint: 'Click an element on the left, then its image on the right.',
      picked: (x) => x + ' selected — now click its image on the right.',
      fwdBad: (x, y, hx, hy) => 'Forward fails: ' + x + ' → ' + y + ' is in R, but ' + hx + ' → ' + hy + ' is not in S. ',
      backBad: (x, y, hx, hy) => 'Backward fails: ' + hx + ' → ' + hy + ' is in S, but ' + x + ' → ' + y + ' is not in R. ',
      notInj: (x, y, v) => 'Not injective: h(' + x + ') = h(' + y + ') = ' + v + '. ',
      notOnto: (v) => 'Not onto: ' + v + ' is nobody’s image. ',
      verdict: {
        iso: 'Verdict: isomorphism — a bijection preserving the relation both ways.',
        mono: 'Verdict: monomorphism (embedding), not an isomorphism.',
        homBij: 'Verdict: a one-to-one homomorphism that is not an isomorphism — as in Exercise 2.',
        hom: 'Verdict: homomorphism — arrows go to arrows, but not conversely.',
        none: 'Verdict: not a homomorphism — some arrow is mapped to a non-arrow.',
      },
      n: 'elements $n$',
      close: 'Close',
      clear: 'Clear',
      all: 'All subsystems',
      size: '$|C|$',
      closed: 'closed',
      pairs: 'pairs in $\\leqslant | C$',
      subs: 'subsystems',
      tableAria: 'Addition table restricted to C',
      clockAria: 'Elements of Z_n: click to add to C or remove',
      elAria: (a, on) => 'Element ' + a + (on ? ', in C' : ', not in C'),
      empty: 'C is empty — a system needs a nonempty carrier. Click elements on the circle.',
      closedYes: (c) => 'C = ' + c + ' is closed under +: the restriction + | C is an operation on C, and ⟨C, +, ≤⟩ is a subsystem. ',
      closedNo: (a, b, s, c) => 'C = ' + c + ' is not closed: ' + a + ' + ' + b + ' = ' + s + ' ∉ C (red cells). No subsystem on C. ',
      zero: 'Note: every nonempty closed C contains 0.',
      list: (n, arr) => 'All nonempty closed subsets of Z_' + n + ' (' + arr.length + '): ' + arr.join(', ') + '.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: 'Gomomorfizm, monomorfizm yoki izomorfizm?',
      title2: '$\\langle \\mathbb{Z}_n, +, \\leqslant\\rangle$ qism sistemalari',
      preset: 'Misol',
      presets: { ex2: '2-mashq', order: 'Tartib', bins: 'Savatlar', cycle: 'Sikl' },
      inj: 'inyektiv',
      onto: '«ustiga»',
      fwd: 'oldinga $\\rightarrow$',
      back: 'orqaga $\\leftarrow$',
      kind: 'xulosa',
      yes: 'ha',
      no: 'yo‘q',
      iso: 'izomorfizm',
      mono: 'monomorfizm',
      hom: 'gomomorfizm',
      none: 'gomomorfizm emas',
      sysA: '⟨A, R⟩ sistema',
      sysB: '⟨B, S⟩ sistema',
      nodeAria: (side, x) => (side === 'A' ? 'A elementi: ' : 'B elementi: ') + x,
      pickHint: 'Chapdagi elementni, so‘ng o‘ngdagi uning obrazini bosing.',
      picked: (x) => x + ' tanlandi — endi o‘ngdagi obrazini bosing.',
      fwdBad: (x, y, hx, hy) => 'Oldinga buzilgan: ' + x + ' → ' + y + ' R da, lekin ' + hx + ' → ' + hy + ' S da emas. ',
      backBad: (x, y, hx, hy) => 'Orqaga buzilgan: ' + hx + ' → ' + hy + ' S da, lekin ' + x + ' → ' + y + ' R da emas. ',
      notInj: (x, y, v) => 'Inyektiv emas: h(' + x + ') = h(' + y + ') = ' + v + '. ',
      notOnto: (v) => '«Ustiga» emas: ' + v + ' hech kimning obrazi emas. ',
      verdict: {
        iso: 'Xulosa: izomorfizm — munosabatni ikki tomonga saqlaydigan biyeksiya.',
        mono: 'Xulosa: monomorfizm (joylashtirish), lekin izomorfizm emas.',
        homBij: 'Xulosa: o‘zaro bir qiymatli gomomorfizm, lekin izomorfizm emas — 2-mashqdagidek.',
        hom: 'Xulosa: gomomorfizm — strelkalar strelkalarga o‘tadi, teskarisi esa bajarilmaydi.',
        none: 'Xulosa: gomomorfizm emas — obrazi strelka bo‘lmagan strelka bor.',
      },
      n: 'elementlar $n$',
      close: 'Yopish',
      clear: 'Tozalash',
      all: 'Barcha qism sistemalar',
      size: '$|C|$',
      closed: 'yopiq',
      pairs: '$\\leqslant | C$ dagi juftlar',
      subs: 'qism sistemalar',
      tableAria: 'C to‘plamga cheklangan qo‘shish jadvali',
      clockAria: 'Z_n elementlari: C ga qo‘shish yoki olib tashlash uchun bosing',
      elAria: (a, on) => a + ' element' + (on ? ', C da' : ', C da emas'),
      empty: 'C bo‘sh — sistemaning asosiy to‘plami bo‘sh bo‘lmasligi kerak. Doiradagi elementlarni bosing.',
      closedYes: (c) => 'C = ' + c + ' + ga nisbatan yopiq: + | C cheklanishi C dagi amal, ⟨C, +, ≤⟩ — qism sistema. ',
      closedNo: (a, b, s, c) => 'C = ' + c + ' yopiq emas: ' + a + ' + ' + b + ' = ' + s + ' ∉ C (qizil kataklar). C da qism sistema yo‘q. ',
      zero: 'E’tibor bering: har bir bo‘sh bo‘lmagan yopiq C 0 ni o‘z ichiga oladi.',
      list: (n, arr) => 'Z_' + n + ' ning barcha bo‘sh bo‘lmagan yopiq qism to‘plamlari (' + arr.length + ' ta): ' + arr.join(', ') + '.',
    },
  });

  /* ---------- Рисунок 1: отображение между системами с одним бинарным отношением ---------- */
  const le = (xs) => {
    const r = [];
    xs.forEach((a, i) => xs.forEach((b, j) => { if (i <= j) r.push([i, j]); }));
    return r;
  };
  const SYS = {
    ex2: { A: ['1', '2', '3'], R: [], B: ['1', '2', '3'], S: [[1, 0], [2, 0], [2, 1]], h: [0, 1, 2] },
    order: { A: ['1', '2', '3'], R: le(['1', '2', '3']), B: ['0', '1', '2', '3'], S: le(['0', '1', '2', '3']), h: [1, 2, 3] },
    bins: { A: ['1', '2', '3', '4'], R: le(['1', '2', '3', '4']), B: ['0', '1'], S: le(['0', '1']), h: [0, 0, 1, 1] },
    cycle: { A: ['0', '1', '2'], R: [[0, 1], [1, 2], [2, 0]], B: ['a', 'b', 'c'], S: [[0, 1], [1, 2], [2, 0]], h: [0, 1, 2] },
  };

  /** Свойства отображения h по определениям Куликова (§ 5). */
  function analyseMap(sys, h) {
    const nA = sys.A.length;
    const nB = sys.B.length;
    const inR = (x, y) => sys.R.some(([a, b]) => a === x && b === y);
    const inS = (u, v) => sys.S.some(([a, b]) => a === u && b === v);
    let fwd = null;
    let back = null;
    for (let x = 0; x < nA; x++)
      for (let y = 0; y < nA; y++) {
        const r = inR(x, y);
        const s = inS(h[x], h[y]);
        if (r && !s && !fwd) fwd = [x, y];
        if (s && !r && !back) back = [x, y];
      }
    let inj = null;
    for (let x = 0; x < nA && !inj; x++) for (let y = x + 1; y < nA && !inj; y++) if (h[x] === h[y]) inj = [x, y];
    const hit = new Set(h);
    let onto = null;
    for (let v = 0; v < nB; v++) if (!hit.has(v)) { onto = v; break; }
    let kind;
    if (fwd) kind = 'none';
    else if (inj || back) kind = 'hom';
    else if (onto !== null) kind = 'mono';
    else kind = 'iso';
    return { fwd, back, inj, onto, kind, inR, inS };
  }

  MC.widget('system-maps', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { key: cfg.preset || 'ex2', h: null, sel: null };
    const keys = Object.keys(SYS);
    const segP = F.seg(keys.map((k) => ({ value: k, label: T.presets[k] })), st.key, (v) => { st.key = v; reset(); }, T.preset);
    fig.controls.append(segP.el);
    const ro = F.readout(fig.readout, [
      { key: 'inj', label: T.inj },
      { key: 'onto', label: T.onto },
      { key: 'fwd', label: T.fwd },
      { key: 'back', label: T.back },
      { key: 'kind', label: T.kind },
    ]);
    const W = 440;
    const Hh = 300;
    const R0 = 20;
    let svg = null;

    function reset() {
      st.h = SYS[st.key].h.slice();
      st.sel = null;
      draw();
    }

    function pos(n, cx) {
      const gap = 62;
      const y0 = 165 - ((n - 1) * gap) / 2;
      return [...Array(n).keys()].map((i) => [cx, y0 + i * gap]);
    }

    /** Стрелка между вершинами столбца: дуга наружу (side = −1 — влево, +1 — вправо). */
    function arrow(g, p, q, cls, side) {
      const st2 = 'stroke-width: 1.75';
      if (p === q) {
        const [x, y] = p;
        const ox = x + side * R0;
        const d = 'M' + ox + ' ' + (y - 8) + ' C' + (ox + side * 34) + ' ' + (y - 30) + ' ' + (ox + side * 34) + ' ' + (y + 30) + ' ' + (ox + side * 2) + ' ' + (y + 8);
        g.appendChild(S('path', { class: 'arrow ' + cls, d, style: st2 }));
        g.appendChild(S('path', { class: 'arrow ' + cls, d: head(ox + side * 2, y + 8, -side * 1, 0.35), style: st2 }));
        return;
      }
      const [x, y1] = p;
      const y2 = q[1];
      const span = Math.abs(y2 - y1);
      const off = (y2 > y1 ? 34 : 58) + span * 0.32;
      const mx = x + side * off * 2;
      const my = (y1 + y2) / 2;
      const a = Math.atan2(my - y1, mx - x);
      const b = Math.atan2(my - y2, mx - x);
      const sx = x + R0 * Math.cos(a);
      const sy = y1 + R0 * Math.sin(a);
      const ex = x + (R0 + 2) * Math.cos(b);
      const ey = y2 + (R0 + 2) * Math.sin(b);
      g.appendChild(S('path', { class: 'arrow ' + cls, d: 'M' + sx + ' ' + sy + ' Q' + mx + ' ' + my + ' ' + ex + ' ' + ey, style: st2 }));
      g.appendChild(S('path', { class: 'arrow ' + cls, d: head(ex, ey, ex - mx, ey - my), style: st2 }));
    }

    function head(x, y, dx, dy) {
      const l = Math.hypot(dx, dy);
      const ux = dx / l;
      const uy = dy / l;
      const s = 8;
      const p1 = [x - s * ux - s * 0.55 * uy, y - s * uy + s * 0.55 * ux];
      const p2 = [x - s * ux + s * 0.55 * uy, y - s * uy - s * 0.55 * ux];
      return 'M' + p1[0] + ' ' + p1[1] + ' L' + x + ' ' + y + ' L' + p2[0] + ' ' + p2[1];
    }

    function node(g, p, label, side, i, cls) {
      const n = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.nodeAria(side, label) });
      const c = S('circle', { cx: p[0], cy: p[1], r: R0, class: 'dot hollow' });
      if (cls === 'sel') c.setAttribute('style', 'stroke: var(--accent); stroke-width: 3; fill: var(--accent-soft)');
      else if (cls === 'miss') c.setAttribute('style', 'stroke: var(--warm); stroke-dasharray: 4 3');
      n.appendChild(c);
      n.appendChild(S('text', { class: 'cv', x: p[0], y: p[1] }, label));
      const act = () => click(side, i);
      n.addEventListener('click', act);
      n.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          act();
        }
      });
      g.appendChild(n);
    }

    function click(side, i) {
      if (side === 'A') st.sel = st.sel === i ? null : i;
      else if (st.sel !== null) {
        st.h[st.sel] = i;
        st.sel = null;
      }
      draw();
    }

    function draw() {
      const sys = SYS[st.key];
      const res = analyseMap(sys, st.h);
      const PA = pos(sys.A.length, 160);
      const PB = pos(sys.B.length, 300);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': T.title1 });
      svg.style.width = '100%';
      svg.style.maxWidth = '600px';
      svg.style.display = 'block';
      svg.style.margin = '0 auto';
      svg.appendChild(S('text', { class: 'lbl ink', x: 160, y: 30, 'text-anchor': 'middle' }, T.sysA));
      svg.appendChild(S('text', { class: 'lbl ink', x: 300, y: 30, 'text-anchor': 'middle' }, T.sysB));
      const gm = S('g');
      const ga = S('g');
      const gn = S('g');
      svg.append(gm, ga, gn);
      // отображение h — пунктир
      sys.A.forEach((_, x) => {
        const p = PA[x];
        const q = PB[st.h[x]];
        gm.appendChild(S('line', { x1: p[0] + R0, y1: p[1], x2: q[0] - R0, y2: q[1], class: 'guide' }));
      });
      // стрелки R: синие, если образ — стрелка S; оранжевые — нарушение «вперёд»
      sys.R.forEach(([x, y]) => arrow(ga, PA[x], PA[y], res.inS(st.h[x], st.h[y]) ? 'accent' : 'warm', -1));
      // стрелки S: синие — образ стрелки R; оранжевые — между образами несвязанных; серые — вне образа
      sys.S.forEach(([u, v]) => {
        let img = false;
        let bad = false;
        sys.A.forEach((_, x) => sys.A.forEach((__, y) => {
          if (st.h[x] === u && st.h[y] === v) {
            if (res.inR(x, y)) img = true;
            else bad = true;
          }
        }));
        arrow(ga, PB[u], PB[v], bad ? 'warm' : img ? 'accent' : 'ink', 1);
      });
      const hit = new Set(st.h);
      sys.A.forEach((a, i) => node(gn, PA[i], a, 'A', i, st.sel === i ? 'sel' : ''));
      sys.B.forEach((b, i) => node(gn, PB[i], b, 'B', i, hit.has(i) ? '' : 'miss'));
      fig.plot.appendChild(svg);

      ro.set('inj', res.inj ? T.no : T.yes, res.inj ? 'warm' : 'accent');
      ro.set('onto', res.onto !== null ? T.no : T.yes, res.onto !== null ? 'warm' : 'accent');
      ro.set('fwd', res.fwd ? T.no : T.yes, res.fwd ? 'warm' : 'accent');
      ro.set('back', res.back ? T.no : T.yes, res.back ? 'warm' : 'accent');
      ro.set('kind', T[res.kind], res.kind === 'none' ? 'warm' : 'accent');

      const A = sys.A;
      const B = sys.B;
      let s = '';
      if (st.sel !== null) s += T.picked(A[st.sel]) + ' ';
      if (res.fwd) s += T.fwdBad(A[res.fwd[0]], A[res.fwd[1]], B[st.h[res.fwd[0]]], B[st.h[res.fwd[1]]]);
      if (res.back) s += T.backBad(A[res.back[0]], A[res.back[1]], B[st.h[res.back[0]]], B[st.h[res.back[1]]]);
      if (res.inj) s += T.notInj(A[res.inj[0]], A[res.inj[1]], B[st.h[res.inj[0]]]);
      if (res.onto !== null) s += T.notOnto(B[res.onto]);
      const bij = !res.inj && res.onto === null;
      s += res.kind === 'hom' && bij ? T.verdict.homBij : T.verdict[res.kind];
      if (st.sel === null) s += ' ' + T.pickHint;
      fig.note.textContent = s;
    }

    reset();
  });

  /* ---------- Рисунок 2: подсистемы ⟨Z_n, +, ≤⟩ ---------- */
  const closure = (C, n) => {
    const out = new Set(C);
    let grew = true;
    while (grew) {
      grew = false;
      for (const a of [...out]) for (const b of [...out]) {
        const s = (a + b) % n;
        if (!out.has(s)) {
          out.add(s);
          grew = true;
        }
      }
    }
    return out;
  };
  function closedSubsets(n) {
    const res = [];
    for (let m = 1; m < 1 << n; m++) {
      const C = [];
      for (let i = 0; i < n; i++) if (m & (1 << i)) C.push(i);
      const set = new Set(C);
      if (C.every((a) => C.every((b) => set.has((a + b) % n)))) res.push(C);
    }
    return res;
  }

  MC.widget('subsystems', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { n: cfg.n || 6, C: new Set(cfg.C || [2, 4]), list: false };
    const nS = F.slider({ label: T.n, min: 2, max: 12, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.C = new Set([...st.C].filter((a) => a < st.n));
      st.list = false;
      draw();
    } });
    const bClose = F.button(null, T.close, () => { st.C = closure(st.C, st.n); draw(); });
    const bClear = F.button(null, T.clear, () => { st.C = new Set(); st.list = false; draw(); });
    const bAll = F.button(null, T.all, () => { st.list = !st.list; draw(); });
    fig.controls.append(nS.el, H('div', { class: 'seg-row', style: 'display: flex; flex-wrap: wrap; gap: 8px' }, bClose, bClear, bAll));
    const ro = F.readout(fig.readout, [
      { key: 'size', label: T.size },
      { key: 'closed', label: T.closed },
      { key: 'pairs', label: T.pairs },
      { key: 'subs', label: T.subs },
    ]);
    const box = H('div', { style: 'display: flex; flex-wrap: wrap; gap: 18px; justify-content: center; align-items: center' });
    fig.plot.appendChild(box);
    const setTxt = (arr) => '{' + arr.join(', ') + '}';

    function draw() {
      const n = st.n;
      const C = [...st.C].sort((a, b) => a - b);
      box.replaceChildren();
      // круг-циферблат Z_n
      const D = 250;
      const clock = S('svg', { class: 'pl', viewBox: '0 0 ' + D + ' ' + D, role: 'group', 'aria-label': T.clockAria });
      clock.style.width = '100%';
      clock.style.maxWidth = D + 'px';
      clock.appendChild(S('circle', { cx: D / 2, cy: D / 2, r: 92, class: 'guide' }));
      for (let a = 0; a < n; a++) {
        const ang = -Math.PI / 2 + (2 * Math.PI * a) / n;
        const x = D / 2 + 92 * Math.cos(ang);
        const y = D / 2 + 92 * Math.sin(ang);
        const on = st.C.has(a);
        const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-pressed': String(on), 'aria-label': T.elAria(a, on) });
        const c = S('circle', { cx: x, cy: y, r: 18, class: 'dot hollow' });
        if (on) c.setAttribute('style', 'fill: var(--accent); stroke: var(--accent)');
        g.appendChild(c);
        const t = S('text', { class: 'cv', x, y }, String(a));
        if (on) t.style.fill = 'var(--card)';
        g.appendChild(t);
        const act = () => {
          if (st.C.has(a)) st.C.delete(a);
          else st.C.add(a);
          draw();
        };
        g.addEventListener('click', act);
        g.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            act();
          }
        });
        clock.appendChild(g);
      }
      box.appendChild(clock);

      // таблица + | C
      let bad = null;
      const k = C.length;
      if (k) {
        const cell = k > 8 ? 30 : 36;
        const size = cell * (k + 1);
        const tab = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
        tab.style.width = '100%';
        tab.style.maxWidth = size + 'px';
        const txt = (x, y, s, cls) => {
          const t = S('text', { class: cls, x: x + cell / 2, y: y + cell / 2 }, s);
          if (cell < 36) t.style.fontSize = '15px';
          tab.appendChild(t);
        };
        txt(0, 0, '+', 'cv corner');
        C.forEach((a, i) => {
          txt(cell * (i + 1), 0, String(a), 'cv ch');
          txt(0, cell * (i + 1), String(a), 'cv ch');
        });
        C.forEach((a, i) => C.forEach((b, j) => {
          const s = (a + b) % n;
          const out = !st.C.has(s);
          if (out && !bad) bad = [a, b, s];
          tab.appendChild(S('rect', { class: 'cell' + (out ? ' bad' : ''), x: cell * (j + 1) + 2, y: cell * (i + 1) + 2, width: cell - 4, height: cell - 4, rx: 4 }));
          txt(cell * (j + 1), cell * (i + 1), String(s), out ? 'cv bad' : 'cv');
        }));
        box.appendChild(tab);
      }

      const all = closedSubsets(n);
      ro.set('size', String(k));
      ro.set('closed', !k ? '—' : bad ? T.no : T.yes, !k ? '' : bad ? 'warm' : 'accent');
      ro.set('pairs', String((k * (k + 1)) / 2));
      ro.set('subs', String(all.length));
      let s;
      if (!k) s = T.empty;
      else if (bad) s = T.closedNo(bad[0], bad[1], bad[2], setTxt(C));
      else s = T.closedYes(setTxt(C)) + T.zero;
      if (st.list) s += ' ' + T.list(n, all.map(setTxt));
      fig.note.textContent = s;
    }

    draw();
  });

  /* Для проверок в node: та же логика без DOM. */
  if (typeof module !== 'undefined') module.exports = { analyseMap, SYS, closedSubsets, closure };
})();
