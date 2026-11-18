/* Урок 7.36 «Базис и размерность векторного пространства» (Куликов, гл. 7, § 3):
 * рисунок 1 «Базис плоскости и координаты вектора» — сетка базиса b₁, b₂, разложение x = ξ₁b₁ + ξ₂b₂,
 * определитель αδ − βγ (упражнение 1); рисунок 2 «Дополнение до базиса» — процесс из доказательства
 * теоремы 3.6 в Q⁴: к независимой системе приписан стандартный базис, лишние векторы вычеркиваются. */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;

  /* ---------- точная арифметика дробей (для рисунка 2) ---------- */
  const gcd = (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a || 1;
  };
  const fr = (n, d = 1) => {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };
  const fsub = (a, b) => fr(a.n * b.d - b.n * a.d, a.d * b.d);
  const fmul = (a, b) => fr(a.n * b.n, a.d * b.d);
  const fdiv = (a, b) => fr(a.n * b.d, a.d * b.n);
  const fzero = (a) => a.n === 0;
  const fstr = (a) => {
    const s = (a.n < 0 ? '−' : '') + Math.abs(a.n);
    return a.d === 1 ? s : s + '/' + a.d;
  };

  /** Решает Σ cⱼ·colsⱼ = v над Q; коэффициенты или null, если v ∉ L(cols). */
  function solve(cols, v) {
    const n = v.length;
    const k = cols.length;
    if (!k) return v.every((x) => x === 0) ? [] : null;
    const M = [];
    for (let i = 0; i < n; i++) {
      const row = cols.map((c) => fr(c[i]));
      row.push(fr(v[i]));
      M.push(row);
    }
    const piv = [];
    let r = 0;
    for (let c = 0; c < k && r < n; c++) {
      let p = r;
      while (p < n && fzero(M[p][c])) p++;
      if (p === n) continue;
      [M[r], M[p]] = [M[p], M[r]];
      const inv = M[r][c];
      M[r] = M[r].map((x) => fdiv(x, inv));
      for (let i = 0; i < n; i++) {
        if (i === r || fzero(M[i][c])) continue;
        const f = M[i][c];
        M[i] = M[i].map((x, j) => fsub(x, fmul(f, M[r][j])));
      }
      piv.push(c);
      r++;
    }
    for (let i = r; i < n; i++) if (!fzero(M[i][k])) return null;
    const out = cols.map(() => fr(0));
    piv.forEach((c, i) => (out[c] = M[i][k]));
    return out;
  }

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Базис плоскости и координаты вектора',
      t2: 'Дополнение независимой системы до базиса (теорема 3.6)',
      aria1: 'Векторы b₁, b₂, сетка их линейных комбинаций и вектор x, разложенный по ним',
      preset: 'Пример',
      pStd: 'стандартный', pSkew: 'косой', pDep: 'зависимые',
      det: '$\\alpha\\delta - \\beta\\gamma$', xi1: '$\\xi_1$', xi2: '$\\xi_2$', xv: '$\\boldsymbol{x}$',
      b1: '$\\boldsymbol{b}_1$', b2: '$\\boldsymbol{b}_2$',
      ok: (d, a, b) => 'αδ − βγ = ' + d + ' ≠ 0: b₁, b₂ — базис плоскости (упражнение 1). Каждый вектор раскладывается по нему единственным образом: x = ' + a + '·b₁ + ' + b + '·b₂. Сетка — линии с целыми координатами в этом базисе.',
      bad: 'αδ − βγ = 0: векторы пропорциональны, их оболочка — прямая (пунктир), а не плоскость. Это не базис: векторы вне прямой через b₁, b₂ не выражаются.',
      zero: 'Среди векторов есть нулевой: система зависима, это не базис.',
      sys: 'Система',
      sA: 'система A', sB: 'система B', sC: 'система C',
      step: 'Шаг', reset: 'Заново',
      colN: 'вектор', colV: 'координаты', colS: 'что с ним',
      keepA: 'исходный — не вычеркивается', crossed: (e) => 'вычеркнут: = ' + e, wait: '…', kept: 'в базисе',
      stepL: 'шаг', countL: 'векторов', basisL: 'базис',
      start: (m) => 'Система (S): ' + m + ' исходных векторов aᵢ и стандартный базис e₁, …, e₄ — всего ' + (m + 4) + ' векторов в Q⁴, больше 4, значит, она зависима (следствие 3.3). Нажмите «Шаг».',
      cross: (v, e) => v + ' = ' + e + ' — линейная комбинация предшествующих векторов: вычеркиваем; оставшаяся система по-прежнему порождает Q⁴.',
      done: 'Осталось 4 вектора, порождающих Q⁴, — по следствию 3.4 это базис, и он содержит исходную систему.',
      tableAria: 'Система (S) и результат вычеркиваний',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'A basis of the plane and the coordinates of a vector',
      t2: 'Extending an independent system to a basis (theorem 3.6)',
      aria1: 'Vectors b₁, b₂, the grid of their linear combinations and the vector x expanded in them',
      preset: 'Example',
      pStd: 'standard', pSkew: 'skew', pDep: 'dependent',
      det: '$\\alpha\\delta - \\beta\\gamma$', xi1: '$\\xi_1$', xi2: '$\\xi_2$', xv: '$\\boldsymbol{x}$',
      b1: '$\\boldsymbol{b}_1$', b2: '$\\boldsymbol{b}_2$',
      ok: (d, a, b) => 'αδ − βγ = ' + d + ' ≠ 0: b₁, b₂ is a basis of the plane (exercise 1). Every vector expands in it uniquely: x = ' + a + '·b₁ + ' + b + '·b₂. The grid shows the lines with integer coordinates in this basis.',
      bad: 'αδ − βγ = 0: the vectors are proportional and span a line (dashed), not the plane. This is not a basis: vectors off the line are not combinations of b₁, b₂.',
      zero: 'One of the vectors is zero: the system is dependent, not a basis.',
      sys: 'System',
      sA: 'system A', sB: 'system B', sC: 'system C',
      step: 'Step', reset: 'Restart',
      colN: 'vector', colV: 'coordinates', colS: 'status',
      keepA: 'original — never crossed out', crossed: (e) => 'crossed out: = ' + e, wait: '…', kept: 'in the basis',
      stepL: 'step', countL: 'vectors', basisL: 'basis',
      start: (m) => 'System (S): ' + m + ' original vectors aᵢ and the standard basis e₁, …, e₄ — ' + (m + 4) + ' vectors of Q⁴, more than 4, so it is dependent (corollary 3.3). Press “Step”.',
      cross: (v, e) => v + ' = ' + e + ' is a combination of the preceding vectors: cross it out; the remaining system still spans Q⁴.',
      done: 'Four vectors spanning Q⁴ remain — by corollary 3.4 they form a basis, and it contains the original system.',
      tableAria: 'System (S) and the result of crossing out',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Tekislik bazisi va vektor koordinatalari',
      t2: 'Erkli sistemani bazisgacha to‘ldirish (3.6-teorema)',
      aria1: 'b₁, b₂ vektorlar, ularning chiziqli kombinatsiyalari to‘ri va ular bo‘yicha yoyilgan x vektor',
      preset: 'Misol',
      pStd: 'standart', pSkew: 'qiya', pDep: 'bog‘liq',
      det: '$\\alpha\\delta - \\beta\\gamma$', xi1: '$\\xi_1$', xi2: '$\\xi_2$', xv: '$\\boldsymbol{x}$',
      b1: '$\\boldsymbol{b}_1$', b2: '$\\boldsymbol{b}_2$',
      ok: (d, a, b) => 'αδ − βγ = ' + d + ' ≠ 0: b₁, b₂ — tekislik bazisi (1-mashq). Har bir vektor u bo‘yicha yagona tarzda yoyiladi: x = ' + a + '·b₁ + ' + b + '·b₂. To‘r — shu bazisda butun koordinatali chiziqlar.',
      bad: 'αδ − βγ = 0: vektorlar proporsional, ularning qobig‘i — to‘g‘ri chiziq (punktir), tekislik emas. Bu bazis emas: chiziqdan tashqaridagi vektorlar b₁, b₂ orqali ifodalanmaydi.',
      zero: 'Vektorlardan biri nol: sistema bog‘liq, bazis emas.',
      sys: 'Sistema',
      sA: 'A sistema', sB: 'B sistema', sC: 'C sistema',
      step: 'Qadam', reset: 'Qaytadan',
      colN: 'vektor', colV: 'koordinatalar', colS: 'holati',
      keepA: 'dastlabki — o‘chirilmaydi', crossed: (e) => 'o‘chirildi: = ' + e, wait: '…', kept: 'bazisda',
      stepL: 'qadam', countL: 'vektorlar', basisL: 'bazis',
      start: (m) => '(S) sistema: ' + m + ' ta dastlabki aᵢ vektor va e₁, …, e₄ standart bazis — Q⁴ da jami ' + (m + 4) + ' ta vektor, 4 dan ko‘p, demak, bog‘liq (3.3-natija). «Qadam» ni bosing.',
      cross: (v, e) => v + ' = ' + e + ' — oldingi vektorlarning chiziqli kombinatsiyasi: o‘chiramiz; qolgan sistema hamon Q⁴ ni hosil qiladi.',
      done: 'Q⁴ ni hosil qiluvchi 4 ta vektor qoldi — 3.4-natijaga ko‘ra bu bazis, u dastlabki sistemani o‘z ichiga oladi.',
      tableAria: '(S) sistema va o‘chirish natijasi',
    },
  });

  const plotWidth = (el) => U.clamp(Math.round(el.clientWidth || 720), 320, 720);
  const snap = (v, lo, hi) => Math.round(U.clamp(v, lo, hi) * 2) / 2;
  const vec = (v) => '(' + U.fmt(v[0], 2) + U.sep() + U.fmt(v[1], 2) + ')';

  /* ---------------------- Рисунок 1: базис плоскости и координаты ---------------------- */
  MC.widget('basis-coords', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const PRESETS = {
      std: [[1, 0], [0, 1], [2.5, 1.5]],
      skew: [[2, 0.5], [0.5, 1.5], [3, 2.5]],
      dep: [[2, 1], [-1, -0.5], [1, 2]],
    };
    const st = { p: 'skew', b1: null, b2: null, x: null };
    const load = (k) => {
      st.p = k;
      st.b1 = PRESETS[k][0].slice();
      st.b2 = PRESETS[k][1].slice();
      st.x = PRESETS[k][2].slice();
    };
    load(PRESETS[cfg.preset] ? cfg.preset : 'skew');
    const seg = F.seg([
      { value: 'std', label: T.pStd },
      { value: 'skew', label: T.pSkew },
      { value: 'dep', label: T.pDep },
    ], st.p, (v) => {
      load(v);
      draw();
    }, T.preset);
    fig.controls.append(seg.el);
    const ro = F.readout(fig.readout, [
      { key: 'b1', label: T.b1 },
      { key: 'b2', label: T.b2 },
      { key: 'd', label: T.det },
      { key: 'x', label: T.xv },
      { key: 'k1', label: T.xi1 },
      { key: 'k2', label: T.xi2 },
    ]);

    let p = null;
    let W = 0;
    function build() {
      W = plotWidth(fig.plot);
      fig.plot.replaceChildren();
      p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.6)), x: [-5, 5], y: [-4, 4], equal: true, label: T.aria1 });
    }

    function draw() {
      if (!p || plotWidth(fig.plot) !== W) build();
      p.clear();
      p.axes({ xLabel: 'x', yLabel: 'y' });
      const [a, b] = st.b1;
      const [c, d] = st.b2;
      const D = a * d - b * c;
      const zero = (a === 0 && b === 0) || (c === 0 && d === 0);
      const basis = Math.abs(D) > 1e-12;
      if (basis) {
        // сетка: линии с целыми координатами в базисе b₁, b₂
        for (let k = -12; k <= 12; k++) {
          p.seg(k * c - 40 * a, k * d - 40 * b, k * c + 40 * a, k * d + 40 * b, 'guide');
          p.seg(k * a - 40 * c, k * b - 40 * d, k * a + 40 * c, k * b + 40 * d, 'guide');
        }
      } else if (!(a === 0 && b === 0 && c === 0 && d === 0)) {
        const [dx, dy] = a === 0 && b === 0 ? [c, d] : [a, b];
        const t = 20 / Math.hypot(dx, dy);
        p.seg(-dx * t, -dy * t, dx * t, dy * t, 'curve accent dash');
      }
      const [x1, x2] = st.x;
      let k1 = null;
      let k2 = null;
      if (basis) {
        k1 = (x1 * d - x2 * c) / D;
        k2 = (a * x2 - b * x1) / D;
        const m = [k1 * a, k1 * b];
        p.seg(0, 0, m[0], m[1], 'curve accent dash');
        p.seg(m[0], m[1], x1, x2, 'curve warm dash');
      }
      const lbl = (x, y, s, cls) => p.text(x, y, s, 'lbl ' + cls, { dx: x >= 0 ? 15 : -15, dy: y >= 0 ? -12 : 24, anchor: x >= 0 ? 'start' : 'end' });
      if (Math.hypot(x1, x2) > 1e-9) p.arrow(0, 0, x1, x2, 'ink');
      if (!(a === 0 && b === 0)) p.arrow(0, 0, a, b, 'accent');
      if (!(c === 0 && d === 0)) p.arrow(0, 0, c, d, 'warm');
      lbl(a, b, 'b₁', 'accent');
      lbl(c, d, 'b₂', 'warm');
      lbl(x1, x2, 'x', '');
      p.handle(a, b, (pt) => {
        st.b1 = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
        draw();
      });
      p.handle(c, d, (pt) => {
        st.b2 = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
        draw();
      }, 'warm');
      p.handle(x1, x2, (pt) => {
        st.x = [snap(pt.x, -4.5, 4.5), snap(pt.y, -3.5, 3.5)];
        draw();
      }, '');
      ro.set('b1', vec(st.b1), 'accent');
      ro.set('b2', vec(st.b2), 'warm');
      ro.set('d', U.fmt(D, 2), basis ? 'accent' : 'warm');
      ro.set('x', vec(st.x));
      ro.set('k1', basis ? U.fmt(k1, 2) : '—');
      ro.set('k2', basis ? U.fmt(k2, 2) : '—');
      fig.note.className = 'fig-note' + (basis ? ' ok' : '');
      fig.note.textContent = basis ? T.ok(U.fmt(D, 2), U.fmt(k1, 2), U.fmt(k2, 2)) : zero ? T.zero : T.bad;
    }
    draw();
    let tm = null;
    window.addEventListener('resize', () => {
      clearTimeout(tm);
      tm = setTimeout(() => {
        if (plotWidth(fig.plot) !== W) draw();
      }, 150);
    });
  });

  /* ---------------------- Рисунок 2: дополнение до базиса ---------------------- */
  const SYSTEMS = {
    A: [[1, 1, 0, 0], [0, 1, 1, 0]],
    B: [[1, 2, 3, 4]],
    C: [[0, 0, 1, 1], [1, 0, 0, 1], [0, 1, 0, 1]],
  };
  const E4 = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
  const sub = (i) => String(i).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('');
  const vstr = (v) => '(' + v.map((x) => U.fmt(x, 0)).join(U.sep()) + ')';

  /** Имена векторов системы (S): a₁, …, a_m, e₁, …, e₄. */
  const names = (m) => Array.from({ length: m + 4 }, (_, i) => (i < m ? 'a' + sub(i + 1) : 'e' + sub(i - m + 1)));

  function combo(coef, idx, nm) {
    let s = '';
    coef.forEach((c, j) => {
      if (fzero(c)) return;
      const neg = c.n < 0;
      const abs = { n: Math.abs(c.n), d: c.d };
      const num = abs.n === 1 && abs.d === 1 ? '' : fstr(abs);
      const term = num + nm[idx[j]];
      s += s ? (neg ? ' − ' : ' + ') + term : (neg ? '−' : '') + term;
    });
    return s || '0';
  }

  /** Шаги процесса теоремы 3.6: каждый раз вычеркиваем первый вектор, выражающийся через предшествующие. */
  function plan(a) {
    const m = a.length;
    const S = a.concat(E4);
    const nm = names(m);
    const alive = S.map(() => true);
    const steps = [];
    while (alive.filter(Boolean).length > 4) {
      let found = null;
      for (let j = m; j < S.length && !found; j++) {
        if (!alive[j]) continue;
        const prev = [];
        for (let i = 0; i < j; i++) if (alive[i]) prev.push(i);
        const c = solve(prev.map((i) => S[i]), S[j]);
        if (c) found = { j, e: combo(c, prev, nm) };
      }
      if (!found) break; // не случится: система из > 4 векторов Q⁴ зависима
      alive[found.j] = false;
      steps.push(found);
    }
    return { S, nm, steps };
  }

  MC.widget('basis-extend', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { sys: SYSTEMS[cfg.sys] ? cfg.sys : 'A', at: 0 };
    let P = plan(SYSTEMS[st.sys]);
    const seg = F.seg([
      { value: 'A', label: T.sA },
      { value: 'B', label: T.sB },
      { value: 'C', label: T.sC },
    ], st.sys, (v) => {
      st.sys = v;
      st.at = 0;
      P = plan(SYSTEMS[v]);
      draw();
    }, T.sys);
    const bStep = F.button(null, T.step, () => {
      if (st.at < P.steps.length) st.at++;
      draw();
    });
    const bReset = F.button(null, T.reset, () => {
      st.at = 0;
      draw();
    });
    const btns = H('div', { class: 'fig-buttons' }, bStep, bReset);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(seg.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 's', label: T.stepL },
      { key: 'k', label: T.countL },
      { key: 'b', label: T.basisL },
    ]);

    function draw() {
      const m = SYSTEMS[st.sys].length;
      const { S, nm, steps } = P;
      const done = steps.slice(0, st.at);
      const crossed = new Map(done.map((s) => [s.j, s.e]));
      const finished = st.at >= steps.length;
      const left = S.length - done.length;
      const rows = S.map((v, i) => {
        const x = crossed.has(i);
        const status = i < m ? T.keepA : x ? T.crossed(crossed.get(i)) : finished ? T.kept : T.wait;
        const keep = !x && (i < m || finished);
        return H('tr', keep ? { class: 'hl' } : null,
          H('td', null, nm[i]),
          H('td', { style: 'text-decoration:' + (x ? 'line-through' : 'none') + ';white-space:nowrap' }, vstr(v)),
          H('td', { style: keep ? 'color:var(--accent)' : x ? 'color:var(--warm)' : '' }, status));
      });
      const table = H('table', { class: 'data', style: 'min-width:0', 'aria-label': T.tableAria },
        H('thead', null, H('tr', null, H('th', null, T.colN), H('th', null, T.colV), H('th', null, T.colS))),
        H('tbody', null, ...rows));
      // полоска-схема системы (S): a — синие, e — светлые кружки, вычеркнутые — крестик
      const strip = H('div');
      fig.plot.replaceChildren(strip, H('div', { class: 'table-wrap' }, table));
      const W = plotWidth(fig.plot);
      const n = S.length;
      const p = new MC.Plot(strip, { width: W, height: 74, x: [0, n], y: [0, 1], label: T.tableAria, margin: { l: 8, r: 8, t: 6, b: 6 } });
      S.forEach((_, i) => {
        const x = i + 0.5;
        if (i < m || (finished && !crossed.has(i))) p.dot(x, 0.62, 'accent', 11);
        else p.dot(x, 0.62, 'hollow', 11);
        if (crossed.has(i)) {
          p.seg(x - 0.18, 0.4, x + 0.18, 0.84, 'curve warm');
          p.seg(x - 0.18, 0.84, x + 0.18, 0.4, 'curve warm');
        }
        p.text(x, 0.12, nm[i], 'lbl', { anchor: 'middle' });
      });
      let note = T.start(m);
      if (done.length) {
        const s = done[done.length - 1];
        note = T.cross(nm[s.j], s.e);
      }
      if (finished) note = (done.length ? note + ' ' : '') + T.done;
      ro.set('s', st.at + ' / ' + steps.length);
      ro.set('k', String(left));
      ro.set('b', finished ? S.map((_, i) => i).filter((i) => !crossed.has(i)).map((i) => nm[i]).join(', ') : '—', 'accent');
      bStep.disabled = finished;
      fig.note.className = 'fig-note' + (finished ? ' ok' : '');
      fig.note.textContent = note;
    }
    draw();
  });
})();
