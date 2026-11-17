/* Урок 7.30 «Подстановки» (Куликов, гл. 6, § 3):
 * рисунок 1 «Произведение подстановок» — два слоя стрелок i → ψ(i) → φ(ψ(i)), порядок φψ / ψφ, знаки (лемма 3.3);
 * рисунок 2 «Инверсии как пересечения» — линии i → φ(i), пересечения = инверсии, обмен образов = умножение
 * на транспозицию, четность меняется (теорема 3.4 (4)). */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      t1: 'Произведение подстановок как два слоя стрелок',
      t2: 'Инверсии как пересечения линий',
      aria1: 'Три ряда чисел: стрелки от i к ψ(i) и от ψ(i) к φ(ψ(i))',
      aria2: 'Два ряда чисел, линии от i к φ(i); пересечения линий отмечены',
      order: 'Порядок',
      newPhi: 'Новая φ', newPsi: 'Новая ψ', inv: 'φ = ψ⁻¹',
      shuffle: 'Перемешать', reset: 'Сначала', deg: 'Степень $n$',
      prod: 'произведение', sPhi: '$\\operatorname{sgn}\\varphi$', sPsi: '$\\operatorname{sgn}\\psi$', sProd: '$\\operatorname{sgn}$ произведения',
      phi: 'φ', psi: 'ψ',
      note1: (o, p, eq, comm) => 'Сначала действует ' + (o === 'pp' ? 'ψ (верхний слой), потом φ' : 'φ (верхний слой), потом ψ') + '. Итог: нижняя строка ' + p + '.' + (eq ? ' Это ε — подстановки взаимно обратны.' : '') + (comm ? ' Здесь φψ = ψφ — такое бывает, но не всегда.' : ' Здесь φψ ≠ ψφ.') + ' Знак произведения равен произведению знаков.',
      invs: 'инверсий', parity: 'четность', sgn: '$\\operatorname{sgn}\\varphi$', row: 'нижняя строка',
      even: 'четная', odd: 'нечетная',
      list: (l) => (l.length ? 'Инверсии: ' + l.join(', ') + '.' : 'Инверсий нет — это ε.'),
      pick: (i) => 'Выбрано ' + i + '. Нажмите второе число верхнего ряда.',
      swapped: (i, k) => 'Образы ' + i + ' и ' + k + ' поменялись: это умножение на транспозицию (' + i + ', ' + k + ') справа, четность изменилась.',
      hint: 'Нажмите на два числа верхнего ряда, чтобы поменять их образы.',
    },
    en: {
      fig: (n) => 'Figure ' + n,
      t1: 'Product of permutations as two layers of arrows',
      t2: 'Inversions as crossings of lines',
      aria1: 'Three rows of numbers: arrows from i to ψ(i) and from ψ(i) to φ(ψ(i))',
      aria2: 'Two rows of numbers, lines from i to φ(i); crossings are marked',
      order: 'Order',
      newPhi: 'New φ', newPsi: 'New ψ', inv: 'φ = ψ⁻¹',
      shuffle: 'Shuffle', reset: 'Restart', deg: 'Degree $n$',
      prod: 'product', sPhi: '$\\operatorname{sgn}\\varphi$', sPsi: '$\\operatorname{sgn}\\psi$', sProd: '$\\operatorname{sgn}$ of the product',
      phi: 'φ', psi: 'ψ',
      note1: (o, p, eq, comm) => (o === 'pp' ? 'ψ acts first (top layer), then φ' : 'φ acts first (top layer), then ψ') + '. Result: bottom row ' + p + '.' + (eq ? ' This is ε — the permutations are mutually inverse.' : '') + (comm ? ' Here φψ = ψφ — this happens, but not always.' : ' Here φψ ≠ ψφ.') + ' The sign of the product is the product of the signs.',
      invs: 'inversions', parity: 'parity', sgn: '$\\operatorname{sgn}\\varphi$', row: 'bottom row',
      even: 'even', odd: 'odd',
      list: (l) => (l.length ? 'Inversions: ' + l.join(', ') + '.' : 'No inversions — this is ε.'),
      pick: (i) => i + ' selected. Click a second number in the top row.',
      swapped: (i, k) => 'The images of ' + i + ' and ' + k + ' were swapped: multiplication by the transposition (' + i + ', ' + k + ') on the right; the parity changed.',
      hint: 'Click two numbers in the top row to swap their images.',
    },
    uz: {
      fig: (n) => n + '-rasm',
      t1: 'O‘rniga qo‘yishlar ko‘paytmasi — ikki qatlam strelkalar',
      t2: 'Inversiyalar — chiziqlarning kesishishlari',
      aria1: 'Uch qator son: i dan ψ(i) ga va ψ(i) dan φ(ψ(i)) ga strelkalar',
      aria2: 'Ikki qator son, i dan φ(i) ga chiziqlar; kesishishlar belgilangan',
      order: 'Tartib',
      newPhi: 'Yangi φ', newPsi: 'Yangi ψ', inv: 'φ = ψ⁻¹',
      shuffle: 'Aralashtirish', reset: 'Boshidan', deg: 'Daraja $n$',
      prod: 'ko‘paytma', sPhi: '$\\operatorname{sgn}\\varphi$', sPsi: '$\\operatorname{sgn}\\psi$', sProd: '$\\operatorname{sgn}$ (ko‘paytma)',
      phi: 'φ', psi: 'ψ',
      note1: (o, p, eq, comm) => (o === 'pp' ? 'Avval ψ (yuqori qatlam), keyin φ' : 'Avval φ (yuqori qatlam), keyin ψ') + ' ta’sir qiladi. Natija: pastki qator ' + p + '.' + (eq ? ' Bu ε — o‘rniga qo‘yishlar o‘zaro teskari.' : '') + (comm ? ' Bu yerda φψ = ψφ — bunday bo‘ladi, lekin har doim emas.' : ' Bu yerda φψ ≠ ψφ.') + ' Ko‘paytmaning ishorasi ishoralar ko‘paytmasiga teng.',
      invs: 'inversiyalar', parity: 'juftlik', sgn: '$\\operatorname{sgn}\\varphi$', row: 'pastki qator',
      even: 'juft', odd: 'toq',
      list: (l) => (l.length ? 'Inversiyalar: ' + l.join(', ') + '.' : 'Inversiya yo‘q — bu ε.'),
      pick: (i) => i + ' tanlandi. Yuqori qatordagi ikkinchi sonni bosing.',
      swapped: (i, k) => i + ' va ' + k + ' ning obrazlari almashdi: bu o‘ngdan (' + i + ', ' + k + ') transpozitsiyaga ko‘paytirish; juftlik o‘zgardi.',
      hint: 'Obrazlarini almashtirish uchun yuqori qatordagi ikkita sonni bosing.',
    },
  });

  /* ---------------------------- подстановки ---------------------------- */
  // подстановка — массив p длины n, p[i-1] = φ(i) (значения 1..n)
  const id = (n) => Array.from({ length: n }, (_, i) => i + 1);
  const mul = (f, g) => g.map((x) => f[x - 1]); // (fg)(i) = f(g(i))
  const inverse = (f) => {
    const r = new Array(f.length);
    f.forEach((v, i) => (r[v - 1] = i + 1));
    return r;
  };
  const inversions = (p) => {
    const out = [];
    for (let a = 0; a < p.length; a++) for (let b = a + 1; b < p.length; b++) if (p[a] > p[b]) out.push([a + 1, b + 1]);
    return out;
  };
  const sgn = (p) => (inversions(p).length % 2 ? -1 : 1);
  const same = (a, b) => a.every((x, i) => x === b[i]);
  const shuffled = (n) => {
    const a = id(n);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const row = (p) => p.join(' ');
  const sgnTxt = (s) => (s > 0 ? '+1' : '−1');

  function width(fig) {
    return U.clamp(Math.round(fig.plot.clientWidth || 600), 280, 720);
  }
  function onResize(fig, draw) {
    let lastW = fig.plot.clientWidth;
    window.addEventListener('resize', () => {
      if (fig.plot.clientWidth !== lastW) {
        lastW = fig.plot.clientWidth;
        draw();
      }
    });
  }

  /* ---------------------- Рисунок 1: произведение ---------------------- */
  MC.widget('perm-product', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.t1 });
    const n = 4;
    const st = { phi: [2, 1, 3, 4], psi: [3, 1, 4, 2], o: 'pp' };
    const oSeg = F.seg([
      { value: 'pp', label: 'φψ' },
      { value: 'qp', label: 'ψφ' },
    ], st.o, (v) => {
      st.o = v;
      draw();
    }, T.order);
    const b1 = F.button(null, T.newPhi, () => {
      st.phi = shuffled(n);
      draw();
    });
    const b2 = F.button(null, T.newPsi, () => {
      st.psi = shuffled(n);
      draw();
    });
    const b3 = F.button(null, T.inv, () => {
      st.phi = inverse(st.psi);
      draw();
    });
    const btns = MC.h('div', { class: 'fig-buttons' }, b1, b2, b3);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(oSeg.el, btns);
    const ro = F.readout(fig.readout, [
      { key: 'phi', label: 'φ' },
      { key: 'psi', label: 'ψ' },
      { key: 'p', label: T.prod },
      { key: 'sf', label: T.sPhi },
      { key: 'sg', label: T.sPsi },
      { key: 'sp', label: T.sProd },
    ]);
    let svg = null;

    function draw() {
      const first = st.o === 'pp' ? st.psi : st.phi;
      const second = st.o === 'pp' ? st.phi : st.psi;
      const prod = mul(second, first);
      const W = width(fig);
      const pad = 34;
      const gap = (W - 2 * pad) / (n - 1);
      const ys = [22, 112, 202];
      const H = 226;
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria1 });
      svg.style.cssText = 'display:block;width:100%;max-width:' + W + 'px;margin:0 auto';
      const X = (v) => pad + gap * (v - 1);
      const layer = (map, y0, y1, color, label) => {
        for (let i = 1; i <= n; i++) {
          const x0 = X(i);
          const x1 = X(map[i - 1]);
          svg.appendChild(S('line', { x1: x0, y1: y0 + 13, x2: x1, y2: y1 - 15, style: 'stroke:' + color + ';stroke-width:2' }));
          svg.appendChild(S('circle', { cx: x1, cy: y1 - 15, r: 3, style: 'fill:' + color }));
        }
        const t = S('text', { x: 6, y: (y0 + y1) / 2 + 4 }, label);
        t.style.cssText = 'fill:' + color + ';font-size:15px;font-style:italic';
        svg.appendChild(t);
      };
      layer(first, ys[0], ys[1], 'var(--accent)', st.o === 'pp' ? 'ψ' : 'φ');
      layer(second, ys[1], ys[2], 'var(--warm)', st.o === 'pp' ? 'φ' : 'ψ');
      ys.forEach((y) => {
        for (let v = 1; v <= n; v++) svg.appendChild(S('text', { class: 'cv', x: X(v), y }, String(v)));
      });
      fig.plot.appendChild(svg);
      const sf = sgn(st.phi);
      const sg = sgn(st.psi);
      ro.set('phi', row(st.phi));
      ro.set('psi', row(st.psi));
      ro.set('p', row(prod), 'accent');
      ro.set('sf', sgnTxt(sf));
      ro.set('sg', sgnTxt(sg));
      ro.set('sp', sgnTxt(sgn(prod)), 'accent');
      const comm = same(mul(st.phi, st.psi), mul(st.psi, st.phi));
      fig.note.textContent = T.note1(st.o, row(prod), same(prod, id(n)), comm);
    }
    draw();
    onResize(fig, draw);
  });

  /* ---------------------- Рисунок 2: инверсии ---------------------- */
  MC.widget('perm-inversions', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.t2 });
    const st = { n: 4, p: [3, 1, 4, 2], sel: 0, msg: '' };
    const nSeg = F.seg([3, 4, 5, 6].map((v) => ({ value: v, label: String(v) })), st.n, (v) => {
      st.n = v;
      st.p = id(v);
      st.sel = 0;
      st.msg = '';
      draw();
    }, T.deg);
    const nLab = MC.h('div', { class: 'ctl' }, MC.h('span', null, F.rich(T.deg)), nSeg.el);
    const bS = F.button(null, T.shuffle, () => {
      st.p = shuffled(st.n);
      st.sel = 0;
      st.msg = '';
      draw();
    });
    const bR = F.button('reset', T.reset, () => {
      st.p = id(st.n);
      st.sel = 0;
      st.msg = '';
      draw();
    });
    const btns = MC.h('div', { class: 'fig-buttons' }, bS, bR);
    btns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    fig.controls.append(nLab, btns);
    const ro = F.readout(fig.readout, [
      { key: 'row', label: T.row },
      { key: 'k', label: T.invs },
      { key: 'par', label: T.parity },
      { key: 's', label: T.sgn },
    ]);
    let svg = null;

    function tap(i) {
      if (!st.sel) {
        st.sel = i;
        st.msg = T.pick(i);
      } else if (st.sel === i) {
        st.sel = 0;
        st.msg = '';
      } else {
        const a = Math.min(st.sel, i);
        const b = Math.max(st.sel, i);
        [st.p[a - 1], st.p[b - 1]] = [st.p[b - 1], st.p[a - 1]];
        st.sel = 0;
        st.msg = T.swapped(a, b);
      }
      draw();
    }

    function draw() {
      const n = st.n;
      const p = st.p;
      const W = width(fig);
      const pad = 30;
      const gap = (W - 2 * pad) / (n - 1);
      const y0 = 26;
      const y1 = 196;
      const H = 222;
      const X = (v) => pad + gap * (v - 1);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': T.aria2 });
      svg.style.cssText = 'display:block;width:100%;max-width:' + W + 'px;margin:0 auto';
      const inv = inversions(p);
      const bad = new Set();
      inv.forEach(([a, b]) => {
        bad.add(a);
        bad.add(b);
      });
      const ya = y0 + 16;
      const yb = y1 - 16;
      for (let i = 1; i <= n; i++) {
        const color = bad.has(i) ? 'var(--warm)' : 'var(--fg3)';
        svg.appendChild(S('line', { x1: X(i), y1: ya, x2: X(p[i - 1]), y2: yb, style: 'stroke:' + color + ';stroke-width:2' }));
      }
      // точки пересечения: линии i→p(i) и k→p(k) пересекаются ⇔ {i, k} — инверсия
      inv.forEach(([a, b]) => {
        const xa0 = X(a), xa1 = X(p[a - 1]), xb0 = X(b), xb1 = X(p[b - 1]);
        const t = (xb0 - xa0) / ((xa1 - xa0) - (xb1 - xb0));
        svg.appendChild(S('circle', { cx: xa0 + t * (xa1 - xa0), cy: ya + t * (yb - ya), r: 4.5, style: 'fill:var(--warm);stroke:var(--bg);stroke-width:1.5' }));
      });
      for (let i = 1; i <= n; i++) {
        const g = S('g', { role: 'button', tabindex: 0, 'aria-label': String(i), style: 'cursor:pointer' });
        g.appendChild(S('circle', { cx: X(i), cy: y0, r: 15, style: 'fill:' + (st.sel === i ? 'var(--accent-soft)' : 'transparent') + ';stroke:' + (st.sel === i ? 'var(--accent)' : 'var(--fg4)') + ';stroke-width:1.5' }));
        g.appendChild(S('text', { class: 'cv', x: X(i), y: y0 }, String(i)));
        g.addEventListener('click', () => tap(i));
        g.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tap(i);
          }
        });
        svg.appendChild(g);
        svg.appendChild(S('text', { class: 'cv', x: X(i), y: y1 }, String(i)));
      }
      fig.plot.appendChild(svg);
      const k = inv.length;
      ro.set('row', row(p));
      ro.set('k', String(k), 'accent');
      ro.set('par', k % 2 ? T.odd : T.even);
      ro.set('s', sgnTxt(k % 2 ? -1 : 1), 'accent');
      fig.note.textContent = (st.msg ? st.msg + ' ' : '') + T.list(inv.map(([a, b]) => '{' + a + ', ' + b + '}')) + (st.msg ? '' : ' ' + T.hint);
    }
    draw();
    onResize(fig, draw);
  });
})();
