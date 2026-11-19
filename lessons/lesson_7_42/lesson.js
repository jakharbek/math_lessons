/* Урок 7.42 «Линейные алгебры» (Куликов, гл. 8, § 3):
 * рисунок 1 «Произведение операторов — произведение матриц» — два оператора плоскости φ, ψ из набора,
 * образ единичного квадрата при ψ и при φψ (сначала ψ, потом φ), M(φψ) = M(φ)M(ψ) (теорема 3.3),
 * по желанию — образ при ψφ: алгебра End 𝒱 некоммутативна;
 * рисунок 2 «Умножение кватернионов» — таблица умножения базиса e, i, j, k (пример 3), произведения ab и ba
 * двух кватернионов, нормы N(a), N(b), N(ab) = N(a)N(b) (упражнение 3). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Произведение операторов — произведение матриц',
      t2: 'Умножение кватернионов',
      aria1: 'Единичный квадрат, его образ при операторе ψ и при произведении φψ; образы базисных векторов',
      aria2: 'Таблица умножения базисных кватернионов e, i, j, k',
      ops: { rot: 'поворот', refl: 'отражение', shear: 'сдвиг', proj: 'проекция', scale: 'растяжение' },
      phi: 'оператор $\\varphi$', psi: 'оператор $\\psi$',
      showRev: 'показать $\\psi\\varphi$',
      e1: '$(\\varphi\\psi)(\\boldsymbol{e}_1)$', e2: '$(\\varphi\\psi)(\\boldsymbol{e}_2)$',
      r1: '$(\\psi\\varphi)(\\boldsymbol{e}_1)$', r2: '$(\\psi\\varphi)(\\boldsymbol{e}_2)$',
      eqNote: 'Здесь $\\varphi\\psi = \\psi\\varphi$: эти два оператора перестановочны.',
      neNote: 'Здесь $\\varphi\\psi \\ne \\psi\\varphi$: $M(\\psi)M(\\varphi) = ',
      neEnd: '$ — другая матрица, алгебра $\\mathrm{End}\\,\\mathscr{V}$ некоммутативна.',
      a: 'кватернион $\\boldsymbol{a}$', b: 'кватернион $\\boldsymbol{b}$',
      ab: '$\\boldsymbol{ab}$', ba: '$\\boldsymbol{ba}$', na: '$N(\\boldsymbol{a})$', nb: '$N(\\boldsymbol{b})$', nab: '$N(\\boldsymbol{ab})$',
      cellAria: (x, y) => 'Произведение ' + x + ' · ' + y,
      same: ' Здесь ab = ba.',
      diff: ' Здесь ab ≠ ba: умножение кватернионов некоммутативно.',
      normNote: (na, nb, nab) => 'N(a)·N(b) = ' + na + ' · ' + nb + ' = ' + nab + ' = N(ab) (упражнение 3 (b)).',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Product of operators — product of matrices',
      t2: 'Multiplying quaternions',
      aria1: 'The unit square, its image under the operator ψ and under the product φψ; images of the basis vectors',
      aria2: 'Multiplication table of the basis quaternions e, i, j, k',
      ops: { rot: 'rotation', refl: 'reflection', shear: 'shear', proj: 'projection', scale: 'stretch' },
      phi: 'operator $\\varphi$', psi: 'operator $\\psi$',
      showRev: 'show $\\psi\\varphi$',
      e1: '$(\\varphi\\psi)(\\boldsymbol{e}_1)$', e2: '$(\\varphi\\psi)(\\boldsymbol{e}_2)$',
      r1: '$(\\psi\\varphi)(\\boldsymbol{e}_1)$', r2: '$(\\psi\\varphi)(\\boldsymbol{e}_2)$',
      eqNote: 'Here $\\varphi\\psi = \\psi\\varphi$: these two operators commute.',
      neNote: 'Here $\\varphi\\psi \\ne \\psi\\varphi$: $M(\\psi)M(\\varphi) = ',
      neEnd: '$ is a different matrix; the algebra $\\mathrm{End}\\,\\mathscr{V}$ is not commutative.',
      a: 'quaternion $\\boldsymbol{a}$', b: 'quaternion $\\boldsymbol{b}$',
      ab: '$\\boldsymbol{ab}$', ba: '$\\boldsymbol{ba}$', na: '$N(\\boldsymbol{a})$', nb: '$N(\\boldsymbol{b})$', nab: '$N(\\boldsymbol{ab})$',
      cellAria: (x, y) => 'Product ' + x + ' · ' + y,
      same: ' Here ab = ba.',
      diff: ' Here ab ≠ ba: quaternion multiplication is not commutative.',
      normNote: (na, nb, nab) => 'N(a)·N(b) = ' + na + ' · ' + nb + ' = ' + nab + ' = N(ab) (exercise 3 (b)).',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'Operatorlar ko‘paytmasi — matritsalar ko‘paytmasi',
      t2: 'Kvaternionlarni ko‘paytirish',
      aria1: 'Birlik kvadrat, uning ψ operator va φψ ko‘paytma ostidagi obrazi; bazis vektorlar obrazlari',
      aria2: 'e, i, j, k bazis kvaternionlarning ko‘paytirish jadvali',
      ops: { rot: 'burish', refl: 'aks ettirish', shear: 'siljitish', proj: 'proyeksiya', scale: 'cho‘zish' },
      phi: '$\\varphi$ operator', psi: '$\\psi$ operator',
      showRev: '$\\psi\\varphi$ ni ko‘rsatish',
      e1: '$(\\varphi\\psi)(\\boldsymbol{e}_1)$', e2: '$(\\varphi\\psi)(\\boldsymbol{e}_2)$',
      r1: '$(\\psi\\varphi)(\\boldsymbol{e}_1)$', r2: '$(\\psi\\varphi)(\\boldsymbol{e}_2)$',
      eqNote: 'Bu yerda $\\varphi\\psi = \\psi\\varphi$: bu ikki operator o‘rin almashinuvchi.',
      neNote: 'Bu yerda $\\varphi\\psi \\ne \\psi\\varphi$: $M(\\psi)M(\\varphi) = ',
      neEnd: '$ — boshqa matritsa, $\\mathrm{End}\\,\\mathscr{V}$ algebra kommutativ emas.',
      a: '$\\boldsymbol{a}$ kvaternion', b: '$\\boldsymbol{b}$ kvaternion',
      ab: '$\\boldsymbol{ab}$', ba: '$\\boldsymbol{ba}$', na: '$N(\\boldsymbol{a})$', nb: '$N(\\boldsymbol{b})$', nab: '$N(\\boldsymbol{ab})$',
      cellAria: (x, y) => 'Ko‘paytma ' + x + ' · ' + y,
      same: ' Bu yerda ab = ba.',
      diff: ' Bu yerda ab ≠ ba: kvaternionlarni ko‘paytirish kommutativ emas.',
      normNote: (na, nb, nab) => 'N(a)·N(b) = ' + na + ' · ' + nb + ' = ' + nab + ' = N(ab) (3 (b)-mashq).',
    },
  });

  /* ------------------- Рисунок 1: произведение операторов ------------------- */
  const OPS = {
    rot: [[0, -1], [1, 0]],
    refl: [[1, 0], [0, -1]],
    shear: [[1, 1], [0, 1]],
    proj: [[1, 0], [0, 0]],
    scale: [[2, 0], [0, 1]],
  };
  const mul = (A, B) => [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ];
  const app = (A, v) => [A[0][0] * v[0] + A[0][1] * v[1], A[1][0] * v[0] + A[1][1] * v[1]];
  const same = (A, B) => A.every((r, i) => r.every((x, j) => x === B[i][j]));
  const num = (x) => (x < 0 ? '-' : '') + Math.abs(x);
  const tex = (A) => '\\begin{bmatrix}' + num(A[0][0]) + ' & ' + num(A[0][1]) + '\\\\ ' + num(A[1][0]) + ' & ' + num(A[1][1]) + '\\end{bmatrix}';
  const SQ = [[0, 0], [1, 0], [1, 1], [0, 1]];

  MC.widget('op-product', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const st = { phi: 'rot', psi: 'shear', rev: false };
    const keys = Object.keys(OPS);
    const opts = keys.map((k) => ({ value: k, label: T.ops[k] }));
    const sPhi = F.seg(opts, st.phi, (v) => {
      st.phi = v;
      draw();
    }, T.phi.replace(/\$/g, ''));
    const sPsi = F.seg(opts, st.psi, (v) => {
      st.psi = v;
      draw();
    }, T.psi.replace(/\$/g, ''));
    const ck = F.check(T.showRev, false, (v) => {
      st.rev = v;
      draw();
    });
    fig.controls.append(
      MC.h('div', { class: 'ctl', style: 'flex-basis: 100%' }, MC.h('span', null, F.rich(T.phi)), sPhi.el),
      MC.h('div', { class: 'ctl', style: 'flex-basis: 100%' }, MC.h('span', null, F.rich(T.psi)), sPsi.el),
      ck.el,
    );
    const ro = F.readout(fig.readout, [
      { key: 'e1', label: T.e1 },
      { key: 'e2', label: T.e2 },
      { key: 'r1', label: T.r1 },
      { key: 'r2', label: T.r2 },
    ]);
    const box = { x: [-4.6, 4.6], y: [-2.6, 2.6] };
    let p = null;
    let w = 0;

    function build() {
      const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720);
      if (W === w && p) return;
      w = W;
      fig.plot.replaceChildren();
      const H = Math.round((W * (box.y[1] - box.y[0])) / (box.x[1] - box.x[0])) + 30;
      p = new MC.Plot(fig.plot, { width: W, height: H, x: box.x, y: box.y, equal: true, label: T.aria1 });
      p.axes({ xLabel: 'x₁', yLabel: 'x₂' });
    }

    function draw() {
      build();
      p.clear('main');
      const A = OPS[st.phi];
      const B = OPS[st.psi];
      const AB = mul(A, B);
      const BA = mul(B, A);
      p.polygon(SQ, 'poly faint', 'main');
      p.path(SQ.concat([SQ[0]]).map((v) => app(B, v)), 'curve warm dash thin', 'main');
      if (st.rev) p.path(SQ.concat([SQ[0]]).map((v) => app(BA, v)), 'curve teal', 'main');
      p.polygon(SQ.map((v) => app(AB, v)), 'poly', 'main');
      const u1 = app(AB, [1, 0]);
      const u2 = app(AB, [0, 1]);
      if (u1[0] || u1[1]) p.arrow(0, 0, u1[0], u1[1], 'accent', 'main');
      if (u2[0] || u2[1]) p.arrow(0, 0, u2[0], u2[1], 'ink', 'main');
      const lab = (v, s, cls) => {
        if (!v[0] && !v[1]) return;
        const r = Math.hypot(v[0], v[1]);
        p.text(v[0], v[1], s, 'lbl ' + cls, { dx: (v[0] / r) * 12 + (v[0] >= 0 ? 2 : -2), dy: -(v[1] / r) * 12 + 5, anchor: v[0] >= 0 ? 'start' : 'end', layer: 'main' });
      };
      lab(u1, 'φψ(e₁)', 'accent');
      lab(u2, 'φψ(e₂)', 'ink');
      ro.set('e1', U.pt(u1[0], u1[1], 0), 'accent');
      ro.set('e2', U.pt(u2[0], u2[1], 0));
      const v1 = app(BA, [1, 0]);
      const v2 = app(BA, [0, 1]);
      const eq = same(AB, BA);
      ro.set('r1', U.pt(v1[0], v1[1], 0), eq ? '' : 'warm');
      ro.set('r2', U.pt(v2[0], v2[1], 0), eq ? '' : 'warm');
      const head = '$M(\\varphi\\psi) = M(\\varphi)M(\\psi) = ' + tex(A) + tex(B) + ' = ' + tex(AB) + '$. ';
      fig.note.className = 'fig-note';
      fig.note.replaceChildren(F.rich(head + (eq ? T.eqNote : T.neNote + tex(BA) + T.neEnd)));
    }
    draw();
    window.addEventListener('resize', () => {
      if (U.clamp(Math.round(fig.plot.clientWidth || 720), 300, 720) !== w) draw();
    });
  });

  /* ------------------- Рисунок 2: кватернионы ------------------- */
  // кватернион — [α, β, γ, δ] = αe + βi + γj + δk; произведение — формула книги (пример 3)
  const qmul = (p, q) => {
    const [a, b, c, d] = p;
    const [a1, b1, c1, d1] = q;
    return [a * a1 - b * b1 - c * c1 - d * d1, a * b1 + b * a1 + c * d1 - d * c1, a * c1 + a1 * c + d * b1 - b * d1, a * d1 + a1 * d + b * c1 - c * b1];
  };
  const qN = (q) => q.reduce((s, x) => s + x * x, 0);
  const BAS = ['e', 'i', 'j', 'k'];
  /** Запись кватерниона: 2e − j + k (знак «−» — минус, единичные коэффициенты опускаются). */
  const qstr = (q) => {
    let s = '';
    q.forEach((x, n) => {
      if (!x) return;
      const m = Math.abs(x);
      const t = (m === 1 ? '' : U.fmt(m, 0)) + BAS[n];
      s += s ? (x < 0 ? ' − ' : ' + ') + t : (x < 0 ? '−' : '') + t;
    });
    return s || '0';
  };
  const PRE = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [1, 1, 0, 0], [1, 1, 1, 1], [2, 0, -1, 1]];
  const preTex = (q) => '$' + qstr(q).replace(/([eijk])/g, '\\boldsymbol{$1}').replace(/−/g, '-') + '$';

  MC.widget('quaternions', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { a: 1, b: 2 };
    const opts = PRE.map((q, n) => ({ value: n, label: preTex(q) }));
    const sA = F.seg(opts, st.a, (v) => {
      st.a = v;
      draw();
    }, T.a.replace(/\$/g, ''));
    const sB = F.seg(opts, st.b, (v) => {
      st.b = v;
      draw();
    }, T.b.replace(/\$/g, ''));
    fig.controls.append(
      MC.h('div', { class: 'ctl', style: 'flex-basis: 100%' }, MC.h('span', null, F.rich(T.a)), sA.el),
      MC.h('div', { class: 'ctl', style: 'flex-basis: 100%' }, MC.h('span', null, F.rich(T.b)), sB.el),
    );
    const ro = F.readout(fig.readout, [
      { key: 'ab', label: T.ab },
      { key: 'ba', label: T.ba },
      { key: 'na', label: T.na },
      { key: 'nb', label: T.nb },
      { key: 'nab', label: T.nab },
    ]);
    let svg = null;

    function table() {
      const C = 60;
      const size = C * 5;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.aria2 });
      svg.style.maxWidth = size + 'px';
      const bold = (x, y, s, cls) => {
        const node = S('text', { class: cls, x: x + C / 2, y: y + C / 2 }, s);
        node.style.fontWeight = '600';
        svg.appendChild(node);
        return node;
      };
      bold(0, 0, '·', 'cv corner');
      for (let n = 0; n < 4; n++) {
        bold(C * (n + 1), 0, BAS[n], 'cv ch');
        bold(0, C * (n + 1), BAS[n], 'cv ch');
      }
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const x = C * (c + 1);
          const y = C * (r + 1);
          const on = st.a === r && st.b === c;
          const swap = st.a === c && st.b === r && !on;
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(BAS[r], BAS[c]) });
          const rect = S('rect', { class: 'cell' + (on ? ' on' : ''), x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 });
          if (swap) rect.style.fill = 'var(--warm-soft, var(--bg3))';
          g.appendChild(rect);
          const pr = qmul(PRE[r], PRE[c]);
          const node = S('text', { class: 'cv', x: x + C / 2, y: y + C / 2 }, qstr(pr));
          node.style.fontWeight = '600';
          if (pr[0] < 0 || pr[1] < 0 || pr[2] < 0 || pr[3] < 0) node.style.fill = 'var(--warm)';
          g.appendChild(node);
          const pick = () => {
            st.a = r;
            st.b = c;
            sA.set(r);
            sB.set(c);
            draw();
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
    }

    function draw() {
      table();
      const a = PRE[st.a];
      const b = PRE[st.b];
      const ab = qmul(a, b);
      const ba = qmul(b, a);
      const eq = ab.every((x, n) => x === ba[n]);
      ro.set('ab', qstr(ab), 'accent');
      ro.set('ba', qstr(ba), eq ? 'accent' : 'warm');
      ro.set('na', U.fmt(qN(a), 0));
      ro.set('nb', U.fmt(qN(b), 0));
      ro.set('nab', U.fmt(qN(ab), 0), 'accent');
      fig.note.className = 'fig-note';
      fig.note.textContent = T.normNote(U.fmt(qN(a), 0), U.fmt(qN(b), 0), U.fmt(qN(ab), 0)) + (eq ? T.same : T.diff);
    }
    draw();
  });
})();
