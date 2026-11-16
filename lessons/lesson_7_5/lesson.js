/* Урок 7.5 «Отношения порядка»: рисунки «Матрица отношения» и «Диаграмма Хассе». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  /* Строки интерфейса (пока только ru; переводы добавятся позже). */
  const T = MC.i18n.pick({
    ru: {
      fig1: 'Рисунок 1',
      title1: 'Матрица отношения на $\\{1, 2, 3\\}$: порядок или нет?',
      tableAria: 'Матрица бинарного отношения на множестве из трёх элементов',
      cellAria: (x, y, on) => 'Пара ⟨' + x + ', ' + y + '⟩: ' + (on ? 'входит в R' : 'не входит в R'),
      preset: 'Готовые отношения',
      presets: { le: '$\\leqslant$', lt: '$<$', mixed: 'смешанное', pre: 'предпорядок', div: 'не порядок' },
      refl: 'рефлексивно',
      irr: 'антирефлексивно',
      anti: 'антисимметрично',
      trans: 'транзитивно',
      conn: 'связанно',
      yes: 'да',
      no: 'нет',
      noRefl: (x) => 'нет пары ⟨' + x + ', ' + x + '⟩',
      noIrr: (x) => 'есть петля ⟨' + x + ', ' + x + '⟩',
      noAnti: (x, y) => '⟨' + x + ', ' + y + '⟩ и ⟨' + y + ', ' + x + '⟩ при ' + x + ' ≠ ' + y,
      noTrans: (x, y, z) => '⟨' + x + ', ' + y + '⟩, ⟨' + y + ', ' + z + '⟩, но нет ⟨' + x + ', ' + z + '⟩',
      noConn: (x, y) => x + ' и ' + y + ' несравнимы',
      vNonstrictLin: 'Нестрогий линейный порядок: транзитивно, антисимметрично, рефлексивно и связанно.',
      vNonstrict: 'Нестрогий порядок (транзитивно, антисимметрично, рефлексивно), но не линейный: ',
      vStrictLin: 'Строгий линейный порядок: транзитивно, антирефлексивно (значит, и антисимметрично) и связанно.',
      vStrict: 'Строгий порядок (транзитивно и антирефлексивно), но не линейный: ',
      vMixed: (a, b) => 'Порядок по определению Куликова (транзитивно и антисимметрично), но ни строгий, ни нестрогий: ' + a + ', а ' + b + '.',
      vPre: (w) => 'Предпорядок (рефлексивно и транзитивно), но не порядок — нарушена антисимметричность: ' + w + '.',
      vNotTrans: (w) => 'Не порядок — нарушена транзитивность: ' + w + '. Нажмите на клетки, чтобы исправить.',
      vNotAnti: (w) => 'Не порядок — нарушена антисимметричность: ' + w + '.',
      fig2: 'Рисунок 2',
      title2: 'Диаграмма Хассе: минимальные, максимальные, наименьший и наибольший',
      plot2: 'Диаграмма Хассе упорядоченного множества',
      poset: 'Множество и порядок',
      posets: { d12: 'делители 12', d30: 'делители 30', nat: '$2, 3, \\dots, 16$', sub: '$P(\\{a, b, c\\})$' },
      mode: 'Порядок',
      modes: { part: 'исходный', lin: 'линейный' },
      all: 'Всё множество',
      none: 'Очистить',
      ptAria: (s, on) => s + (on ? ': в подмножестве B' : ': вне подмножества B'),
      roMin: 'минимальные в $B$',
      roMax: 'максимальные в $B$',
      roLeast: 'наименьший в $B$',
      roGreatest: 'наибольший в $B$',
      dash: 'нет',
      empty: 'Подмножество B пусто: в нём нет ни минимальных, ни наименьшего элемента. Нажимайте на точки, чтобы добавить элементы в B.',
      linName: { d12: 'обычный порядок ≤ чисел', d30: 'обычный порядок ≤ чисел', nat: 'обычный порядок ≤ чисел', sub: 'сначала по числу элементов, затем по алфавиту' },
      partName: { d12: 'делимость', d30: 'делимость', nat: 'делимость', sub: 'включение ⊂' },
      chain: 'Любые два элемента B сравнимы — B линейно упорядочено, и минимальный элемент совпадает с наименьшим, максимальный — с наибольшим. ',
      notChain: (a, b) => 'В B есть несравнимые элементы, например ' + a + ' и ' + b + '. ',
      manyMin: (k) => 'Минимальных элементов ' + k + ' — поэтому наименьшего нет: наименьший был бы меньше каждого из них. ',
      oneMin: (m) => 'Минимальный элемент один — ' + m + ', и в конечном множестве он же наименьший. ',
      manyMax: (k) => 'Максимальных ' + k + ' — наибольшего нет.',
      oneMax: (m) => 'Максимальный один — ' + m + ', он же наибольший.',
      modeNote: (name) => 'Порядок: ' + name + '. ',
    },
  });

  /* =================================================================================
   * Рисунок 1. Матрица 3 × 3 бинарного отношения R на {1, 2, 3}. Клетка (x, y) закрашена,
   * если ⟨x, y⟩ ∈ R. Справа — свойства и вердикт: какой это порядок по Куликову.
   * ================================================================================= */
  const A3 = [1, 2, 3];
  const PRESETS = {
    le: [[1, 1], [1, 2], [1, 3], [2, 2], [2, 3], [3, 3]],
    lt: [[1, 2], [1, 3], [2, 3]],
    mixed: [[1, 1], [1, 2], [1, 3], [2, 3]],
    pre: [[1, 1], [2, 2], [3, 3], [1, 2], [2, 1], [1, 3], [2, 3]],
    div: [[1, 2], [2, 3]],
  };

  function analyse(R) {
    const has = (x, y) => R.has(x + ',' + y);
    const out = { w: {} };
    const noR = A3.find((x) => !has(x, x));
    const noI = A3.find((x) => has(x, x));
    out.refl = noR === undefined;
    out.irr = noI === undefined;
    if (!out.refl) out.w.refl = T.noRefl(noR);
    if (!out.irr) out.w.irr = T.noIrr(noI);
    out.anti = true;
    out.trans = true;
    out.conn = true;
    for (const x of A3) {
      for (const y of A3) {
        if (x < y && has(x, y) && has(y, x) && out.anti) {
          out.anti = false;
          out.w.anti = T.noAnti(x, y);
        }
        if (x < y && !has(x, y) && !has(y, x) && out.conn) {
          out.conn = false;
          out.w.conn = T.noConn(x, y);
        }
        for (const z of A3) {
          if (has(x, y) && has(y, z) && !has(x, z) && out.trans) {
            out.trans = false;
            out.w.trans = T.noTrans(x, y, z);
          }
        }
      }
    }
    return out;
  }

  MC.widget('relmatrix', (el) => {
    const fig = F.shell(el, { kicker: T.fig1, title: T.title1 });
    let R = new Set(PRESETS.le.map((p) => p.join(',')));
    let svg = null;

    const presetSeg = F.seg(Object.keys(PRESETS).map((k) => ({ value: k, label: T.presets[k] })), 'le', (v) => {
      R = new Set(PRESETS[v].map((p) => p.join(',')));
      build();
    }, T.preset);
    fig.controls.append(presetSeg.el);

    const ro = F.readout(fig.readout, [
      { key: 'refl', label: T.refl },
      { key: 'irr', label: T.irr },
      { key: 'anti', label: T.anti },
      { key: 'trans', label: T.trans },
      { key: 'conn', label: T.conn },
    ]);

    function build() {
      const C = 64;
      const size = C * 4;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = size + 'px';
      const txt = (x, y, s, cls) => svg.appendChild(S('text', { class: cls, x: x + C / 2, y: y + C / 2 }, s));
      svg.appendChild(S('rect', { class: 'cell head', x: 2, y: 2, width: C - 4, height: C - 4 }));
      txt(0, 0, 'R', 'cv corner');
      A3.forEach((v, i) => {
        txt(C * (i + 1), 0, String(v), 'cv ch');
        txt(0, C * (i + 1), String(v), 'cv ch');
      });
      A3.forEach((x, i) =>
        A3.forEach((y, j) => {
          const key = x + ',' + y;
          const on = R.has(key);
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-pressed': String(on), 'aria-label': T.cellAria(x, y, on) });
          g.appendChild(S('rect', { class: 'cell' + (on ? ' on' : ''), x: C * (j + 1) + 2, y: C * (i + 1) + 2, width: C - 4, height: C - 4, rx: 4 }));
          g.appendChild(S('text', { class: 'cv', x: C * (j + 1) + C / 2, y: C * (i + 1) + C / 2 }, on ? '1' : '·'));
          const flip = (keep) => {
            if (R.has(key)) R.delete(key);
            else R.add(key);
            build();
            const again = svg.querySelectorAll('.cell-g')[i * 3 + j];
            if (keep && again) again.focus();
          };
          g.addEventListener('click', () => flip(false));
          g.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              flip(true);
            }
          });
          svg.appendChild(g);
        })
      );
      fig.plot.appendChild(svg);
      report();
    }

    function report() {
      const a = analyse(R);
      for (const k of ['refl', 'irr', 'anti', 'trans', 'conn']) ro.set(k, a[k] ? T.yes : T.no, a[k] ? 'accent' : '');
      const order = a.trans && a.anti;
      let text;
      let cls = 'fig-note';
      if (order && a.refl) text = a.conn ? T.vNonstrictLin : T.vNonstrict + a.w.conn + '.';
      else if (order && a.irr) text = a.conn ? T.vStrictLin : T.vStrict + a.w.conn + '.';
      else if (order) text = T.vMixed(a.w.refl, a.w.irr);
      else if (a.refl && a.trans) text = T.vPre(a.w.anti);
      else {
        cls = 'fig-note bad';
        text = !a.trans ? T.vNotTrans(a.w.trans) : T.vNotAnti(a.w.anti);
      }
      fig.note.className = order ? 'fig-note ok' : cls;
      fig.note.textContent = text;
    }

    build();
  });

  /* =================================================================================
   * Рисунок 2. Диаграмма Хассе. Точки — элементы, отрезок снизу вверх — «покрытие»
   * (a < b и между ними ничего нет). Читатель выбирает подмножество B, рисунок находит
   * в нём минимальные, максимальные, наименьший и наибольший элементы. Переключатель
   * заменяет исходный (частичный) порядок линейным на тех же элементах.
   * ================================================================================= */
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const divides = (a, b) => b % a === 0;
  const pop = (m) => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1);
  const SUB_ORDER = [0, 1, 2, 4, 3, 5, 6, 7]; // ∅, {a}, {b}, {c}, {a,b}, {a,c}, {b,c}, {a,b,c}
  const subName = (m) => (m === 0 ? '∅' : '{' + ['a', 'b', 'c'].filter((_, i) => m & (1 << i)).join(',') + '}');

  const POSETS = {
    d12: { els: [1, 2, 3, 4, 6, 12], le: divides, lin: (a, b) => a <= b, name: String },
    d30: { els: [1, 2, 3, 5, 6, 10, 15, 30], le: divides, lin: (a, b) => a <= b, name: String },
    nat: { els: range(2, 16), le: divides, lin: (a, b) => a <= b, name: String },
    sub: {
      els: SUB_ORDER.slice(),
      le: (a, b) => (a & b) === a,
      lin: (a, b) => SUB_ORDER.indexOf(a) <= SUB_ORDER.indexOf(b),
      name: subName,
    },
  };

  /** Слои диаграммы: ранг элемента — длина самой длинной цепи под ним. */
  function layout(els, le) {
    const lt = (a, b) => a !== b && le(a, b);
    const rank = new Map();
    const r = (x) => {
      if (rank.has(x)) return rank.get(x);
      let best = 0;
      for (const y of els) if (lt(y, x)) best = Math.max(best, r(y) + 1);
      rank.set(x, best);
      return best;
    };
    els.forEach(r);
    const layers = [];
    for (const x of els) (layers[rank.get(x)] = layers[rank.get(x)] || []).push(x);
    const edges = [];
    for (const a of els) for (const b of els) if (lt(a, b) && !els.some((c) => lt(a, c) && lt(c, b))) edges.push([a, b]);
    return { rank, layers, edges };
  }

  MC.widget('hasse', (el) => {
    const fig = F.shell(el, { kicker: T.fig2, title: T.title2 });
    const st = { poset: 'd12', mode: 'part', B: new Set(POSETS.d12.els) };

    const posetSeg = F.seg(Object.keys(POSETS).map((k) => ({ value: k, label: T.posets[k] })), st.poset, (v) => {
      st.poset = v;
      st.B = new Set(POSETS[v].els);
      draw();
    }, T.poset);
    const modeSeg = F.seg(Object.keys(T.modes).map((k) => ({ value: k, label: T.modes[k] })), st.mode, (v) => {
      st.mode = v;
      draw();
    }, T.mode);
    const allBtn = F.button(null, T.all, () => {
      st.B = new Set(POSETS[st.poset].els);
      draw();
    });
    const noneBtn = F.button(null, T.none, () => {
      st.B = new Set();
      draw();
    });
    fig.controls.append(posetSeg.el, modeSeg.el, allBtn, noneBtn);

    const ro = F.readout(fig.readout, [
      { key: 'min', label: T.roMin },
      { key: 'max', label: T.roMax },
      { key: 'least', label: T.roLeast },
      { key: 'greatest', label: T.roGreatest },
    ]);

    function draw(focusEl) {
      const P = POSETS[st.poset];
      const le = st.mode === 'lin' ? P.lin : P.le;
      const els = st.mode === 'lin' ? P.els.slice().sort((a, b) => (P.lin(a, b) ? -1 : 1)) : P.els;
      const L = layout(els, le);
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
      const top = L.layers.length - 1;
      const step = st.mode === 'lin' ? (els.length > 8 ? 30 : 44) : 86;
      const H = Math.max(260, step * top + 84);
      const pad = 28 / step + Math.max(0, (260 - (step * top + 84)) / (2 * step));
      fig.plot.replaceChildren();
      const p = new MC.Plot(fig.plot, { width: W, height: H, x: [0, 1], y: [-pad, top + pad], margin: { l: 10, r: 10, t: 14, b: 14 }, label: T.plot2 });
      const pos = new Map();
      L.layers.forEach((layer, k) => {
        layer.forEach((x, i) => {
          const px = st.mode === 'lin' ? 0.5 : (i + 1) / (layer.length + 1);
          pos.set(x, [px, k]);
        });
      });

      const B = els.filter((x) => st.B.has(x));
      const lt = (a, b) => a !== b && le(a, b);
      const mins = B.filter((a) => !B.some((x) => lt(x, a)));
      const maxs = B.filter((a) => !B.some((x) => lt(a, x)));
      const least = B.filter((a) => B.every((x) => le(a, x)));
      const greatest = B.filter((a) => B.every((x) => le(x, a)));

      for (const [a, b] of L.edges) {
        const [x1, y1] = pos.get(a);
        const [x2, y2] = pos.get(b);
        p.seg(x1, y1, x2, y2, st.B.has(a) && st.B.has(b) ? 'curve thin' : 'curve faint thin', 'main');
      }
      const R = narrowR(W, els.length);
      for (const x of els) {
        const [px, py] = pos.get(x);
        const inB = st.B.has(x);
        const isMin = mins.includes(x);
        const isMax = maxs.includes(x);
        if (least.includes(x) || greatest.includes(x)) {
          p._add(S('circle', { class: 'res-ring', cx: p.sx(px).toFixed(1), cy: p.sy(py).toFixed(1), r: R + 6 }), 'front');
        }
        if (!inB) p.dot(px, py, 'hollow small', R - 2);
        else if (isMin && isMax) {
          p.dot(px, py, 'warm', R);
          p.dot(px, py, 'accent', R / 2);
        } else p.dot(px, py, isMin ? 'accent' : isMax ? 'warm' : '', R);
        const lab = P.name(x);
        p.text(px, py, lab, 'lbl ' + (inB ? 'ink' : ''), { anchor: 'start', dx: R + 6, dy: 5 });
        const hit = S('circle', { class: 'hit', cx: p.sx(px).toFixed(1), cy: p.sy(py).toFixed(1), r: Math.max(R + 8, 16), tabindex: '0', role: 'button', 'aria-pressed': String(inB), 'aria-label': T.ptAria(lab, inB) });
        hit.dataset.el = String(x);
        const flip = (keep) => {
          if (st.B.has(x)) st.B.delete(x);
          else st.B.add(x);
          draw(keep ? String(x) : null);
        };
        hit.addEventListener('click', () => flip(false));
        hit.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            flip(true);
          }
        });
        p._add(hit, 'front');
      }
      if (focusEl) {
        const h = fig.plot.querySelector('.hit[data-el="' + focusEl + '"]');
        if (h) h.focus();
      }

      const list = (xs) => (xs.length ? xs.map(P.name).join(U.sep()) : T.dash);
      ro.set('min', list(mins), mins.length ? 'accent' : '');
      ro.set('max', list(maxs), maxs.length ? 'warm' : '');
      ro.set('least', list(least));
      ro.set('greatest', list(greatest));

      fig.note.className = 'fig-note';
      if (!B.length) {
        fig.note.textContent = T.empty;
        return;
      }
      let text = T.modeNote(st.mode === 'lin' ? T.linName[st.poset] : T.partName[st.poset]);
      let pair = null;
      for (const a of B) {
        for (const b of B) if (!pair && !le(a, b) && !le(b, a)) pair = [a, b];
      }
      text += pair ? T.notChain(P.name(pair[0]), P.name(pair[1])) : T.chain;
      if (pair) {
        text += mins.length > 1 ? T.manyMin(mins.length) : T.oneMin(P.name(mins[0]));
        text += maxs.length > 1 ? T.manyMax(maxs.length) : T.oneMax(P.name(maxs[0]));
      }
      fig.note.textContent = text.trim();
    }

    /** Радиус точки: на узком экране и при многих элементах — меньше. */
    function narrowR(W, n) {
      return W < 480 && n > 8 ? 7 : 9;
    }

    draw();
  });
})();
