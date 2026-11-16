/* Урок 7.4 «Отношение эквивалентности»: рисунки «Лаборатория отношений» и «Ядро отображения». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  /* Строки интерфейса (переводы en, uz добавятся вместе с переводом страницы). */
  const T = MC.i18n.pick({
    ru: {
      fig1: 'Рисунок 1',
      title1: 'Лаборатория отношений: граф, матрица и свойства',
      aria1: 'Граф и матрица бинарного отношения на множестве {1, …, n}',
      preset: 'Готовое отношение',
      presets: { empty: '$\\varnothing$', id: '$i_A$', mod: '$\\equiv \\pmod m$', le: '$\\leqslant$', lt: '$<$', div: 'делит', ne: '$\\ne$', full: '$A \\times A$' },
      nLabel: 'элементов $n$',
      mLabel: 'модуль $m$',
      close: 'Достроить до эквивалентности',
      clear: 'Очистить',
      props: { refl: 'рефлексивно', irr: 'антирефлексивно', sym: 'симметрично', anti: 'антисимметрично', tr: 'транзитивно', con: 'связанно' },
      classes: 'классов $|A/R|$',
      yes: 'да',
      no: 'нет',
      dash: '—',
      cellAria: (i, j, on) => 'Пара ⟨' + i + ', ' + j + '⟩: ' + (on ? 'входит в R' : 'не входит в R'),
      vAria: (i) => 'Вершина ' + i,
      quotient: 'Фактор-множество A/R:',
      notEq: 'R — не эквивалентность: классы не определены. Достройте отношение или выберите ≡ (mod m).',
      noRefl: (x) => 'нет петли у ' + x + ' (не рефлексивно)',
      noSym: (x, y) => '⟨' + x + ', ' + y + '⟩ есть, а ⟨' + y + ', ' + x + '⟩ нет (не симметрично)',
      noTr: (x, y, z) => '⟨' + x + ', ' + y + '⟩ и ⟨' + y + ', ' + z + '⟩ есть, а ⟨' + x + ', ' + z + '⟩ нет (не транзитивно)',
      missing: 'Пунктир — недостающие пары: ',
      isEq: (k) => 'R рефлексивно, симметрично и транзитивно — это отношение эквивалентности. Классов: ' + k + '; они разбивают A (теорема 4.1).',
      picked: (x) => 'Выбрана вершина ' + x + '. Нажмите вторую вершину (или ту же — петля), чтобы добавить или убрать пару.',
      empty: 'Пустое отношение: ни одной пары.',
    },
  });

  const key = (i, j) => i + ',' + j;

  /** Свойства отношения R (Set ключей «i,j») на A = {1, …, n} и свидетели нарушений. */
  function analyse(n, R) {
    const has = (i, j) => R.has(key(i, j));
    const A = [];
    for (let i = 1; i <= n; i++) A.push(i);
    const out = { refl: true, irr: true, sym: true, anti: true, tr: true, con: true, w: {} };
    for (const x of A) {
      if (!has(x, x)) {
        out.refl = false;
        if (!out.w.refl) out.w.refl = [x];
      } else out.irr = false;
    }
    for (const x of A) {
      for (const y of A) {
        if (has(x, y) && !has(y, x)) {
          out.sym = false;
          if (!out.w.sym) out.w.sym = [x, y];
        }
        if (x !== y && has(x, y) && has(y, x)) out.anti = false;
        if (x !== y && !has(x, y) && !has(y, x)) out.con = false;
        for (const z of A) {
          if (has(x, y) && has(y, z) && !has(x, z)) {
            out.tr = false;
            if (!out.w.tr) out.w.tr = [x, y, z];
          }
        }
      }
    }
    out.eq = out.refl && out.sym && out.tr;
    if (out.eq) {
      const seen = new Set();
      out.classes = [];
      for (const a of A) {
        if (seen.has(a)) continue;
        const cls = A.filter((x) => has(x, a)); // a/R = {x ∈ A | xRa}
        cls.forEach((x) => seen.add(x));
        out.classes.push(cls);
      }
    }
    return out;
  }

  /** Наименьшее отношение эквивалентности, содержащее R (компоненты связности графа). */
  function eqClosure(n, R) {
    const parent = [];
    for (let i = 0; i <= n; i++) parent.push(i);
    const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    R.forEach((k) => {
      const [i, j] = k.split(',').map(Number);
      parent[find(i)] = find(j);
    });
    const out = new Set();
    for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) if (find(i) === find(j)) out.add(key(i, j));
    return out;
  }

  const PRESETS = {
    empty: () => false,
    id: (i, j) => i === j,
    mod: (i, j, m) => (i - j) % m === 0,
    le: (i, j) => i <= j,
    lt: (i, j) => i < j,
    div: (i, j) => j % i === 0,
    ne: (i, j) => i !== j,
    full: () => true,
  };

  /* =================================================================================
   * Рисунок 1. Отношение на A = {1, …, n}: граф (вершины по кругу) и матрица.
   * Щелчок по клетке матрицы или по двум вершинам графа добавляет/убирает пару.
   * Табло — шесть свойств § 4; для эквивалентности внизу рисуется разбиение A/R.
   * ================================================================================= */
  MC.widget('relation-lab', (el) => {
    const fig = F.shell(el, { kicker: T.fig1, title: T.title1 });
    const st = { n: 6, m: 3, preset: 'mod', R: new Set(), pick: null };

    const fill = () => {
      st.R = new Set();
      const f = PRESETS[st.preset];
      for (let i = 1; i <= st.n; i++) for (let j = 1; j <= st.n; j++) if (f(i, j, st.m)) st.R.add(key(i, j));
    };

    const presetSeg = F.seg(Object.keys(PRESETS).map((k) => ({ value: k, label: T.presets[k] })), st.preset, (v) => {
      st.preset = v;
      st.pick = null;
      mS.el.style.display = v === 'mod' ? '' : 'none';
      fill();
      draw();
    }, T.preset);
    const nS = F.slider({ label: T.nLabel, min: 3, max: 6, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      const n = Math.round(v);
      if (n === st.n) return;
      st.n = n;
      st.pick = null;
      if (st.preset) fill();
      else st.R = new Set(Array.from(st.R).filter((k) => k.split(',').every((t) => Number(t) <= n)));
      draw();
    } });
    const mS = F.slider({ label: T.mLabel, min: 1, max: 4, step: 1, value: st.m, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.m = Math.round(v);
      if (st.preset === 'mod') {
        fill();
        draw();
      }
    } });
    const userEdit = () => {
      st.preset = null;
      presetSeg.set(null);
      mS.el.style.display = 'none';
    };
    const closeB = F.button(null, T.close, () => {
      st.R = eqClosure(st.n, st.R);
      st.pick = null;
      userEdit();
      draw();
    });
    const clearB = F.button(null, T.clear, () => {
      st.R = new Set();
      st.pick = null;
      userEdit();
      draw();
    });
    const row = MC.h('div', { class: 'row' }, closeB, clearB);
    fig.controls.append(presetSeg.el, nS.el, mS.el, row);

    const ro = F.readout(fig.readout, [
      ...Object.keys(T.props).map((k) => ({ key: k, label: T.props[k] })),
      { key: 'cls', label: T.classes },
    ]);

    let svg = null;
    function toggle(i, j) {
      const k = key(i, j);
      if (st.R.has(k)) st.R.delete(k);
      else st.R.add(k);
      userEdit();
      draw();
    }
    const clickable = (g, fn) => {
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.style.cursor = 'pointer';
      g.addEventListener('click', fn);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fn();
        }
      });
    };

    function draw() {
      const n = st.n;
      const info = analyse(n, st.R);
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
      const wide = W >= 560;
      const G = wide ? Math.round(W * 0.52) : W; // сторона квадрата графа
      const C = wide ? Math.min(46, Math.floor((W - G - 20) / (n + 1))) : Math.min(46, Math.floor((W - 20) / (n + 1)));
      const MW = C * (n + 1);
      const mx = wide ? G + Math.round((W - G - MW) / 2) : Math.round((W - MW) / 2);
      const my = wide ? Math.round((G - MW) / 2) : G + 8;
      const stripY = wide ? G + 10 : my + MW + 18;
      const H = stripY + 86;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl rel-lab', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria1 });

      /* --- граф --- */
      const cx = G / 2;
      const cy = G / 2;
      const rad = G * 0.34;
      const RV = 15;
      // при эквивалентности вершины одного класса стоят рядом — классы видны как группы
      const order = info.eq ? info.classes.flat() : Array.from({ length: n }, (_, k) => k + 1);
      const slot = new Map(order.map((v, k) => [v, k]));
      const pos = (i) => {
        const t = -Math.PI / 2 + (2 * Math.PI * slot.get(i)) / n;
        return [cx + rad * Math.cos(t), cy + rad * Math.sin(t), t];
      };
      const has = (i, j) => st.R.has(key(i, j));
      const f2 = (v) => v.toFixed(1);
      const edgePath = (i, j, cls, arrow, off = 0) => {
        const [x1, y1] = pos(i);
        const [x2, y2] = pos(j);
        const L = Math.hypot(x2 - x1, y2 - y1);
        const ux = (x2 - x1) / L;
        const uy = (y2 - y1) / L;
        const ox = -uy * off; // сдвиг вбок, чтобы пунктир не лёг на встречную стрелку
        const oy = ux * off;
        const ax = x1 + ux * (RV + 3) + ox;
        const ay = y1 + uy * (RV + 3) + oy;
        const bx = x2 - ux * (RV + 4) + ox;
        const by = y2 - uy * (RV + 4) + oy;
        let d = 'M' + f2(ax) + ' ' + f2(ay) + 'L' + f2(bx) + ' ' + f2(by);
        if (arrow) {
          const h = 9;
          const w = 5;
          d += 'M' + f2(bx - ux * h - uy * w) + ' ' + f2(by - uy * h + ux * w) + 'L' + f2(bx) + ' ' + f2(by) + 'L' + f2(bx - ux * h + uy * w) + ' ' + f2(by - uy * h - ux * w);
        }
        const el = S('path', { class: cls, d });
        if (off) el.style.strokeDasharray = '5 4';
        svg.appendChild(el);
      };
      const loop = (i, cls) => {
        const [x, y, t] = pos(i);
        const lx = x + Math.cos(t) * (RV + 9);
        const ly = y + Math.sin(t) * (RV + 9);
        svg.appendChild(S('circle', { class: cls, cx: f2(lx), cy: f2(ly), r: 11 }));
      };
      for (let i = 1; i <= n; i++) {
        for (let j = i + 1; j <= n; j++) {
          const a = has(i, j);
          const b = has(j, i);
          if (a && b) edgePath(i, j, 'curve', false); // неориентированное ребро
          else if (a) edgePath(i, j, 'arrow ink', true);
          else if (b) edgePath(j, i, 'arrow ink', true);
        }
        if (has(i, i)) loop(i, 'curve');
      }
      // недостающие пары — свидетели нарушений рефлексивности, симметричности, транзитивности
      const miss = [];
      if (info.w.refl) {
        loop(info.w.refl[0], 'curve warm dash');
        miss.push(T.noRefl(info.w.refl[0]));
      }
      if (info.w.sym) {
        const [x, y] = info.w.sym;
        edgePath(y, x, 'arrow warm', true, 7);
        miss.push(T.noSym(x, y));
      }
      if (info.w.tr) {
        const [x, y, z] = info.w.tr;
        if (x === z) loop(x, 'curve warm dash');
        else edgePath(x, z, 'arrow warm', true, has(z, x) ? 7 : 0.01);
        miss.push(T.noTr(x, y, z));
      }
      for (let i = 1; i <= n; i++) {
        const [x, y] = pos(i);
        const g = S('g', { 'aria-label': T.vAria(i) });
        const ring = S('circle', { class: 'dot hollow', cx: f2(x), cy: f2(y), r: RV });
        if (st.pick === i) ring.style.stroke = 'var(--accent)';
        g.appendChild(ring);
        g.appendChild(S('text', { class: 'cv', x: f2(x), y: f2(y) }, String(i)));
        clickable(g, () => {
          if (st.pick === null) {
            st.pick = i;
            draw();
          } else {
            const a = st.pick;
            st.pick = null;
            toggle(a, i);
          }
        });
        svg.appendChild(g);
      }

      /* --- матрица --- */
      const txt = (x, y, s, cls) => svg.appendChild(S('text', { class: cls, x: f2(x), y: f2(y) }, s));
      txt(mx + C / 2, my + C / 2, 'R', 'cv corner');
      for (let i = 1; i <= n; i++) {
        txt(mx + C * i + C / 2, my + C / 2, String(i), 'cv ch');
        txt(mx + C / 2, my + C * i + C / 2, String(i), 'cv ch');
      }
      for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= n; j++) {
          const on = has(i, j);
          const x = mx + C * j;
          const y = my + C * i;
          const g = S('g', { class: 'cell-g', 'aria-label': T.cellAria(i, j, on) });
          const r = S('rect', { class: 'cell', x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 });
          if (on) r.style.fill = 'var(--accent-soft)';
          g.appendChild(r);
          const t = S('text', { class: on ? 'cv' : 'cv ch', x: f2(x + C / 2), y: f2(y + C / 2) }, on ? '1' : '0');
          if (on) t.style.fill = 'var(--accent)';
          g.appendChild(t);
          clickable(g, () => {
            st.pick = null;
            toggle(i, j);
          });
          svg.appendChild(g);
        }
      }

      /* --- разбиение A/R --- */
      const lbl = S('text', { class: 'lbl', x: 4, y: stripY + 14 }, T.quotient);
      lbl.style.fontStyle = 'normal';
      svg.appendChild(lbl);
      if (info.eq) {
        const k = info.classes.length;
        const gap = 8;
        const unit = (W - 8 - gap * (k - 1)) / n; // ширина на один элемент
        let x = 4;
        info.classes.forEach((cls, idx) => {
          const w = Math.max(unit * cls.length, 34);
          const box = S('rect', { class: 'poly', x: f2(x), y: stripY + 26, width: f2(w - 0.5), height: 48, rx: 6 });
          if (idx % 2) box.style.fill = 'var(--warm-soft)';
          if (idx % 2) box.style.stroke = 'var(--warm)';
          svg.appendChild(box);
          txt(x + w / 2, stripY + 50, '{' + cls.join(', ') + '}', 'cv');
          x += w + gap;
        });
      } else {
        const t = S('text', { class: 'lbl', x: 4, y: stripY + 54 }, '—');
        svg.appendChild(t);
      }
      fig.plot.appendChild(svg);

      /* --- табло и пояснение --- */
      Object.keys(T.props).forEach((p) => ro.set(p, info[p] ? T.yes : T.no, info[p] ? 'accent' : ''));
      ro.set('cls', info.eq ? String(info.classes.length) : T.dash, info.eq ? 'accent' : '');
      if (st.pick !== null) {
        fig.note.className = 'fig-note';
        fig.note.textContent = T.picked(st.pick);
      } else if (info.eq) {
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.isEq(info.classes.length) + ' A/R = {' + info.classes.map((c) => '{' + c.join(', ') + '}').join(', ') + '}.';
      } else {
        fig.note.className = 'fig-note';
        fig.note.textContent = (st.R.size ? T.missing + miss.join('; ') + '. ' : T.empty + ' ') + T.notEq;
      }
    }
    fill();
    mS.el.style.display = '';
    draw();
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (Math.abs(fig.plot.clientWidth - lastW) > 30) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  });

  /* =================================================================================
   * Рисунок 2. Ядро отображения (отношение равнообразности): A = {−4, …, 4}, f: A → B.
   * Верхний ряд — A, нижний — Im f, стрелки x ↦ f(x). Классы — полные прообразы f^∪(b).
   * ================================================================================= */
  const T2 = MC.i18n.pick({
    ru: {
      fig2: 'Рисунок 2',
      title2: 'Отношение равнообразности: классы — полные прообразы',
      aria2: 'Стрелочная схема отображения f из A в B и классы его равнообразности',
      fn: 'Отображение $f$',
      group: 'сгруппировать $A$ по классам',
      aLabel: 'элемент $a$',
      sizeA: '$|A|$',
      sizeIm: '$|\\mathrm{Im}\\, f|$',
      sizeQ: '$|A/R|$',
      cls: 'класс $a/R$',
      note: (a, b, pre, q) => 'f(' + a + ') = ' + b + ', поэтому класс a/R — полный прообраз значения ' + b + ': {' + pre + '}. Всего классов столько же, сколько значений у f: A/R = {' + q + '}.',
    },
  });
  const mod3 = (x) => ((x % 3) + 3) % 3;
  const FNS = {
    sq: { label: '$x^2$', f: (x) => x * x },
    abs: { label: '$|x|$', f: (x) => Math.abs(x) },
    m3: { label: '$x \\bmod 3$', f: mod3 },
    sgn: { label: '$\\operatorname{sgn} x$', f: (x) => Math.sign(x) },
    k: { label: '$x^2 + x$', f: (x) => x * x + x },
    c: { label: '$0$', f: () => 0 },
  };
  const int = (x) => U.fmt(x, 0);

  MC.widget('kernel', (el) => {
    const fig = F.shell(el, { kicker: T2.fig2, title: T2.title2 });
    const A = [];
    for (let x = -4; x <= 4; x++) A.push(x);
    const st = { fn: 'sq', group: true, a: 2 };
    const fnSeg = F.seg(Object.keys(FNS).map((k) => ({ value: k, label: FNS[k].label })), st.fn, (v) => {
      st.fn = v;
      draw();
    }, T2.fn);
    const gC = F.check(T2.group, st.group, (v) => {
      st.group = v;
      draw();
    });
    const aS = F.slider({ label: T2.aLabel, min: -4, max: 4, step: 1, value: st.a, fmt: int, oninput: (v) => {
      st.a = Math.round(v);
      draw();
    } });
    fig.controls.append(fnSeg.el, aS.el, gC.el);
    const ro = F.readout(fig.readout, [
      { key: 'a', label: T2.sizeA },
      { key: 'im', label: T2.sizeIm },
      { key: 'q', label: T2.sizeQ },
      { key: 'cls', label: T2.cls },
    ]);

    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    const narrow = W < 520;
    const p = new MC.Plot(fig.plot, {
      width: W,
      height: narrow ? 250 : 260,
      x: [-0.6, 9.6],
      y: [-0.55, 1.45],
      margin: { l: 6, r: 6, t: 6, b: 6 },
      label: T2.aria2,
    });

    function draw() {
      const f = FNS[st.fn].f;
      const im = Array.from(new Set(A.map(f))).sort((x, y) => x - y);
      const classes = im.map((b) => A.filter((x) => f(x) === b)); // f^∪(b)
      const order = st.group ? classes.flat() : A.slice();
      const xA = new Map(order.map((x, i) => [x, i]));
      // значения: под центром своего класса, если сгруппировано; иначе равномерно
      const xB = new Map();
      im.forEach((b, i) => {
        if (st.group) {
          const c = classes[i];
          xB.set(b, (xA.get(c[0]) + xA.get(c[c.length - 1])) / 2);
        } else xB.set(b, im.length === 1 ? 4 : (8 * i) / (im.length - 1));
      });
      const fa = f(st.a);
      p.clear();
      if (st.group) {
        classes.forEach((c, i) => {
          const x0 = xA.get(c[0]) - 0.42;
          const x1 = xA.get(c[c.length - 1]) + 0.42;
          const on = f(c[0]) === fa;
          p.polygon([[x0, 0.8], [x1, 0.8], [x1, 1.32], [x0, 1.32]], on ? 'poly' : 'poly faint', 'back');
        });
      }
      A.forEach((x) => {
        const on = f(x) === fa;
        p.arrow(xA.get(x), 0.86, xB.get(f(x)), 0.12, on ? 'accent' : 'ink ghost-arrow', 'main', 8);
      });
      A.forEach((x) => {
        const on = f(x) === fa;
        p.dot(xA.get(x), 1, on ? 'accent' : 'hollow', 6);
        p.text(xA.get(x), 1, int(x), on ? 'lbl accent' : 'lbl ink', { anchor: 'middle', dy: -14 });
      });
      im.forEach((b) => {
        const on = b === fa;
        p.dot(xB.get(b), 0, on ? 'accent' : '', 6);
        p.text(xB.get(b), 0, int(b), on ? 'lbl accent' : 'lbl ink', { anchor: 'middle', dy: 24 });
      });
      p.text(-0.5, 1.2, 'A', 'lbl', { dx: 0 });
      p.text(-0.5, -0.2, 'B', 'lbl', { dx: 0 });
      const pre = A.filter((x) => f(x) === fa);
      ro.set('a', String(A.length));
      ro.set('im', String(im.length));
      ro.set('q', String(classes.length), 'accent');
      ro.set('cls', '{' + pre.map(int).join(', ') + '}', 'accent');
      fig.note.className = 'fig-note';
      fig.note.textContent = T2.note(int(st.a), int(fa), pre.map(int).join(', '), classes.map((c) => '{' + c.map(int).join(', ') + '}').join(', '));
    }
    draw();
  });
})();
