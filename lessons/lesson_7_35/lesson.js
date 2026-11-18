/* Урок 7.35 «Подпространства векторного пространства» (Куликов, гл. 7, § 2):
 * рисунок 1 «Сумма двух прямых через нуль» — разложение c = a + b по прямым L и U, прямая сумма
 * при L ∩ U = {0} (теорема 2.1); рисунок 2 «Пересечение линейных многообразий» — a + L и b + U,
 * разложение a − b = v + u и общая точка b + u (свойства 2.8, 2.11, 2.13). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Сумма двух прямых через нуль',
      t2: 'Пересечение линейных многообразий',
      aria1: 'Прямые L и U через начало координат и разложение вектора c на слагаемые из L и U',
      aria2: 'Две прямые a + L и b + U и их общая точка',
      merge: 'Совместить прямые', same: 'Одно направление', reset: 'Сначала',
      cap: 'L ∩ U', direct: 'сумма прямая?', yes: 'да', no: 'нет', zero: '{0}', line: 'L',
      ra: 'a ∈ L', rb: 'b ∈ U', rc: 'c',
      ok1: (a, b) => 'L ∩ U = {0}: сумма прямая (теорема 2.1). Вектор c раскладывается единственным образом: c = a + b, a = ' + a + ' ∈ L, b = ' + b + ' ∈ U.',
      onLine: 'Прямые совпали: L ∩ U = L ≠ {0}, сумма не прямая. Вектор c лежит на прямой, и разложений бесконечно много — например, c = c + 0 и c = 0 + c.',
      offLine: 'Прямые совпали: L ∩ U = L ≠ {0}, сумма не прямая и равна самой прямой. Вектор c вне её — он вообще не раскладывается: c ∉ L + U.',
      rd: 'a − b', rv: 'v ∈ L', ru: 'u ∈ U', rp: 'общая точка',
      none: '—',
      ok2: (p) => 'R² = L ⊕ U, поэтому a − b = v + u раскладывается, и прямые пересекаются ровно в одной точке b + u = a − v = ' + p + ' (свойства 2.11 и 2.13).',
      coincide: 'Одно направление, и a − b ∈ L: многообразия совпадают (свойства 2.7 и 2.8).',
      disjoint: 'Одно направление, а a − b ∉ L + L = L: многообразия параллельны и не пересекаются (свойства 2.8 и 2.11).',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'The sum of two lines through zero',
      t2: 'Intersection of linear manifolds',
      aria1: 'Lines L and U through the origin and the decomposition of the vector c into parts from L and U',
      aria2: 'Two lines a + L and b + U and their common point',
      merge: 'Merge the lines', same: 'Same direction', reset: 'Restart',
      cap: 'L ∩ U', direct: 'direct sum?', yes: 'yes', no: 'no', zero: '{0}', line: 'L',
      ra: 'a ∈ L', rb: 'b ∈ U', rc: 'c',
      ok1: (a, b) => 'L ∩ U = {0}: the sum is direct (theorem 2.1). The vector c decomposes uniquely: c = a + b, a = ' + a + ' ∈ L, b = ' + b + ' ∈ U.',
      onLine: 'The lines coincide: L ∩ U = L ≠ {0}, the sum is not direct. The vector c lies on the line and has infinitely many decompositions — for example, c = c + 0 and c = 0 + c.',
      offLine: 'The lines coincide: L ∩ U = L ≠ {0}, the sum is not direct and equals the line itself. The vector c is off the line, so it does not decompose at all: c ∉ L + U.',
      rd: 'a − b', rv: 'v ∈ L', ru: 'u ∈ U', rp: 'common point',
      none: '—',
      ok2: (p) => 'R² = L ⊕ U, so a − b = v + u decomposes, and the lines meet in exactly one point b + u = a − v = ' + p + ' (properties 2.11 and 2.13).',
      coincide: 'Same direction and a − b ∈ L: the manifolds coincide (properties 2.7 and 2.8).',
      disjoint: 'Same direction but a − b ∉ L + L = L: the manifolds are parallel and do not meet (properties 2.8 and 2.11).',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Nol orqali o‘tuvchi ikki to‘g‘ri chiziq yig‘indisi',
      t2: 'Chiziqli ko‘pxilliklar kesishmasi',
      aria1: 'Koordinatalar boshi orqali o‘tuvchi L va U to‘g‘ri chiziqlar va c vektorining L va U dagi qo‘shiluvchilarga yoyilmasi',
      aria2: 'a + L va b + U to‘g‘ri chiziqlar va ularning umumiy nuqtasi',
      merge: 'Chiziqlarni ustma-ust qo‘yish', same: 'Bir xil yo‘nalish', reset: 'Boshidan',
      cap: 'L ∩ U', direct: 'to‘g‘ri yig‘indimi?', yes: 'ha', no: 'yo‘q', zero: '{0}', line: 'L',
      ra: 'a ∈ L', rb: 'b ∈ U', rc: 'c',
      ok1: (a, b) => 'L ∩ U = {0}: yig‘indi to‘g‘ri (2.1-teorema). c vektori yagona usulda yoyiladi: c = a + b, a = ' + a + ' ∈ L, b = ' + b + ' ∈ U.',
      onLine: 'Chiziqlar ustma-ust tushdi: L ∩ U = L ≠ {0}, yig‘indi to‘g‘ri emas. c vektori chiziqda yotadi va yoyilmalari cheksiz ko‘p — masalan, c = c + 0 va c = 0 + c.',
      offLine: 'Chiziqlar ustma-ust tushdi: L ∩ U = L ≠ {0}, yig‘indi to‘g‘ri emas va chiziqning o‘ziga teng. c vektori undan tashqarida — u umuman yoyilmaydi: c ∉ L + U.',
      rd: 'a − b', rv: 'v ∈ L', ru: 'u ∈ U', rp: 'umumiy nuqta',
      none: '—',
      ok2: (p) => 'R² = L ⊕ U, shuning uchun a − b = v + u yoyiladi va chiziqlar aynan bitta nuqtada kesishadi: b + u = a − v = ' + p + ' (2.11 va 2.13-xossalar).',
      coincide: 'Yo‘nalish bir xil va a − b ∈ L: ko‘pxilliklar ustma-ust tushadi (2.7 va 2.8-xossalar).',
      disjoint: 'Yo‘nalish bir xil, lekin a − b ∉ L + L = L: ko‘pxilliklar parallel va kesishmaydi (2.8 va 2.11-xossalar).',
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const EPS = 1e-9;
  const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
  const isZero = (v) => Math.abs(v[0]) < EPS && Math.abs(v[1]) < EPS;
  const pt = (v) => U.pt(v[0], v[1], 2);

  /** Каркас плоского рисунка: график с равным масштабом, перестройка по ширине, перетаскиваемые точки. */
  function planeFigure(fig, aria, handles, draw) {
    const st = { p: null, W: 0, hs: [] };
    st.snap = (v, lo, hi) => Math.round(U.clamp(v, lo, hi) * 2) / 2;
    st.build = () => {
      st.W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      st.p = new MC.Plot(fig.plot, { width: st.W, height: Math.round(st.W * (st.W < 500 ? 0.85 : 0.6)), x: [-6, 6], y: [-4.5, 4.5], equal: true, label: aria });
      st.p.axes({ xLabel: 'x', yLabel: 'y' });
      // Ручки создаются один раз на график: при перерисовке они только переставляются (иначе обрывается перетаскивание).
      st.hs = handles.map((h) => st.p.handle(0, 0, (q) => {
        const xd = st.p.xd;
        const yd = st.p.yd;
        h.move([st.snap(q.x, xd[0] + 0.5, xd[1] - 0.5), st.snap(q.y, yd[0] + 0.5, yd[1] - 0.5)]);
        st.redraw();
      }, h.cls));
    };
    st.redraw = () => {
      if (!st.p || plotWidth(fig.plot) !== st.W) st.build();
      st.p.clear('main');
      handles.forEach((h, i) => {
        const q = h.at();
        st.hs[i].place(q[0], q[1]);
      });
      draw(st.p);
    };
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (plotWidth(fig.plot) !== st.W) st.redraw();
      }, 150);
    });
    return st;
  }

  /** Прямая через точку p с направлением d на всю область графика. */
  function fullLine(P, p, d, cls) {
    const k = 40 / Math.hypot(d[0], d[1]);
    P.seg(p[0] - d[0] * k, p[1] - d[1] * k, p[0] + d[0] * k, p[1] + d[1] * k, cls);
  }
  const label = (P, x, y, s, cls) => P.text(x, y, s, 'lbl ' + cls, { dx: x >= 0 ? 10 : -10, dy: y >= 0 ? -10 : 20, anchor: x >= 0 ? 'start' : 'end', layer: 'main' });

  /* ---------------------- Рисунок 1: сумма двух прямых через нуль ---------------------- */
  MC.widget('direct-sum', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const START = { l: [3, 1], u: [1, 2.5], c: [-1, 3] };
    const s = { l: START.l.slice(), u: START.u.slice(), c: START.c.slice() };
    const bMerge = F.button(null, T.merge, () => {
      s.u = [-s.l[0] / 2, -s.l[1] / 2];
      if (isZero([Math.round(s.u[0] * 2), Math.round(s.u[1] * 2)])) s.u = s.l.slice();
      fg.redraw();
    });
    const bReset = F.button(null, T.reset, () => {
      s.l = START.l.slice();
      s.u = START.u.slice();
      s.c = START.c.slice();
      fg.redraw();
    });
    fig.controls.append(bMerge, bReset);
    const ro = F.readout(fig.readout, [
      { key: 'cap', label: T.cap },
      { key: 'dir', label: T.direct },
      { key: 'a', label: T.ra },
      { key: 'b', label: T.rb },
    ]);
    const nonzero = (v, old) => (isZero(v) ? old : v);
    const fg = planeFigure(fig, T.aria1, [
      { cls: 'accent', at: () => s.l, move: (v) => (s.l = nonzero(v, s.l)) },
      { cls: 'warm', at: () => s.u, move: (v) => (s.u = nonzero(v, s.u)) },
      { cls: '', at: () => s.c, move: (v) => (s.c = v) },
    ], (P) => {
      const D = cross(s.l, s.u);
      fullLine(P, [0, 0], s.l, 'curve accent');
      fullLine(P, [0, 0], s.u, 'curve warm dash');
      P.arrow(0, 0, s.l[0], s.l[1], 'accent', 'main');
      P.arrow(0, 0, s.u[0], s.u[1], 'warm', 'main');
      label(P, s.l[0], s.l[1], 'L', 'accent');
      label(P, s.u[0], s.u[1], 'U', 'warm');
      if (Math.abs(D) > EPS) {
        const sa = cross(s.c, s.u) / D;
        const tb = cross(s.l, s.c) / D;
        const a = [sa * s.l[0], sa * s.l[1]];
        const b = [tb * s.u[0], tb * s.u[1]];
        P.seg(a[0], a[1], s.c[0], s.c[1], 'guide');
        P.seg(b[0], b[1], s.c[0], s.c[1], 'guide');
        if (!isZero(a)) P.arrow(0, 0, a[0], a[1], 'accent', 'main');
        if (!isZero(b)) P.arrow(0, 0, b[0], b[1], 'warm', 'main');
        P.dot(a[0], a[1], 'accent', 4, 'main');
        P.dot(b[0], b[1], 'warm', 4, 'main');
        label(P, a[0], a[1], 'a', 'accent');
        label(P, b[0], b[1], 'b', 'warm');
        ro.set('cap', T.zero, 'accent');
        ro.set('dir', T.yes, 'accent');
        ro.set('a', pt(a), 'accent');
        ro.set('b', pt(b), 'warm');
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.ok1(pt(a), pt(b));
      } else {
        const on = Math.abs(cross(s.l, s.c)) < EPS;
        ro.set('cap', T.line, 'warm');
        ro.set('dir', T.no, 'warm');
        ro.set('a', on ? pt(s.c) : T.none);
        ro.set('b', on ? pt([0, 0]) : T.none);
        fig.note.className = 'fig-note';
        fig.note.textContent = on ? T.onLine : T.offLine;
      }
      if (!isZero(s.c)) P.arrow(0, 0, s.c[0], s.c[1], 'ink', 'main');
      label(P, s.c[0], s.c[1], 'c', '');
    });
    fg.redraw();
  });

  /* ---------------------- Рисунок 2: пересечение линейных многообразий ---------------------- */
  MC.widget('affine-meet', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const START = { a: [-4, -1], l: [2, 1], b: [3, -2], u: [-1, 2] };
    const s = { a: START.a.slice(), l: START.l.slice(), b: START.b.slice(), u: START.u.slice() };
    const bSame = F.button(null, T.same, () => {
      s.u = s.l.slice();
      fg.redraw();
    });
    const bReset = F.button(null, T.reset, () => {
      Object.keys(START).forEach((k) => (s[k] = START[k].slice()));
      fg.redraw();
    });
    fig.controls.append(bSame, bReset);
    const ro = F.readout(fig.readout, [
      { key: 'd', label: T.rd },
      { key: 'v', label: T.rv },
      { key: 'u', label: T.ru },
      { key: 'p', label: T.rp },
    ]);
    const plus = (p, q) => [p[0] + q[0], p[1] + q[1]];
    const minus = (p, q) => [p[0] - q[0], p[1] - q[1]];
    const fg = planeFigure(fig, T.aria2, [
      { cls: 'accent', at: () => s.a, move: (v) => (s.a = v) },
      { cls: 'accent', at: () => plus(s.a, s.l), move: (v) => {
        const d = minus(v, s.a);
        if (!isZero(d)) s.l = d;
      } },
      { cls: 'warm', at: () => s.b, move: (v) => (s.b = v) },
      { cls: 'warm', at: () => plus(s.b, s.u), move: (v) => {
        const d = minus(v, s.b);
        if (!isZero(d)) s.u = d;
      } },
    ], (P) => {
      fullLine(P, s.a, s.l, 'curve accent');
      fullLine(P, s.b, s.u, 'curve warm dash');
      P.arrow(s.a[0], s.a[1], s.a[0] + s.l[0], s.a[1] + s.l[1], 'accent', 'main');
      P.arrow(s.b[0], s.b[1], s.b[0] + s.u[0], s.b[1] + s.u[1], 'warm', 'main');
      const d = minus(s.a, s.b);
      P.seg(s.b[0], s.b[1], s.a[0], s.a[1], 'guide');
      label(P, s.a[0], s.a[1], 'a', 'accent');
      label(P, s.b[0], s.b[1], 'b', 'warm');
      ro.set('d', pt(d));
      const D = cross(s.l, s.u);
      if (Math.abs(D) > EPS) {
        const sv = cross(d, s.u) / D;
        const tu = cross(s.l, d) / D;
        const v = [sv * s.l[0], sv * s.l[1]];
        const u = [tu * s.u[0], tu * s.u[1]];
        const c = plus(s.b, u);
        if (!isZero(u)) P.arrow(s.b[0], s.b[1], c[0], c[1], 'warm', 'main');
        if (!isZero(v)) P.arrow(c[0], c[1], s.a[0], s.a[1], 'accent', 'main');
        P.dot(c[0], c[1], '', 6, 'main');
        P.text(c[0], c[1], 'b + u', 'lbl', { dx: 10, dy: 18, layer: 'main' });
        ro.set('v', pt(v), 'accent');
        ro.set('u', pt(u), 'warm');
        ro.set('p', pt(c));
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.ok2(pt(c));
      } else {
        const same = Math.abs(cross(d, s.l)) < EPS;
        ro.set('v', T.none);
        ro.set('u', T.none);
        ro.set('p', T.none);
        fig.note.className = 'fig-note' + (same ? ' ok' : '');
        fig.note.textContent = same ? T.coincide : T.disjoint;
      }
    });
    fg.redraw();
  });
})();
