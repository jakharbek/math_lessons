/* Урок 7.2 «Бинарные отношения»: рисунок «Отношение в трёх видах» (пары, 0/1-матрица, граф). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;
  const S = MC.svg;

  /* Строки интерфейса (пока только ru; en и uz добавят вместе с переводом урока). */
  const T = MC.i18n.pick({
    ru: {
      fig: 'Рисунок 1',
      title: 'Отношение как множество пар, как матрица и как граф',
      aria: 'Матрица отношения R, матрица результата и ориентированный граф',
      show: 'Показать',
      sWord: '$S$ =',
      views: { R: '$R$', inv: '$R^{\\smile}$', RS: '$R \\cdot S$', SR: '$S \\cdot R$' },
      sNames: { shift: 'сдвиг', id: '$i_A$', lt: 'раньше', R: '$R$' },
      sLong: { shift: 'сдвиг a→b→c→d→e→a', id: 'равенство i_A', lt: '«раньше по алфавиту»', R: 'само R' },
      fig11: 'Рис. 11',
      clear: 'Очистить',
      matR: 'R — нажимайте',
      res: { inv: 'R⌣', RS: 'R · S', SR: 'S · R' },
      graphOf: { R: 'граф R', inv: 'граф R⌣', RS: 'граф R · S', SR: 'граф S · R' },
      cellAria: (x, y, on) => 'Пара ⟨' + x + ', ' + y + '⟩: ' + (on ? 'входит в R, нажмите, чтобы убрать' : 'не входит в R, нажмите, чтобы добавить'),
      pairs: 'пар в $R$',
      dom: '$\\mathrm{Dom}\\,R$',
      im: '$\\mathrm{Im}\\,R$',
      field: 'область $R$',
      setR: 'R = ',
      setS: 'S = ',
      setRes: { inv: 'R⌣ = ', RS: 'R · S = ', SR: 'S · R = ' },
      emptyR: 'R пусто: ни одной пары, поэтому Dom R = Im R = ∅.',
      wit: (x, y, z, first, second) => 'Например, ⟨' + x + ', ' + y + '⟩: ' + x + ' ' + first + ' ' + z + ' и ' + z + ' ' + second + ' ' + y + ' — переход через z = ' + z + '.',
      noWit: 'Композиция пуста: ни одна стрелка первого шага не «стыкуется» со стрелкой второго.',
      invNote: 'Каждая стрелка развёрнута; правая матрица — левая, отражённая относительно диагонали. По предложению 2.1 Dom R⌣ = Im R и Im R⌣ = Dom R.',
    },
  });

  const A = ['a', 'b', 'c', 'd', 'e'];
  const N = A.length;
  const FIG11 = [[0, 1], [1, 2], [3, 3], [4, 0], [4, 4]]; // ⟨a,b⟩, ⟨b,c⟩, ⟨d,d⟩, ⟨e,a⟩, ⟨e,e⟩
  const empty = () => A.map(() => A.map(() => false));
  const fromPairs = (ps) => {
    const m = empty();
    ps.forEach(([i, j]) => (m[i][j] = true));
    return m;
  };
  const S_PRESETS = {
    shift: () => fromPairs(A.map((_, i) => [i, (i + 1) % N])),
    id: () => fromPairs(A.map((_, i) => [i, i])),
    lt: () => A.map((_, i) => A.map((__, j) => i < j)),
  };
  /** Композиция по Куликову: x (P · Q) y ⇔ ∃z (x Q z ∧ z P y) — сначала Q, потом P. */
  const compose = (P, Q) => A.map((_, x) => A.map((__, y) => A.some((___, z) => Q[x][z] && P[z][y])));
  const inverse = (P) => A.map((_, x) => A.map((__, y) => P[y][x]));
  const pairsOf = (M) => {
    const out = [];
    M.forEach((row, i) => row.forEach((v, j) => v && out.push([i, j])));
    return out;
  };
  const setText = (arr) => '{' + arr.join(', ') + '}';
  const pairText = (ps) => (ps.length ? setText(ps.map(([i, j]) => '⟨' + A[i] + ', ' + A[j] + '⟩')) : '∅');
  const elems = (idx) => (idx.length ? setText(idx.map((i) => A[i])) : '∅');

  MC.widget('relation', (el) => {
    const fig = F.shell(el, { kicker: T.fig, title: T.title });
    const st = { R: fromPairs(FIG11), view: 'RS', s: 'shift' };

    const viewSeg = F.seg(Object.keys(T.views).map((k) => ({ value: k, label: T.views[k] })), st.view, (v) => {
      st.view = v;
      draw();
    }, T.show);
    const sSeg = F.seg(Object.keys(T.sNames).map((k) => ({ value: k, label: T.sNames[k] })), st.s, (v) => {
      st.s = v;
      draw();
    }, T.sWord.replace(/\$/g, ''));
    const showRow = H('div', { class: 'row' }, H('span', null, F.rich(T.show)), viewSeg.el);
    const sRow = H('div', { class: 'row' }, H('span', null, F.rich(T.sWord)), sSeg.el);
    const bFig = F.button(null, T.fig11, () => {
      st.R = fromPairs(FIG11);
      draw();
    });
    const bClr = F.button(null, T.clear, () => {
      st.R = empty();
      draw();
    });
    fig.controls.append(showRow, sRow, H('div', { class: 'row' }, bFig, bClr));

    const ro = F.readout(fig.readout, [
      { key: 'n', label: T.pairs },
      { key: 'dom', label: T.dom },
      { key: 'im', label: T.im },
      { key: 'field', label: T.field },
    ]);
    const lines = H('div', { class: 'rel-sets' });
    fig.readout.after(lines);
    const lineR = H('p', { class: 'fig-note' });
    const lineS = H('p', { class: 'fig-note' });
    const lineRes = H('p', { class: 'fig-note' });
    lines.append(lineR, lineS, lineRes);
    lines.style.display = 'flex';
    lines.style.flexDirection = 'column';
    lines.style.gap = '4px';
    lines.style.overflowWrap = 'anywhere';

    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
    const wide = W >= 600;
    // Геометрия: две матрицы (6×6 клеток вместе с заголовками) и граф.
    const cell = wide ? 30 : Math.floor((W - 24) / 12);
    const msize = cell * (N + 1);
    const top = 26;
    const graphR = wide ? 108 : Math.min(118, (W - 70) / 2);
    const graphBox = wide ? { x: 2 * msize + 40, y: top, w: W - 2 * msize - 40, h: Math.max(msize, 2 * graphR + 60) } : { x: 0, y: top + msize + 34, w: W, h: 2 * graphR + 64 };
    const Hh = wide ? top + Math.max(msize, graphBox.h) + 6 : graphBox.y + graphBox.h;
    const svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + Hh, role: 'img', 'aria-label': T.aria });
    fig.plot.appendChild(svg);
    const m1x = wide ? 0 : 4;
    const m2x = wide ? msize + 24 : W - msize - 4;

    const node = (i) => {
      const t = Math.PI / 2 - (2 * Math.PI * i) / N;
      const cx = graphBox.x + graphBox.w / 2;
      const cy = graphBox.y + 22 + graphR + 8;
      return [cx + graphR * Math.cos(t), cy - graphR * Math.sin(t), Math.cos(t), -Math.sin(t)];
    };
    const head = (x2, y2, ux, uy, h = 9) => {
      const w = h * 0.55;
      return 'M' + (x2 - ux * h - uy * w).toFixed(1) + ' ' + (y2 - uy * h + ux * w).toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1) + 'L' + (x2 - ux * h + uy * w).toFixed(1) + ' ' + (y2 - uy * h - ux * w).toFixed(1);
    };

    function matrix(g, x0, M, label, clickable) {
      g.appendChild(S('text', { class: 'lbl ink', x: x0, y: top - 8 }, label));
      const y0 = top;
      A.forEach((name, i) => {
        g.appendChild(S('text', { class: 'cv ch', x: x0 + cell * (i + 1.5), y: y0 + cell / 2 }, name));
        g.appendChild(S('text', { class: 'cv ch', x: x0 + cell / 2, y: y0 + cell * (i + 1.5) }, name));
      });
      M.forEach((row, i) =>
        row.forEach((on, j) => {
          const x = x0 + cell * (j + 1);
          const y = y0 + cell * (i + 1);
          const rect = S('rect', { class: 'cell' + (on ? ' on' : ''), x: x + 1.5, y: y + 1.5, width: cell - 3, height: cell - 3, rx: 3 });
          if (on) rect.style.fill = 'var(--accent-soft)';
          const txt = S('text', { class: 'cv' + (on ? '' : ' ch'), x: x + cell / 2, y: y + cell / 2 }, on ? '1' : '0');
          txt.style.fontSize = Math.round(cell * 0.55) + 'px';
          if (!clickable) {
            g.append(rect, txt);
            return;
          }
          const cg = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(A[i], A[j], on) });
          cg.append(rect, txt);
          const toggle = () => {
            st.R[i][j] = !st.R[i][j];
            draw();
            const again = svg.querySelector('[data-k="' + i + '-' + j + '"]');
            if (again) again.focus();
          };
          cg.setAttribute('data-k', i + '-' + j);
          cg.addEventListener('click', toggle);
          cg.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          });
          g.appendChild(cg);
        })
      );
    }

    function graph(g, M, cls, label) {
      g.appendChild(S('text', { class: 'lbl ink', x: graphBox.x + graphBox.w / 2, y: graphBox.y + 10, 'text-anchor': 'middle' }, label));
      const rn = 12; // радиус вершины
      M.forEach((row, i) =>
        row.forEach((on, j) => {
          if (!on) return;
          const [x1, y1, ox, oy] = node(i);
          if (i === j) {
            // петля снаружи от центра, обход против часовой стрелки
            const cx = x1 + ox * (rn + 10);
            const cy = y1 + oy * (rn + 10);
            g.appendChild(S('circle', { class: 'curve ' + cls, cx: cx.toFixed(1), cy: cy.toFixed(1), r: 13 }));
            // наконечник в самой дальней от вершины точке петли, по касательной (против часовой стрелки)
            const px = cx + ox * 13;
            const py = cy + oy * 13;
            g.appendChild(S('path', { class: 'arrow ' + cls, d: head(px, py, oy, -ox, 8) }));
            return;
          }
          const both = M[j][i];
          if (both && j < i) return; // встречная пара уже нарисована одним ребром с двумя стрелками
          const [x2, y2] = node(j);
          const len = Math.hypot(x2 - x1, y2 - y1);
          const ux = (x2 - x1) / len;
          const uy = (y2 - y1) / len;
          const ax = x1 + ux * (rn + 2);
          const ay = y1 + uy * (rn + 2);
          const bx = x2 - ux * (rn + 2);
          const by = y2 - uy * (rn + 2);
          let d = 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + 'L' + bx.toFixed(1) + ' ' + by.toFixed(1) + head(bx, by, ux, uy);
          if (both) d += head(ax, ay, -ux, -uy);
          g.appendChild(S('path', { class: 'arrow ' + cls, d }));
        })
      );
      A.forEach((name, i) => {
        const [x, y] = node(i);
        g.appendChild(S('circle', { class: 'dot hollow', cx: x.toFixed(1), cy: y.toFixed(1), r: rn }));
        g.appendChild(S('text', { class: 'lbl ink', x: x.toFixed(1), y: (y + 5).toFixed(1), 'text-anchor': 'middle' }, name));
      });
    }

    function draw() {
      const R = st.R;
      const Sm = st.s === 'R' ? R : S_PRESETS[st.s]();
      const res = st.view === 'inv' ? inverse(R) : st.view === 'RS' ? compose(R, Sm) : st.view === 'SR' ? compose(Sm, R) : null;
      svg.replaceChildren();
      const g = S('g');
      svg.appendChild(g);
      matrix(g, m1x, R, T.matR, true);
      if (res) matrix(g, m2x, res, T.res[st.view], false);
      graph(g, res || R, res ? 'accent' : 'ink', T.graphOf[st.view]);

      const pr = pairsOf(R);
      const dom = A.map((_, i) => i).filter((i) => R[i].some(Boolean));
      const im = A.map((_, j) => j).filter((j) => R.some((row) => row[j]));
      const fieldIdx = A.map((_, i) => i).filter((i) => dom.includes(i) || im.includes(i));
      ro.set('n', String(pr.length));
      ro.set('dom', elems(dom));
      ro.set('im', elems(im));
      ro.set('field', elems(fieldIdx));
      sSeg.el.style.opacity = st.view === 'RS' || st.view === 'SR' ? '' : '0.45';

      lineR.textContent = T.setR + pairText(pr);
      const withS = st.view === 'RS' || st.view === 'SR';
      lineS.textContent = withS ? T.setS + pairText(pairsOf(Sm)) + ' — ' + T.sLong[st.s] : '';
      lineS.style.display = withS ? '' : 'none';
      lineRes.style.display = res || !pr.length ? '' : 'none';
      if (!res) {
        lineRes.textContent = pr.length ? '' : T.emptyR;
        return;
      }
      let text = T.setRes[st.view] + pairText(pairsOf(res)) + '. ';
      if (st.view === 'inv') text += T.invNote;
      else {
        // свидетель первой пары: для R · S сначала S, потом R; для S · R — наоборот
        const [P, Q, first, second] = st.view === 'RS' ? [R, Sm, 'S', 'R'] : [Sm, R, 'R', 'S'];
        const rp = pairsOf(res);
        if (rp.length) {
          const [x, y] = rp[0];
          const z = A.findIndex((_, k) => Q[x][k] && P[k][y]);
          text += T.wit(A[x], A[y], A[z], first, second);
        } else text += T.noWit;
      }
      lineRes.textContent = text;
    }
    draw();
  });
})();
