/* Урок 3.2 «Матрица как преобразование»: рисунок «Преобразование плоскости». */
(function () {
  'use strict';
  const U = MC.util;
  const F = MC.fig;
  const H = MC.h;

  /* Строки рисунка на трёх языках (русские — как были). */
  const T = MC.i18n.pick({
    ru: {
      presets: { ex: 'Пример', id: 'Тождественное', rot: 'Поворот 30°', scale: 'Растяжение', shear: 'Сдвиг', refl: 'Отражение', proj: 'Проекция' },
      kicker: 'Рисунок 1',
      title: 'Матрица двигает всю плоскость',
      plotLabel: 'Сетка до и после преобразования',
      matAria: 'Матрица A',
      presetsAria: 'Готовые преобразования',
      smooth: 'плавно',
      play: 'Показать переход',
      col1: '$A\\mathbf{e}_1$ — 1-й столбец',
      col2: '$A\\mathbf{e}_2$ — 2-й столбец',
      zero: 'det A = 0: плоскость сплющилась в прямую или точку. Обратного преобразования нет.',
      neg: (s) => 'det A < 0: площади умножаются на ' + s + ', а ориентация меняется — плоскость «перевёрнута».',
      pos: (s) => 'det A > 0: площади умножаются на ' + s + ', ориентация сохраняется.',
    },
    en: {
      presets: { ex: 'Example', id: 'Identity', rot: 'Rotation 30°', scale: 'Stretch', shear: 'Shear', refl: 'Reflection', proj: 'Projection' },
      kicker: 'Figure 1',
      title: 'A matrix moves the whole plane',
      plotLabel: 'The grid before and after the transformation',
      matAria: 'Matrix A',
      presetsAria: 'Preset transformations',
      smooth: 'blend',
      play: 'Show the transition',
      col1: '$A\\mathbf{e}_1$ — 1st column',
      col2: '$A\\mathbf{e}_2$ — 2nd column',
      zero: 'det A = 0: the plane has collapsed onto a line or a point. There is no inverse transformation.',
      neg: (s) => 'det A < 0: areas are multiplied by ' + s + ', and the orientation is reversed — the plane is “flipped over.”',
      pos: (s) => 'det A > 0: areas are multiplied by ' + s + ', and the orientation is preserved.',
    },
    uz: {
      presets: { ex: 'Misol', id: 'Ayniy', rot: 'Burish 30°', scale: 'Cho‘zish', shear: 'Siljish', refl: 'Aks ettirish', proj: 'Proyeksiya' },
      kicker: '1-rasm',
      title: 'Matritsa butun tekislikni harakatlantiradi',
      plotLabel: 'Almashtirishdan oldingi va keyingi to‘r',
      matAria: 'A matritsa',
      presetsAria: 'Tayyor almashtirishlar',
      smooth: 'silliq',
      play: 'O‘tishni ko‘rsatish',
      col1: '$A\\mathbf{e}_1$ — 1-ustun',
      col2: '$A\\mathbf{e}_2$ — 2-ustun',
      zero: 'det A = 0: tekislik to‘g‘ri chiziq yoki nuqtaga siqildi. Teskari almashtirish yo‘q.',
      neg: (s) => 'det A < 0: yuzalar ' + s + ' ga ko‘paytiriladi, oriyentatsiya esa o‘zgaradi — tekislik «ag‘darilgan».',
      pos: (s) => 'det A > 0: yuzalar ' + s + ' ga ko‘paytiriladi, oriyentatsiya saqlanadi.',
    },
  });

  const c30 = Math.round(Math.cos(Math.PI / 6) * 100) / 100;
  const PRESETS = [
    { value: 'ex', label: T.presets.ex, m: [2, 1, 0, 1] },
    { value: 'id', label: T.presets.id, m: [1, 0, 0, 1] },
    { value: 'rot', label: T.presets.rot, m: [c30, -0.5, 0.5, c30] },
    { value: 'scale', label: T.presets.scale, m: [1.5, 0, 0, 0.5] },
    { value: 'shear', label: T.presets.shear, m: [1, 1, 0, 1] },
    { value: 'refl', label: T.presets.refl, m: [0, 1, 1, 0] },
    { value: 'proj', label: T.presets.proj, m: [1, 0, 0, 0] },
  ];
  const vec = (x, y) => U.pt(x, y, 2);

  MC.widget('transform', (el) => {
    const fig = F.shell(el, { kicker: T.kicker, title: T.title });
    const W = U.clamp(Math.round(fig.plot.clientWidth || 720), 320, 720);
    const p = new MC.Plot(fig.plot, { width: W, height: Math.round(W * (W < 500 ? 0.9 : 0.62)), x: [-4.6, 4.6], y: [-3, 3], equal: true, label: T.plotLabel });
    const st = { m: PRESETS[0].m.slice(), t: 1, v: [1, 2] };

    /* матрица: четыре ползунка в «скобках» */
    const names = ['a', 'b', 'c', 'd'];
    const cells = names.map((n, i) =>
      F.slider({ label: '$' + n + '$', min: -2, max: 2, step: 0.01, value: st.m[i], fmt: (v) => U.fmt(v, 2), oninput: (v) => {
        st.m[i] = v;
        preset.set(null);
        draw();
      } })
    );
    const mat = H('div', { class: 'mat-ui', role: 'group', 'aria-label': T.matAria }, H('span', { class: 'mat-name' }, F.rich('$A =$')), H('div', { class: 'mat-cells' }, cells.map((c) => c.el)));
    const preset = F.seg(PRESETS.map((x) => ({ value: x.value, label: x.label })), 'ex', (k) => {
      st.m = PRESETS.find((x) => x.value === k).m.slice();
      cells.forEach((c, i) => c.set(st.m[i]));
      if (st.t < 1) tSlider.set((st.t = 1));
      draw();
    }, T.presetsAria);
    const tSlider = F.slider({ label: T.smooth, min: 0, max: 1, step: 0.01, value: 1, fmt: (v) => U.fmt(v, 2), oninput: (v) => {
      st.t = v;
      draw();
    } });
    let anim = null;
    const play = F.button('play', T.play, () => {
      if (anim) cancelAnimationFrame(anim);
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1800);
        st.t = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        tSlider.set(st.t);
        draw();
        anim = k < 1 ? requestAnimationFrame(step) : null;
      };
      anim = requestAnimationFrame(step);
    });
    fig.controls.append(preset.el, mat, H('div', { class: 'row', style: { flex: '1 1 100%' } }, tSlider.el, play));

    const ro = F.readout(fig.readout, [
      { key: 'det', label: '$\\det A = ad - bc$' },
      { key: 'e1', label: T.col1 },
      { key: 'e2', label: T.col2 },
      { key: 'v', label: '$\\mathbf{v} \\to A\\mathbf{v}$' },
    ]);

    p.axes({ grid: true, labels: false });
    function draw() {
      const t = st.t;
      // M(t) = (1 − t)·I + t·A: плавный переход от тождественного преобразования
      const [a, b, c, d] = [U.lerp(1, st.m[0], t), U.lerp(0, st.m[1], t), U.lerp(0, st.m[2], t), U.lerp(1, st.m[3], t)];
      const M = (x, y) => [a * x + b * y, c * x + d * y];
      p.clear();
      const R = 12;
      for (let k = -R; k <= R; k++) {
        const v1 = M(k, -R);
        const v2 = M(k, R);
        const h1 = M(-R, k);
        const h2 = M(R, k);
        p.seg(v1[0], v1[1], v2[0], v2[1], 'tgrid' + (k === 0 ? ' axisline' : ''));
        p.seg(h1[0], h1[1], h2[0], h2[1], 'tgrid' + (k === 0 ? ' axisline' : ''));
      }
      p.polygon([[0, 0], M(1, 0), M(1, 1), M(0, 1)], 'poly');
      const E1 = M(1, 0);
      const E2 = M(0, 1);
      p.arrow(0, 0, E1[0], E1[1], 'accent');
      p.arrow(0, 0, E2[0], E2[1], 'warm');
      const lbl = (P, s, cls) => Math.hypot(P[0], P[1]) > 0.2 && p.text(P[0], P[1], s, 'lbl ' + cls, { dx: P[0] >= 0 ? 8 : -8, dy: P[1] >= 0 ? -8 : 16, anchor: P[0] >= 0 ? 'start' : 'end' });
      lbl(E1, 'Ae₁', 'accent');
      lbl(E2, 'Ae₂', 'warm');
      const [vx, vy] = st.v;
      const AV = M(vx, vy);
      p.arrow(0, 0, vx, vy, 'ink', 'main').classList.add('ghost-arrow');
      p.arrow(0, 0, AV[0], AV[1], 'ink');
      lbl(AV, 'Av', 'ink');
      p.text(vx, vy, 'v', 'lbl', { dx: 10, dy: -10 });
      p.handle(vx, vy, (pt) => {
        st.v = [Math.round(U.clamp(pt.x, -4, 4) * 4) / 4, Math.round(U.clamp(pt.y, -2.8, 2.8) * 4) / 4];
        draw();
      });
      const det = a * d - b * c;
      ro.set('det', U.fmt(det, 2), Math.abs(det) < 0.005 ? 'warm' : '');
      ro.set('e1', vec(a, c), 'accent');
      ro.set('e2', vec(b, d), 'warm');
      ro.set('v', vec(vx, vy) + ' → ' + vec(AV[0], AV[1]));
      fig.note.className = 'fig-note' + (Math.abs(det) < 0.005 ? ' bad' : '');
      fig.note.textContent =
        Math.abs(det) < 0.005
          ? T.zero
          : det < 0
            ? T.neg(U.fmt(-det, 2))
            : T.pos(U.fmt(det, 2));
    }
    draw();
  });
})();
