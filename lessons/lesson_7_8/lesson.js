/* Урок 7.8 «Алгебры» (Куликов, гл. 3, § 2): два рисунка.
 * Рисунок 1 «hom-mod» — отображение h(x) = k·x mod m алгебры ⟨Z_n, +, 0⟩ в ⟨Z_m, +, 0⟩: гомоморфизм ли оно,
 *   какого вида (моно-, эпи-, изоморфизм), какую конгруэнцию порождает (теорема 2.12) и почему образ
 *   изоморфен фактор-алгебре (упражнение 10).
 * Рисунок 2 «subalg-gen» — подалгебра, порожденная множеством M, в ⟨Z_n, +⟩, ⟨Z_n, +, 0⟩, ⟨Z_n, ·⟩, ⟨Z_n, ·, 1⟩. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Гомоморфизм $h(x) = kx \\bmod m$ из $\\langle \\mathbf{Z}_n, +, 0\\rangle$ в $\\langle \\mathbf{Z}_m, +, 0\\rangle$',
      t2: 'Подалгебра, порожденная множеством $M$',
      n: 'область: $n$', m: 'образы: $m$', k: 'множитель $k$',
      hom: 'гомоморфизм', kind: 'вид', classes: 'классов ядра', image: '$|\\mathrm{Im}|$',
      yes: 'да', no: 'нет', none: '—',
      mono: 'мономорфизм', epi: 'эпиморфизм', iso: 'изоморфизм', auto: 'автоморфизм', endo: 'эндоморфизм', plain: 'гомоморфизм',
      aria1: 'Стрелки отображения h из Z_n в Z_m',
      bad: (x, y, l, r, n, m) => 'Не гомоморфизм: h((' + x + ' + ' + y + ') mod ' + n + ') = ' + l + ', а (h(' + x + ') + h(' + y + ')) mod ' + m + ' = ' + r + '. Сложение сохраняется, только если m делит k·n. ',
      good: (n, m) => 'Гомоморфизм: для всех ' + n * n + ' пар h(x + y) = h(x) + h(y), и h(0) = 0 — выделенный элемент переходит в выделенный. ',
      kern: (cls) => 'Ядро (x R y ⇔ h(x) = h(y)) разбивает Zₙ на классы ' + cls + ' — это конгруэнция (теорема 2.12). ',
      iso10: (c, i) => 'Классов ' + c + ', образ из ' + i + ' элементов: фактор-алгебра изоморфна образу (упражнение 10).',
      opLabel: 'Алгебра',
      tapHint: 'Нажимайте на элементы, чтобы добавить их в M или убрать. ',
      aria2: 'Элементы Z_n по кругу; выбранные — множество M',
      gen: (M, B, steps) => 'M = ' + M + '. Порожденная подалгебра: ' + B + ' (замыкание за ' + steps + ' шаг.). ',
      empty: 'M пусто и в алгебре нет нульместных операций: замыкание пусто, подалгебры нет — подалгебра по определению непуста. ',
      emptyC: (c) => 'M пусто, но нульместная операция выделяет ' + c + ': порожденная подалгебра состоит из того, что получается из ' + c + '. ',
      whole: 'Порождено всё Zₙ: M — система образующих всей алгебры.',
      part: (k, n) => 'Собственная подалгебра: ' + k + ' элементов из ' + n + '. Добавьте в M элемент вне нее — подалгебра вырастет.',
      size: 'размер', closed: 'шагов',
    },
  });

  const mod = (a, n) => ((a % n) + n) % n;
  const setText = (arr) => '{' + arr.join(', ') + '}';

  /** Анализ h(x) = kx mod m как отображения Z_n → Z_m. */
  function analyseHom(n, m, k) {
    const h = (x) => mod(k * x, m);
    let bad = null;
    for (let x = 0; x < n && !bad; x++) for (let y = 0; y < n && !bad; y++) if (h(mod(x + y, n)) !== mod(h(x) + h(y), m)) bad = [x, y];
    const img = [...new Set([...Array(n).keys()].map(h))].sort((a, b) => a - b);
    const classes = img.map((v) => [...Array(n).keys()].filter((x) => h(x) === v));
    return { h, bad, img, classes, inj: img.length === n, surj: img.length === m };
  }

  MC.widget('hom-mod', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t1 });
    const st = { n: cfg.n || 6, m: cfg.m || 3, k: cfg.k || 1 };
    const sl = (key, label, min, max) => F.slider({ label, min, max, step: 1, value: st[key], fmt: (v) => String(Math.round(v)), oninput: (v) => { st[key] = Math.round(v); draw(); } });
    fig.controls.append(sl('n', T.n, 2, 12).el, sl('m', T.m, 2, 12).el, sl('k', T.k, 0, 11).el);
    const ro = F.readout(fig.readout, [{ key: 'hom', label: T.hom }, { key: 'kind', label: T.kind }, { key: 'cls', label: T.classes }, { key: 'img', label: T.image }]);
    let svg = null;
    function draw() {
      const { n, m, k } = st;
      const r = analyseHom(n, m, k);
      const W = 360;
      const rows = Math.max(n, m);
      const step = 30;
      const H = rows * step + 40;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria1 });
      svg.style.maxWidth = W + 'px';
      svg.style.display = 'block';
      svg.style.margin = '0 auto';
      const xL = 70;
      const xR = W - 70;
      const yL = (i) => 30 + i * step + (rows - n) * step / 2;
      const yR = (i) => 30 + i * step + (rows - m) * step / 2;
      svg.appendChild(S('text', { class: 'lbl ink', x: xL, y: 14, 'text-anchor': 'middle' }, 'Zₙ, n = ' + n));
      svg.appendChild(S('text', { class: 'lbl ink', x: xR, y: 14, 'text-anchor': 'middle' }, 'Zₘ, m = ' + m));
      const palette = ['var(--accent)', 'var(--warm)', 'var(--teal)', 'var(--fg3)'];
      const colorOf = (v) => palette[r.img.indexOf(v) % palette.length];
      for (let x = 0; x < n; x++) {
        const v = r.h(x);
        svg.appendChild(S('line', { x1: xL + 16, y1: yL(x), x2: xR - 16, y2: yR(v), style: 'stroke:' + (r.bad ? 'var(--fg4)' : colorOf(v)) + ';stroke-width:1.6' }));
      }
      if (r.bad) {
        const [x, y] = r.bad;
        [x, y, mod(x + y, n)].forEach((z) => svg.appendChild(S('circle', { cx: xL, cy: yL(z), r: 14, style: 'fill:none;stroke:var(--warm);stroke-width:2' })));
      }
      for (let x = 0; x < n; x++) svg.appendChild(S('text', { class: 'cv', x: xL, y: yL(x), style: r.bad ? '' : 'fill:' + colorOf(r.h(x)) }, String(x)));
      for (let y = 0; y < m; y++) svg.appendChild(S('text', { class: 'cv' + (r.img.includes(y) ? '' : ' ch'), x: xR, y: yR(y) }, String(y)));
      fig.plot.appendChild(svg);

      if (r.bad) {
        const [x, y] = r.bad;
        ro.set('hom', T.no, 'warm');
        ro.set('kind', T.none);
        ro.set('cls', T.none);
        ro.set('img', String(r.img.length));
        fig.note.textContent = T.bad(x, y, r.h(mod(x + y, n)), mod(r.h(x) + r.h(y), m), n, m);
        return;
      }
      let kind = T.plain;
      if (r.inj && r.surj) kind = n === m ? T.auto : T.iso;
      else if (r.inj) kind = T.mono;
      else if (r.surj) kind = T.epi;
      else if (n === m) kind = T.endo;
      ro.set('hom', T.yes, 'accent');
      ro.set('kind', kind, 'accent');
      ro.set('cls', String(r.classes.length));
      ro.set('img', String(r.img.length));
      const cls = r.classes.map(setText).join(', ');
      fig.note.textContent = T.good(n, m) + T.kern(cls) + T.iso10(r.classes.length, r.img.length);
    }
    draw();
  });

  /* ---------- Рисунок 2: порожденная подалгебра ---------- */
  const ALG = {
    add: { label: '$\\langle \\mathbf{Z}_n, +\\rangle$', f: (a, b, n) => mod(a + b, n), c: null },
    add0: { label: '$\\langle \\mathbf{Z}_n, +, 0\\rangle$', f: (a, b, n) => mod(a + b, n), c: 0 },
    mul: { label: '$\\langle \\mathbf{Z}_n, \\cdot\\rangle$', f: (a, b, n) => mod(a * b, n), c: null },
    mul1: { label: '$\\langle \\mathbf{Z}_n, \\cdot, 1\\rangle$', f: (a, b, n) => mod(a * b, n), c: 1 },
  };

  /** Замыкание множества M относительно бинарной операции f и константы c: наименьшее замкнутое множество ⊇ M. */
  function closure(M, n, alg) {
    const B = new Set(M);
    if (alg.c !== null) B.add(alg.c % n);
    let steps = 0;
    for (;;) {
      const add = [];
      for (const a of B) for (const b of B) {
        const v = alg.f(a, b, n);
        if (!B.has(v) && !add.includes(v)) add.push(v);
      }
      if (!add.length) break;
      add.forEach((v) => B.add(v));
      steps++;
    }
    return { B: [...B].sort((a, b) => a - b), steps };
  }

  MC.widget('subalg-gen', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t2 });
    const st = { op: cfg.op || 'add', n: cfg.n || 12, M: new Set(cfg.M || [8]) };
    const opSeg = F.seg(Object.keys(ALG).map((k) => ({ value: k, label: ALG[k].label })), st.op, (v) => { st.op = v; draw(); }, T.opLabel);
    const nS = F.slider({ label: '$n$', min: 2, max: 12, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.M = new Set([...st.M].filter((x) => x < st.n));
      draw();
    } });
    fig.controls.append(opSeg.el, nS.el);
    const ro = F.readout(fig.readout, [{ key: 'size', label: T.size }, { key: 'steps', label: T.closed }]);
    let svg = null;
    function draw() {
      const n = st.n;
      const alg = ALG[st.op];
      const M = [...st.M].sort((a, b) => a - b);
      const { B, steps } = closure(M, n, alg);
      const W = 320;
      const R = 120;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + W + ' ' + W, role: 'img', 'aria-label': T.aria2 });
      svg.style.maxWidth = W + 'px';
      for (let i = 0; i < n; i++) {
        const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
        const x = W / 2 + R * Math.cos(ang);
        const y = W / 2 + R * Math.sin(ang);
        const inB = B.includes(i);
        const inM = st.M.has(i);
        const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-pressed': String(inM), 'aria-label': String(i) });
        g.appendChild(S('circle', { cx: x, cy: y, r: 19, style: 'fill:' + (inB ? 'var(--accent-soft)' : 'var(--bg2)') + ';stroke:' + (inM ? 'var(--accent)' : inB ? 'var(--accent-line)' : 'var(--line)') + ';stroke-width:' + (inM ? 3 : 1.5) }));
        g.appendChild(S('text', { class: 'cv', x, y, style: inB ? 'fill:var(--accent)' : '' }, String(i)));
        const toggle = () => {
          if (st.M.has(i)) st.M.delete(i);
          else st.M.add(i);
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
      fig.plot.appendChild(svg);
      ro.set('size', B.length ? B.length + ' / ' + n : T.none, B.length ? 'accent' : 'warm');
      ro.set('steps', String(steps));
      let s = T.tapHint;
      if (!B.length) s += T.empty;
      else {
        if (!M.length) s += T.emptyC(alg.c % n);
        s += T.gen(setText(M), setText(B), steps);
        s += B.length === n ? T.whole : T.part(B.length, n);
      }
      fig.note.textContent = s;
    }
    draw();
  });

  if (typeof module !== 'undefined') module.exports = { analyseHom, closure, ALG };
})();
