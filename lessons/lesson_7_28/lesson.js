/* Урок 7.28 «Операции над матрицами и их свойства» (Куликов, гл. 6, § 1):
 * рисунок 1 «Произведение матриц: строка на столбец» — схема Фалька, выбор клетки (i, k) произведения
 * подсвечивает строку A_i и столбец B^k и показывает сумму α_i1β_1k + … + α_inβ_nk; AB и BA, PQ и QP;
 * рисунок 2 «Транспонирование произведения» — A и ᵗA, ᵗ(AB) = ᵗB·ᵗA (теорема 1.3) и «неправильный» ᵗA·ᵗB. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Произведение матриц: строка на столбец',
      t2: 'Транспонирование произведения',
      aria1: 'Схема Фалька: левый множитель, правый множитель над произведением; выбранные строка, столбец и клетка подсвечены',
      aria2: 'Матрицы и их транспонированные; клетки с переставленными индексами подсвечены',
      order: 'Порядок множителей',
      next: 'Следующий элемент',
      cell: 'клетка', value: 'значение', size: 'размер', sizeP: 'размер произведения',
      pick: 'Нажмите клетку произведения.',
      sum: (name, i, k, terms, v) => '(' + name + ')' + sub(i, k) + ' = ' + terms + ' = ' + v + ' — строка ' + i + ' левого множителя на столбец ' + k + ' правого.',
      mode: 'Режим',
      mT: '${}^tA$', mProd: '${}^t(AB) = {}^tB \\cdot {}^tA$', mWrong: '${}^tA \\cdot {}^tB$',
      noteT: (i, k, v) => 'Элемент A на месте (' + i + ', ' + k + ') равен ' + v + ' и в ᵗA стоит на месте (' + k + ', ' + i + '): строки стали столбцами.',
      noteProd: (i, k, terms, v) => 'c′' + sub(i, k) + ' = (строка ' + i + ' матрицы ᵗB) · (столбец ' + k + ' матрицы ᵗA) = ' + terms + ' = ' + v + '. Это элемент AB на месте (' + k + ', ' + i + '): строка ' + k + ' матрицы A на столбец ' + i + ' матрицы B.',
      noteWrong: 'ᵗA · ᵗB — это (3 × 2)(2 × 3) = 3 × 3, а ᵗ(AB) — 2 × 2: «естественный» порядок даёт другую матрицу. Верно ᵗ(AB) = ᵗB · ᵗA.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Matrix product: row times column',
      t2: 'Transpose of a product',
      aria1: 'Falk’s scheme: the left factor, the right factor above the product; the chosen row, column and cell are highlighted',
      aria2: 'Matrices and their transposes; cells with swapped indices are highlighted',
      order: 'Order of factors',
      next: 'Next entry',
      cell: 'cell', value: 'value', size: 'size', sizeP: 'size of the product',
      pick: 'Click a cell of the product.',
      sum: (name, i, k, terms, v) => '(' + name + ')' + sub(i, k) + ' = ' + terms + ' = ' + v + ' — row ' + i + ' of the left factor times column ' + k + ' of the right one.',
      mode: 'Mode',
      mT: '${}^tA$', mProd: '${}^t(AB) = {}^tB \\cdot {}^tA$', mWrong: '${}^tA \\cdot {}^tB$',
      noteT: (i, k, v) => 'The entry of A at (' + i + ', ' + k + ') is ' + v + '; in ᵗA it stands at (' + k + ', ' + i + '): rows became columns.',
      noteProd: (i, k, terms, v) => 'c′' + sub(i, k) + ' = (row ' + i + ' of ᵗB) · (column ' + k + ' of ᵗA) = ' + terms + ' = ' + v + '. This is the entry of AB at (' + k + ', ' + i + '): row ' + k + ' of A times column ' + i + ' of B.',
      noteWrong: 'ᵗA · ᵗB is (3 × 2)(2 × 3) = 3 × 3, while ᵗ(AB) is 2 × 2: the “natural” order gives a different matrix. The correct rule is ᵗ(AB) = ᵗB · ᵗA.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Matritsalar ko‘paytmasi: satrni ustunga',
      t2: 'Ko‘paytmani transponirlash',
      aria1: 'Falk sxemasi: chap ko‘paytuvchi, ko‘paytma ustida o‘ng ko‘paytuvchi; tanlangan satr, ustun va katak ajratilgan',
      aria2: 'Matritsalar va ularning transponirlanganlari; indekslari almashgan kataklar ajratilgan',
      order: 'Ko‘paytuvchilar tartibi',
      next: 'Keyingi element',
      cell: 'katak', value: 'qiymat', size: 'o‘lcham', sizeP: 'ko‘paytma o‘lchami',
      pick: 'Ko‘paytmaning katagini bosing.',
      sum: (name, i, k, terms, v) => '(' + name + ')' + sub(i, k) + ' = ' + terms + ' = ' + v + ' — chap ko‘paytuvchining ' + i + '-satri o‘ng ko‘paytuvchining ' + k + '-ustuniga.',
      mode: 'Rejim',
      mT: '${}^tA$', mProd: '${}^t(AB) = {}^tB \\cdot {}^tA$', mWrong: '${}^tA \\cdot {}^tB$',
      noteT: (i, k, v) => 'A ning (' + i + '; ' + k + ') o‘rindagi elementi ' + v + ', ᵗA da u (' + k + '; ' + i + ') o‘rinda: satrlar ustunlarga aylandi.',
      noteProd: (i, k, terms, v) => 'c′' + sub(i, k) + ' = (ᵗB ning ' + i + '-satri) · (ᵗA ning ' + k + '-ustuni) = ' + terms + ' = ' + v + '. Bu AB ning (' + k + '; ' + i + ') o‘rindagi elementi: A ning ' + k + '-satri B ning ' + i + '-ustuniga.',
      noteWrong: 'ᵗA · ᵗB — bu (3 × 2)(2 × 3) = 3 × 3, ᵗ(AB) esa 2 × 2: «tabiiy» tartib boshqa matritsa beradi. To‘g‘risi: ᵗ(AB) = ᵗB · ᵗA.',
    },
  });

  const SUBS = '₀₁₂₃₄₅₆₇₈₉';
  function sub(i, k) {
    return String(i).replace(/\d/g, (d) => SUBS[d]) + String(k).replace(/\d/g, (d) => SUBS[d]);
  }
  const num = (v) => (v < 0 ? '−' + Math.abs(v) : String(v));
  const par = (v) => (v < 0 ? '(' + num(v) + ')' : num(v));
  const mul = (A, B) => A.map((r) => B[0].map((_, k) => r.reduce((s, a, j) => s + a * B[j][k], 0)));
  const tr = (A) => A[0].map((_, k) => A.map((r) => r[k]));
  const terms = (row, col) => row.map((a, j) => par(a) + '·' + par(col[j])).join(' + ');
  const colOf = (M, k) => M.map((r) => r[k]);

  const MA = [[1, 2, 0], [-1, 3, 1]];
  const MB = [[2, 1], [0, -1], [4, 2]];
  const MP = [[1, 2], [3, 4]];
  const MQ = [[0, 1], [1, 0]];
  const PAIRS = {
    ab: { L: MA, R: MB, l: 'A', r: 'B' },
    ba: { L: MB, R: MA, l: 'B', r: 'A' },
    pq: { L: MP, R: MQ, l: 'P', r: 'Q' },
    qp: { L: MQ, R: MP, l: 'Q', r: 'P' },
  };

  /** Рисует матрицу M в svg с левым верхним углом (x, y) и стороной клетки C.
   *  o.on(i, k) → 'sel' | 'hl' | '' ; o.click(i, k) — клетки становятся кнопками. */
  function drawMatrix(svg, M, x, y, C, o = {}) {
    const m = M.length;
    const n = M[0].length;
    const br = (bx, dir) => svg.appendChild(S('path', { d: 'M' + (bx + dir * 6) + ' ' + y + ' H' + bx + ' V' + (y + C * m) + ' H' + (bx + dir * 6), class: 'leg' }));
    br(x - 3, 1);
    br(x + C * n + 3, -1);
    for (let i = 0; i < m; i++) {
      for (let k = 0; k < n; k++) {
        const st = o.on ? o.on(i, k) : '';
        const g = S('g', o.click ? { class: 'cell-g', tabindex: 0, role: 'button', 'aria-label': '(' + (i + 1) + ', ' + (k + 1) + ')' } : {});
        const r = S('rect', { class: 'cell' + (st === 'sel' ? ' on' : ''), x: x + C * k + 2, y: y + C * i + 2, width: C - 4, height: C - 4, rx: 4 });
        if (st) r.style.fill = 'var(--accent-soft)';
        g.appendChild(r);
        const t = S('text', { class: 'cv', x: x + C * k + C / 2, y: y + C * i + C / 2 }, num(M[i][k]));
        t.style.fontSize = Math.round(C * 0.36) + 'px';
        if (st === 'sel') t.style.fill = 'var(--accent)';
        g.appendChild(t);
        if (o.click) {
          g.addEventListener('click', () => o.click(i, k));
          g.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              o.click(i, k);
            }
          });
        }
        svg.appendChild(g);
      }
    }
  }
  const label = (svg, x, y, txt, anchor = 'middle') => {
    const t = S('text', { x, y, 'text-anchor': anchor, 'dominant-baseline': 'central' }, txt);
    t.style.fontFamily = 'var(--math)';
    t.style.fontSize = '17px';
    t.style.fill = 'var(--fg)';
    svg.appendChild(t);
  };
  const onResize = (fig, draw) => {
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  };

  /* ---------------------- Рисунок 1: строка на столбец ---------------------- */
  MC.widget('matmul', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { p: PAIRS[cfg.preset] ? cfg.preset : 'ab', i: 0, k: 0 };
    const seg = F.seg(Object.keys(PAIRS).map((key) => ({ value: key, label: '$' + PAIRS[key].l + PAIRS[key].r + '$' })), st.p, (v) => {
      st.p = v;
      st.i = 0;
      st.k = 0;
      draw();
    }, T.order);
    const bNext = F.button('step', T.next, () => {
      const { L, R } = PAIRS[st.p];
      const p = R[0].length;
      st.k += 1;
      if (st.k >= p) {
        st.k = 0;
        st.i = (st.i + 1) % L.length;
      }
      draw();
    });
    fig.controls.append(seg.el, bNext);
    const ro = F.readout(fig.readout, [
      { key: 'size', label: T.sizeP },
      { key: 'cell', label: T.cell },
      { key: 'v', label: T.value },
    ]);
    let svg = null;

    function draw() {
      const { L, R, l, r } = PAIRS[st.p];
      const P = mul(L, R);
      const m = L.length;
      const n = L[0].length;
      const p = R[0].length;
      const gap = 0.7;
      const units = n + gap + p;
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(58, Math.floor((W - 24) / units));
      const w = Math.round(C * units + 24);
      const h = Math.round(C * (n + gap + m) + 30);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      const x0 = 12;
      const xR = x0 + C * (n + gap);
      const yL = 4 + C * (n + gap);
      drawMatrix(svg, L, x0, yL, C, { on: (i) => (i === st.i ? 'hl' : '') });
      drawMatrix(svg, R, xR, 4, C, { on: (j, k) => (k === st.k ? 'hl' : '') });
      drawMatrix(svg, P, xR, yL, C, {
        on: (i, k) => (i === st.i && k === st.k ? 'sel' : ''),
        click: (i, k) => {
          st.i = i;
          st.k = k;
          draw();
        },
      });
      label(svg, x0 + (C * n) / 2, yL - C * 0.45, l);
      label(svg, xR - C * 0.35, 4 + (C * n) / 2, r, 'end');
      label(svg, xR + (C * p) / 2, yL + C * m + 16, l + r);
      fig.plot.appendChild(svg);
      const v = P[st.i][st.k];
      ro.set('size', m + ' × ' + p);
      ro.set('cell', '(' + (st.i + 1) + ', ' + (st.k + 1) + ')');
      ro.set('v', num(v), 'accent');
      fig.note.textContent = T.sum(l + r, st.i + 1, st.k + 1, terms(L[st.i], colOf(R, st.k)), num(v));
    }
    draw();
    onResize(fig, draw);
  });

  /* ---------------------- Рисунок 2: транспонирование ---------------------- */
  MC.widget('transpose-product', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const modes = ['t', 'prod', 'wrong'];
    const st = { mode: modes.includes(cfg.mode) ? cfg.mode : 'prod', i: 0, k: 1 };
    const seg = F.seg([
      { value: 't', label: T.mT },
      { value: 'prod', label: T.mProd },
      { value: 'wrong', label: T.mWrong },
    ], st.mode, (v) => {
      st.mode = v;
      st.i = 0;
      st.k = 1;
      draw();
    }, T.mode);
    fig.controls.append(seg.el);
    const ro = F.readout(fig.readout, [
      { key: 'cell', label: T.cell },
      { key: 'v', label: T.value },
    ]);
    let svg = null;
    const AB = mul(MA, MB);
    const tBtA = mul(tr(MB), tr(MA));
    const tAtB = mul(tr(MA), tr(MB));

    function blocksFor() {
      const pick = (i, k) => {
        st.i = i;
        st.k = k;
        draw();
      };
      if (st.mode === 't') {
        return [
          { M: MA, name: 'A', on: (i, k) => (i === st.i && k === st.k ? 'sel' : ''), click: pick },
          { M: tr(MA), name: 'ᵗA', on: (i, k) => (i === st.k && k === st.i ? 'sel' : ''), click: (i, k) => pick(k, i) },
        ];
      }
      if (st.mode === 'prod') {
        return [
          { M: AB, name: 'AB', on: (i, k) => (i === st.k && k === st.i ? 'sel' : ''), click: (i, k) => pick(k, i) },
          { M: tBtA, name: 'ᵗB · ᵗA', on: (i, k) => (i === st.i && k === st.k ? 'sel' : ''), click: pick },
        ];
      }
      return [
        { M: tAtB, name: 'ᵗA · ᵗB', on: () => 'hl' },
        { M: tr(AB), name: 'ᵗ(AB)', on: () => '' },
      ];
    }

    function draw() {
      const bl = blocksFor();
      const gap = 1.1;
      const cols = bl.reduce((s, b) => s + b.M[0].length, 0) + gap * (bl.length - 1);
      const rows = Math.max(...bl.map((b) => b.M.length));
      const W = U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
      const C = Math.min(58, Math.floor((W - 24) / cols));
      const w = Math.round(C * cols + 24);
      const h = Math.round(C * rows + 34);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-label': T.aria2 });
      svg.style.cssText = 'display:block;margin:0 auto;max-width:' + w + 'px;width:100%';
      let x = 12;
      bl.forEach((b, j) => {
        drawMatrix(svg, b.M, x, 4, C, { on: b.on, click: b.click });
        label(svg, x + (C * b.M[0].length) / 2, 4 + C * b.M.length + 16, b.name);
        x += C * (b.M[0].length + gap);
        if (j < bl.length - 1 && st.mode !== 'wrong') label(svg, x - (C * gap) / 2, 4 + (C * rows) / 2, st.mode === 't' ? '→' : '=');
        if (j < bl.length - 1 && st.mode === 'wrong') label(svg, x - (C * gap) / 2, 4 + (C * rows) / 2, '≠');
      });
      fig.plot.appendChild(svg);
      if (st.mode === 't') {
        const v = MA[st.i][st.k];
        ro.set('cell', '(' + (st.i + 1) + ', ' + (st.k + 1) + ') → (' + (st.k + 1) + ', ' + (st.i + 1) + ')');
        ro.set('v', num(v), 'accent');
        fig.note.className = 'fig-note';
        fig.note.textContent = T.noteT(st.i + 1, st.k + 1, num(v));
      } else if (st.mode === 'prod') {
        const v = tBtA[st.i][st.k];
        ro.set('cell', '(' + (st.i + 1) + ', ' + (st.k + 1) + ') ↔ (' + (st.k + 1) + ', ' + (st.i + 1) + ')');
        ro.set('v', num(v), 'accent');
        fig.note.className = 'fig-note ok';
        fig.note.textContent = T.noteProd(st.i + 1, st.k + 1, terms(tr(MB)[st.i], colOf(tr(MA), st.k)), num(v));
      } else {
        ro.set('cell', '3 × 3 ≠ 2 × 2');
        ro.set('v', '—');
        fig.note.className = 'fig-note';
        fig.note.textContent = T.noteWrong;
      }
    }
    draw();
    onResize(fig, draw);
  });
})();
