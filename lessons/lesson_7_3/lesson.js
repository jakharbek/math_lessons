/* Урок 7.3 «Функции»: рисунки «Стрелочная схема» и «Композиция». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  /* Строки интерфейса (переводы en и uz добавятся позже). */
  const T = MC.i18n.pick({
    ru: {
      fig1: 'Рисунок 1',
      title1: 'Стрелочная схема: функция, «в», «на», инъекция, инверсия',
      plot1: 'Стрелочная схема отношения между множествами A и B',
      sizeA: 'элементов в $A$',
      sizeB: 'элементов в $B$',
      presets: 'Примеры',
      pFunc: 'функция',
      pNot: 'не функция',
      pInj: 'инъекция',
      pOnto: 'на $B$',
      pBij: 'биекция',
      pEmpty: 'пусто',
      showInv: 'показать инверсию $f^{\\smile}$',
      rFunc: 'функция?',
      rMap: 'отображение $A$ в $B$?',
      rInj: 'инъективна?',
      rOnto: 'отображение $A$ на $B$?',
      rInv: '$f^{\\smile}$ — функция?',
      yes: 'да',
      no: 'нет',
      dash: '—',
      elA: (x) => 'Элемент ' + x + ' множества A',
      elB: (x) => 'Элемент ' + x + ' множества B',
      picked: (x) => 'Выбран элемент «' + x + '» из A. Теперь нажмите на элемент B — стрелка из «' + x + '» в него появится или исчезнет.',
      empty: 'Стрелок нет: пустое отношение — функция (пустая), но не отображение множества A: Dom f = ∅ ≠ A. Нажмите на элемент A, затем на элемент B.',
      fork: (x, ys) => 'Из «' + x + '» выходят стрелки в ' + ys + ' — развилка: ⟨' + x + ', y⟩ ∈ f и ⟨' + x + ', z⟩ ∈ f при y ≠ z. Это не функция. ',
      merge: (y, xs) => 'в «' + y + '» входят стрелки из ' + xs,
      missing: (xs) => 'f — функция, но из ' + xs + ' не выходит стрелок: Dom f ≠ A. Это отображение из A в B, но не отображение множества A в B.',
      bij: 'f — инъективное отображение A на B (биекция). Инверсия f — функция и обратная к f (следствие 3.17).',
      injOnly: (ys) => 'f — инъективное отображение A в B, но не на B: в ' + ys + ' не входит ни одной стрелки. Инверсия — функция, но определена только на Im f.',
      ontoOnly: (m) => 'f — отображение A на B, но не инъективное: ' + m + '. В инверсии это развилка, она не функция (теорема 3.13), хотя композиция f с инверсией (сначала инверсия, потом f) — тождественное отображение i_B (теорема 3.6).',
      neither: (m, ys) => 'f — отображение A в B, не инъективное (' + m + ') и не на B (в ' + ys + ' стрелок нет).',
      invTail: ' Сейчас стрелки перевёрнуты: показана инверсия.',
      notFuncInv: (ok) => (ok ? 'Инверсия при этом функция — в каждую точку B входит не больше одной стрелки.' : 'Инверсия тоже не функция.'),
      fig2: 'Рисунок 2',
      title2: 'Композиция $f \\cdot g$: сначала $g$, потом $f$',
      plot2: 'Стрелки g из A в B, стрелки f из B в C и дуги композиции из A в C',
      cBoth: 'обе инъективны',
      cG: '$g$ склеивает',
      cF: '$f$ склеивает',
      cHole: 'дыра в $\\mathrm{Dom}\\,f$',
      showComp: 'показать $f \\cdot g$',
      rDom: '$\\mathrm{Dom}\\,(f \\cdot g)$',
      rgInj: '$g$ инъективна',
      rfInj: '$f$ инъективна',
      rfgInj: '$f \\cdot g$ инъективна',
      rfgOnto: '$f \\cdot g$ — на $C$',
      elC: (x) => 'Элемент ' + x + ' множества C',
      pickA: (x) => 'Выбран «' + x + '» в A: нажмите на элемент B, чтобы задать g(' + x + ') (повторное нажатие снимает стрелку).',
      pickB: (x) => 'Выбран «' + x + '» в B: нажмите на элемент C, чтобы задать f(' + x + '), или на элемент A, чтобы задать g.',
      gUndef: (x) => '«' + x + '» выпадает из Dom(f · g): g(' + x + ') не определено.',
      fUndef: (x, y) => '«' + x + '» выпадает из Dom(f · g): g(' + x + ') = ' + y + ', а f в ' + y + ' не определена (теорема 3.1: Dom(f · g) = {x | g(x) ∈ Dom f}).',
      both: 'g и f инъективны — значит, и f · g инъективна (теорема 3.9).',
      fGlueHidden: (y1, y2) => 'f склеивает ' + y1 + ' и ' + y2 + ', но одно из них не значение g — склейка не видна, f · g инъективна. Из инъективности f · g следует инъективность g (упражнение 15(a)), но не f.',
      gGlue: (x1, x2) => 'g склеивает «' + x1 + '» и «' + x2 + '» — и f · g их склеит, какой бы ни была f: (f · g)(' + x1 + ') = (f · g)(' + x2 + ').',
      fGlue: (x1, x2) => 'g различает «' + x1 + '» и «' + x2 + '», но f склеивает их образы: (f · g)(' + x1 + ') = (f · g)(' + x2 + ').',
    },
  });

  const int = (x) => U.fmt(x, 0);
  const LA = ['a', 'b', 'c', 'd', 'e'];
  const LB = ['1', '2', '3', '4', '5'];

  /** Равномерно расставленные по вертикали ординаты для count точек вокруг центра mid. */
  function column(count, mid, span) {
    if (count === 1) return [mid];
    const step = Math.min(span / (count - 1), 0.17);
    const top = mid + (step * (count - 1)) / 2;
    return Array.from({ length: count }, (_, i) => top - i * step);
  }

  /** Овал-«множество» вокруг столбца точек. */
  function oval(p, cx, cy, rx, ry) {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const t = (2 * Math.PI * i) / 96;
      pts.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]);
    }
    p.path(pts, 'curve faint');
  }

  /** Невидимая «кнопка» поверх точки: щелчок и Enter/пробел. */
  function hit(p, x, y, label, onPick) {
    const c = S('circle', { class: 'hit', cx: p.sx(x).toFixed(1), cy: p.sy(y).toFixed(1), r: 17, tabindex: '0', role: 'button', 'aria-label': label });
    c.style.cursor = 'pointer';
    c.addEventListener('click', onPick);
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPick();
      }
    });
    p._add(c, 'front');
  }

  /** Стрелка от точки к точке, укороченная на концах, чтобы не заходить на кружки. */
  function link(p, x1, y1, x2, y2, cls, cut = 0.08) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    p.arrow(x1 + dx * cut, y1 + dy * cut, x2 - dx * cut, y2 - dy * cut, cls, 'main');
  }

  const listWords = (xs) => xs.map((x) => '«' + x + '»').join(', ').replace(/, ([^,]*)$/, ' и $1');

  /* =================================================================================
   * Рисунок 1. Стрелочная схема отношения f ⊂ A × B. Читатель рисует стрелки, рисунок
   * проверяет: функция ли это, отображение ли множества A в B, на B, инъективно ли,
   * функция ли инверсия.
   * ================================================================================= */
  const PRESETS1 = {
    func: { m: 4, n: 4, e: [[0, 0], [1, 0], [2, 2], [3, 1]] },
    not: { m: 3, n: 3, e: [[0, 0], [0, 1], [1, 1], [2, 2]] },
    inj: { m: 3, n: 4, e: [[0, 1], [1, 3], [2, 0]] },
    onto: { m: 4, n: 3, e: [[0, 0], [1, 1], [2, 2], [3, 2]] },
    bij: { m: 4, n: 4, e: [[0, 1], [1, 3], [2, 0], [3, 2]] },
  };

  MC.widget('arrows', (el) => {
    const fig = F.shell(el, { kicker: T.fig1, title: T.title1 });
    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    const narrow = W < 520;
    const p = new MC.Plot(fig.plot, {
      width: W,
      height: narrow ? 330 : 320,
      x: [0, 1],
      y: [0, 1],
      margin: { l: 6, r: 6, t: 6, b: 6 },
      label: T.plot1,
    });
    const st = { m: 4, n: 4, edges: new Set(), sel: null, inv: false };
    const key = (i, j) => i + ',' + j;

    function load(name) {
      st.sel = null;
      if (name === 'empty') {
        st.edges = new Set();
      } else {
        const pr = PRESETS1[name];
        st.m = pr.m;
        st.n = pr.n;
        mS.set(pr.m);
        nS.set(pr.n);
        st.edges = new Set(pr.e.map(([i, j]) => key(i, j)));
      }
      draw();
    }

    const preset = F.seg([
      { value: 'func', label: T.pFunc },
      { value: 'not', label: T.pNot },
      { value: 'inj', label: T.pInj },
      { value: 'onto', label: T.pOnto },
      { value: 'bij', label: T.pBij },
      { value: 'empty', label: T.pEmpty },
    ], 'bij', load, T.presets);
    const resize = () => {
      for (const k of Array.from(st.edges)) {
        const [i, j] = k.split(',').map(Number);
        if (i >= st.m || j >= st.n) st.edges.delete(k);
      }
      if (st.sel !== null && st.sel >= st.m) st.sel = null;
      draw();
    };
    const mS = F.slider({ label: T.sizeA, min: 1, max: 5, step: 1, value: st.m, fmt: int, oninput: (v) => {
      st.m = Math.round(v);
      resize();
    } });
    const nS = F.slider({ label: T.sizeB, min: 1, max: 5, step: 1, value: st.n, fmt: int, oninput: (v) => {
      st.n = Math.round(v);
      resize();
    } });
    const inv = F.check(T.showInv, false, (v) => {
      st.inv = v;
      draw();
    });
    fig.controls.append(preset.el, mS.el, nS.el, inv.el);

    const ro = F.readout(fig.readout, [
      { key: 'func', label: T.rFunc },
      { key: 'map', label: T.rMap },
      { key: 'inj', label: T.rInj },
      { key: 'onto', label: T.rOnto },
      { key: 'inv', label: T.rInv },
    ]);

    function analyse() {
      const out = Array.from({ length: st.m }, () => []);
      const inc = Array.from({ length: st.n }, () => []);
      for (const k of st.edges) {
        const [i, j] = k.split(',').map(Number);
        out[i].push(j);
        inc[j].push(i);
      }
      out.forEach((a) => a.sort((x, y) => x - y));
      inc.forEach((a) => a.sort((x, y) => x - y));
      const forks = out.map((a, i) => (a.length > 1 ? i : -1)).filter((i) => i >= 0);
      const missing = out.map((a, i) => (a.length === 0 ? i : -1)).filter((i) => i >= 0);
      const merges = inc.map((a, j) => (a.length > 1 ? j : -1)).filter((j) => j >= 0);
      const emptyB = inc.map((a, j) => (a.length === 0 ? j : -1)).filter((j) => j >= 0);
      return { out, inc, forks, missing, merges, emptyB };
    }

    function draw() {
      const { m, n } = st;
      const xA = 0.24;
      const xB = 0.76;
      const yA = column(m, 0.45, 0.64);
      const yB = column(n, 0.45, 0.64);
      const a = analyse();
      p.clear();
      oval(p, xA, 0.45, narrow ? 0.15 : 0.1, 0.42);
      oval(p, xB, 0.45, narrow ? 0.15 : 0.1, 0.42);
      p.text(xA, 0.95, 'A', 'lbl ink', { anchor: 'middle', dy: 4 });
      p.text(xB, 0.95, 'B', 'lbl ink', { anchor: 'middle', dy: 4 });

      for (const k of st.edges) {
        const [i, j] = k.split(',').map(Number);
        const bad = st.inv ? a.merges.includes(j) : a.forks.includes(i);
        const cls = bad ? 'warm' : st.inv ? 'teal' : 'accent';
        if (st.inv) link(p, xB, yB[j], xA, yA[i], cls);
        else link(p, xA, yA[i], xB, yB[j], cls);
      }
      for (let i = 0; i < m; i++) {
        p.dot(xA, yA[i], st.sel === i ? 'accent' : 'hollow', st.sel === i ? 7.5 : 5.5);
        p.text(xA, yA[i], LA[i], 'lbl ink', { anchor: 'end', dx: -14, dy: 5 });
        hit(p, xA, yA[i], T.elA(LA[i]), () => {
          st.sel = st.sel === i ? null : i;
          draw();
        });
      }
      for (let j = 0; j < n; j++) {
        p.dot(xB, yB[j], 'hollow', 5.5);
        p.text(xB, yB[j], LB[j], 'lbl ink', { anchor: 'start', dx: 14, dy: 5 });
        hit(p, xB, yB[j], T.elB(LB[j]), () => {
          if (st.sel === null) return;
          const k2 = key(st.sel, j);
          if (st.edges.has(k2)) st.edges.delete(k2);
          else st.edges.add(k2);
          st.sel = null;
          draw();
        });
      }

      const isFunc = a.forks.length === 0;
      const isMap = isFunc && a.missing.length === 0;
      const isInj = a.merges.length === 0;
      const isOnto = isMap && a.emptyB.length === 0;
      const yn = (v) => (v ? T.yes : T.no);
      ro.set('func', yn(isFunc), isFunc ? 'accent' : 'warm');
      ro.set('map', yn(isMap), isMap ? 'accent' : 'warm');
      ro.set('inj', isFunc ? yn(isInj) : T.dash, isFunc ? (isInj ? 'accent' : 'warm') : '');
      ro.set('onto', yn(isOnto), isOnto ? 'accent' : 'warm');
      ro.set('inv', yn(isInj), isInj ? 'accent' : 'warm');

      const mergeText = () => {
        const j = a.merges[0];
        return T.merge(LB[j], listWords(a.inc[j].map((i) => LA[i])));
      };
      let text;
      let cls = 'fig-note';
      if (st.sel !== null) {
        text = T.picked(LA[st.sel]);
      } else if (st.edges.size === 0) {
        text = T.empty;
      } else if (!isFunc) {
        const i = a.forks[0];
        text = T.fork(LA[i], listWords(a.out[i].map((j) => LB[j]))) + T.notFuncInv(isInj);
        cls = 'fig-note bad';
      } else if (!isMap) {
        text = T.missing(listWords(a.missing.map((i) => LA[i])));
      } else if (isInj && isOnto) {
        text = T.bij;
        cls = 'fig-note ok';
      } else if (isInj) {
        text = T.injOnly(listWords(a.emptyB.map((j) => LB[j])));
      } else if (a.emptyB.length === 0) {
        text = T.ontoOnly(mergeText());
      } else {
        text = T.neither(mergeText(), listWords(a.emptyB.map((j) => LB[j])));
      }
      if (st.inv && st.sel === null) text += T.invTail;
      fig.note.className = cls;
      fig.note.textContent = text;
    }

    load('bij');
  });

  /* =================================================================================
   * Рисунок 2. Композиция f · g (по Куликову: сначала g, потом f). Читатель задаёт
   * g: A → B и f: B → C щелчками, рисунок рисует дуги композиции и проверяет
   * инъективность и «на».
   * ================================================================================= */
  const CA = ['a', 'b', 'c'];
  const CB = ['1', '2', '3', '4'];
  const CC = ['x', 'y', 'z'];
  const PRESETS2 = {
    both: { g: [0, 1, 2], f: [0, 1, 2, null] },
    gglue: { g: [0, 0, 1], f: [0, 1, 2, 0] },
    fglue: { g: [0, 1, 2], f: [0, 1, 2, 0] },
    hole: { g: [0, 1, 3], f: [0, 1, 2, null] },
  };

  MC.widget('compose', (el) => {
    const fig = F.shell(el, { kicker: T.fig2, title: T.title2 });
    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    const p = new MC.Plot(fig.plot, {
      width: W,
      height: W < 520 ? 320 : 330,
      x: [0, 1],
      y: [0, 1.05],
      margin: { l: 6, r: 6, t: 6, b: 6 },
      label: T.plot2,
    });
    const st = { g: [], f: [], sel: null, comp: true };

    function load(name) {
      const pr = PRESETS2[name];
      st.g = pr.g.slice();
      st.f = pr.f.slice();
      st.sel = null;
      draw();
    }
    const preset = F.seg([
      { value: 'both', label: T.cBoth },
      { value: 'gglue', label: T.cG },
      { value: 'fglue', label: T.cF },
      { value: 'hole', label: T.cHole },
    ], 'both', load, T.presets);
    const comp = F.check(T.showComp, true, (v) => {
      st.comp = v;
      draw();
    });
    fig.controls.append(preset.el, comp.el);
    const ro = F.readout(fig.readout, [
      { key: 'dom', label: T.rDom },
      { key: 'g', label: T.rgInj },
      { key: 'f', label: T.rfInj },
      { key: 'fg', label: T.rfgInj },
      { key: 'onto', label: T.rfgOnto },
    ]);

    /** Пары, которые функция h (массив значений, null — не определена) склеивает; первая найденная. */
    function glue(h, dom) {
      for (let i = 0; i < h.length; i++) {
        for (let k = i + 1; k < h.length; k++) {
          if (dom(i) && dom(k) && h[i] !== null && h[i] === h[k]) return [i, k];
        }
      }
      return null;
    }

    function draw() {
      const xs = [0.12, 0.5, 0.88];
      const ya = column(3, 0.45, 0.6);
      const yb = column(4, 0.45, 0.6);
      const yc = column(3, 0.45, 0.6);
      p.clear();
      const rx = W < 520 ? 0.1 : 0.07;
      oval(p, xs[0], 0.45, rx, 0.36);
      oval(p, xs[1], 0.45, rx, 0.36);
      oval(p, xs[2], 0.45, rx, 0.36);
      ['A', 'B', 'C'].forEach((s, i) => p.text(xs[i], 0.03, s, 'lbl ink', { anchor: 'middle', dy: 2 }));

      const fg = st.g.map((j) => (j !== null && st.f[j] !== null && st.f[j] !== undefined ? st.f[j] : null));
      st.g.forEach((j, i) => {
        if (j !== null) link(p, xs[0], ya[i], xs[1], yb[j], 'accent', 0.1);
      });
      st.f.forEach((k, j) => {
        if (k !== null) link(p, xs[1], yb[j], xs[2], yc[k], 'warm', 0.1);
      });
      if (st.comp) {
        fg.forEach((k, i) => {
          if (k === null) return;
          const P0 = [xs[0] + 0.02, ya[i] + 0.03];
          const P1 = [xs[2] - 0.02, yc[k] + 0.03];
          const Pc = [0.5, 1.2];
          const pts = [];
          for (let t = 0; t <= 1.0001; t += 0.04) {
            const u = 1 - t;
            pts.push([u * u * P0[0] + 2 * t * u * Pc[0] + t * t * P1[0], u * u * P0[1] + 2 * t * u * Pc[1] + t * t * P1[1]]);
          }
          p.path(pts, 'curve teal');
          const q = pts[pts.length - 3];
          p.arrow(q[0], q[1], P1[0], P1[1], 'teal', 'main', 8);
        });
      }
      const col = (labels, ys, x, colIdx, name, anchor) => {
        labels.forEach((s, i) => {
          const on = st.sel && st.sel[0] === colIdx && st.sel[1] === i;
          p.dot(x, ys[i], on ? 'accent' : 'hollow', on ? 7.5 : 5.5);
          p.text(x, ys[i], s, 'lbl ink', { anchor, dx: anchor === 'end' ? -13 : 13, dy: 5 });
          hit(p, x, ys[i], name(s), () => pick(colIdx, i));
        });
      };
      col(CA, ya, xs[0], 0, T.elA, 'end');
      col(CB, yb, xs[1], 1, T.elB, 'start');
      col(CC, yc, xs[2], 2, T.elC, 'start');

      const dom = CA.map((_, i) => fg[i] !== null);
      const gGlue = glue(st.g, () => true);
      const fGlue = glue(st.f, () => true);
      const fgGlue = glue(fg, () => true);
      const gInj = !gGlue;
      const fInj = !fGlue;
      const fgInj = !fgGlue;
      const allDom = dom.every(Boolean);
      const onto = allDom && CC.every((_, k) => fg.includes(k));
      const yn = (v) => (v ? T.yes : T.no);
      const domList = CA.filter((_, i) => dom[i]);
      ro.set('dom', '{' + domList.join(', ') + '}', allDom ? '' : 'warm');
      ro.set('g', yn(gInj), gInj ? 'accent' : 'warm');
      ro.set('f', yn(fInj), fInj ? 'accent' : 'warm');
      ro.set('fg', yn(fgInj), fgInj ? 'accent' : 'warm');
      ro.set('onto', yn(onto), onto ? 'accent' : 'warm');

      let text;
      if (st.sel) {
        text = st.sel[0] === 0 ? T.pickA(CA[st.sel[1]]) : T.pickB(CB[st.sel[1]]);
      } else if (!allDom) {
        const i = dom.indexOf(false);
        text = st.g[i] === null ? T.gUndef(CA[i]) : T.fUndef(CA[i], CB[st.g[i]]);
      } else if (gInj && fInj) {
        text = T.both;
      } else if (gGlue) {
        text = T.gGlue(CA[gGlue[0]], CA[gGlue[1]]);
      } else if (fgInj) {
        text = T.fGlueHidden(CB[fGlue[0]], CB[fGlue[1]]);
      } else {
        text = T.fGlue(CA[fgGlue[0]], CA[fgGlue[1]]);
      }
      fig.note.className = 'fig-note';
      fig.note.textContent = text;
    }

    function pick(colIdx, i) {
      const s = st.sel;
      if (colIdx === 1 && s && s[0] === 0) {
        st.g[s[1]] = st.g[s[1]] === i ? null : i;
        st.sel = null;
      } else if (colIdx === 2 && s && s[0] === 1) {
        st.f[s[1]] = st.f[s[1]] === i ? null : i;
        st.sel = null;
      } else if (colIdx === 2) {
        st.sel = null;
      } else {
        st.sel = s && s[0] === colIdx && s[1] === i ? null : [colIdx, i];
      }
      draw();
    }

    load('both');
  });
})();
