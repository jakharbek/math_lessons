/* Урок 7.9 «Группы» (Куликов, гл. 3, § 3): рисунок 1 — таблица Кэли группы с проверкой аксиом,
 * обратными элементами и циклической подгруппой; рисунок 2 — симметрии правильного n-угольника. */
(function () {
  'use strict';
  const F = MC.fig;
  const S = MC.svg;

  const T = MC.i18n.pick({
    ru: {
      fig: (n) => 'Рисунок ' + n,
      title1: 'Таблица Кэли группы: аксиомы, обратные, подгруппы',
      title2: 'Симметрии правильного многоугольника',
      group: 'Группа',
      nLabel: '$n$',
      order: 'порядок',
      abel: 'абелева',
      unit: 'единица',
      inv: 'обратный',
      sub: 'подгруппа $\\langle a\\rangle$',
      yes: 'да',
      no: 'нет',
      dash: '—',
      tableAria: 'Таблица Кэли группы',
      cellAria: (a, b) => 'Клетка ' + a + ' · ' + b,
      names: { zn: 'сложение по модулю n', un: 'умножение по модулю n (обратимые классы)', cn: 'вращения правильного n-угольника', d3: 'симметрии правильного треугольника', d4: 'симметрии квадрата', v4: 'симметрии ромба', s3: 'подстановки третьей степени' },
      axioms: (n) => 'Проверены все ' + n + ' троек: операция ассоциативна; есть правая единица; у каждого элемента есть правый обратный — это группа. ',
      latin: 'В каждой строке и в каждом столбце каждый элемент встречается ровно один раз (свойство 3.5). ',
      hint: 'Нажмите на клетку: строка — элемент a, столбец — b.',
      cell: (a, b, ab, ba) => a + ' · ' + b + ' = ' + ab + ', ' + b + ' · ' + a + ' = ' + ba + (ab === ba ? ' — совпадают. ' : ' — не совпадают: группа не абелева. '),
      invNote: (a, x) => 'Обратный к ' + a + ': ' + x + ' (стоит единица и в строке ' + a + ', и в столбце ' + a + ' — свойство 3.1). ',
      subNote: (a, list, k, n) => 'Степени ' + a + ' дают подгруппу ⟨' + a + '⟩ = {' + list + '} из ' + k + ' элементов' + (k === n ? ' — это вся группа: она циклическая, ' + a + ' — образующий.' : '; её строки и столбцы выделены — внутри них таблица замкнута.'),
      rotate: 'Повернуть',
      reflect: 'Отразить',
      reset: 'Сброс',
      onlyRot: 'только вращения ($H_n$)',
      sides: 'вершин $n$',
      now: 'симметрия',
      perm: 'места вершин 1…n',
      size: 'элементов',
      rotName: (k, n) => (k === 0 ? 'тождественное' : 'поворот на ' + Math.round((360 * k) / n) + '°'),
      refShort: 'отражение',
      refName: (k, n) => 'отражение (ось повёрнута на ' + MC.util.fmt((180 * k) / n, 1) + '° от оси через место 1)',
      polyAria: 'Правильный многоугольник и его симметрия',
      polyNote: (name, cnt, only) => 'Сейчас: ' + name + '. ' + (only ? 'Вращения правильного n-угольника образуют группу H_n из ' + cnt + ' элементов: композиция поворотов — поворот, сумма углов берётся по модулю 360°.' : 'Все симметрии — ' + cnt + ' элементов: n поворотов и n отражений. Отражение, затем поворот — снова отражение; порядок важен: группа не абелева при n ≥ 3.'),
    },
    en: {
      fig: (n) => 'Figure ' + n,
      title1: 'Cayley table of a group: axioms, inverses, subgroups',
      title2: 'Symmetries of a regular polygon',
      group: 'Group',
      nLabel: '$n$',
      order: 'order',
      abel: 'abelian',
      unit: 'identity',
      inv: 'inverse',
      sub: 'subgroup $\\langle a\\rangle$',
      yes: 'yes',
      no: 'no',
      dash: '—',
      tableAria: 'Cayley table of a group',
      cellAria: (a, b) => 'Cell ' + a + ' · ' + b,
      names: { zn: 'addition modulo n', un: 'multiplication modulo n (invertible classes)', cn: 'rotations of a regular n-gon', d3: 'symmetries of a regular triangle', d4: 'symmetries of a square', v4: 'symmetries of a rhombus', s3: 'permutations of degree three' },
      axioms: (n) => 'All ' + n + ' triples checked: the operation is associative; there is a right identity; every element has a right inverse — this is a group. ',
      latin: 'Every element occurs exactly once in each row and each column (property 3.5). ',
      hint: 'Click a cell: the row is a, the column is b.',
      cell: (a, b, ab, ba) => a + ' · ' + b + ' = ' + ab + ', ' + b + ' · ' + a + ' = ' + ba + (ab === ba ? ' — equal. ' : ' — different: the group is not abelian. '),
      invNote: (a, x) => 'Inverse of ' + a + ': ' + x + ' (the identity appears in row ' + a + ' and in column ' + a + ' — property 3.1). ',
      subNote: (a, list, k, n) => 'Powers of ' + a + ' form the subgroup ⟨' + a + '⟩ = {' + list + '} of ' + k + ' elements' + (k === n ? ' — the whole group: it is cyclic, ' + a + ' is a generator.' : '; its rows and columns are highlighted — the table is closed inside them.'),
      rotate: 'Rotate',
      reflect: 'Reflect',
      reset: 'Reset',
      onlyRot: 'rotations only ($H_n$)',
      sides: 'vertices $n$',
      now: 'symmetry',
      perm: 'places of vertices 1…n',
      size: 'elements',
      rotName: (k, n) => (k === 0 ? 'identity' : 'rotation by ' + Math.round((360 * k) / n) + '°'),
      refShort: 'reflection',
      refName: (k, n) => 'reflection (axis turned by ' + MC.util.fmt((180 * k) / n, 1) + '° from the axis through place 1)',
      polyAria: 'Regular polygon and its symmetry',
      polyNote: (name, cnt, only) => 'Now: ' + name + '. ' + (only ? 'Rotations of a regular n-gon form the group H_n of ' + cnt + ' elements: a composition of rotations is a rotation, angles add modulo 360°.' : 'All symmetries — ' + cnt + ' elements: n rotations and n reflections. A reflection followed by a rotation is again a reflection; order matters: the group is not abelian for n ≥ 3.'),
    },
    uz: {
      fig: (n) => n + '-rasm',
      title1: 'Gruppaning Keli jadvali: aksiomalar, teskarilar, qism gruppalar',
      title2: 'Muntazam ko‘pburchakning simmetriyalari',
      group: 'Gruppa',
      nLabel: '$n$',
      order: 'tartib',
      abel: 'abel',
      unit: 'birlik',
      inv: 'teskari',
      sub: 'qism gruppa $\\langle a\\rangle$',
      yes: 'ha',
      no: 'yo‘q',
      dash: '—',
      tableAria: 'Gruppaning Keli jadvali',
      cellAria: (a, b) => 'Katak ' + a + ' · ' + b,
      names: { zn: 'n modul bo‘yicha qo‘shish', un: 'n modul bo‘yicha ko‘paytirish (teskarilanuvchi sinflar)', cn: 'muntazam n-burchakning burilishlari', d3: 'muntazam uchburchakning simmetriyalari', d4: 'kvadratning simmetriyalari', v4: 'rombning simmetriyalari', s3: 'uchinchi darajali o‘rniga qo‘yishlar' },
      axioms: (n) => 'Barcha ' + n + ' ta uchlik tekshirildi: amal assotsiativ; o‘ng birlik bor; har bir elementning o‘ng teskarisi bor — bu gruppa. ',
      latin: 'Har bir satr va har bir ustunda har bir element roppa-rosa bir marta uchraydi (3.5-xossa). ',
      hint: 'Katakni bosing: satr — a element, ustun — b.',
      cell: (a, b, ab, ba) => a + ' · ' + b + ' = ' + ab + ', ' + b + ' · ' + a + ' = ' + ba + (ab === ba ? ' — teng. ' : ' — teng emas: gruppa abel emas. '),
      invNote: (a, x) => a + ' ga teskari: ' + x + ' (birlik ' + a + ' satrida ham, ' + a + ' ustunida ham turibdi — 3.1-xossa). ',
      subNote: (a, list, k, n) => a + ' darajalari ⟨' + a + '⟩ = {' + list + '} qism gruppani beradi, elementlari ' + k + ' ta' + (k === n ? ' — bu butun gruppa: u siklik, ' + a + ' — yasovchi.' : '; uning satr va ustunlari ajratilgan — ular ichida jadval yopiq.'),
      rotate: 'Burish',
      reflect: 'Akslantirish',
      reset: 'Boshlash',
      onlyRot: 'faqat burilishlar ($H_n$)',
      sides: 'uchlar $n$',
      now: 'simmetriya',
      perm: '1…n uchlar o‘rni',
      size: 'elementlar',
      rotName: (k, n) => (k === 0 ? 'ayniy' : Math.round((360 * k) / n) + '° ga burish'),
      refShort: 'akslantirish',
      refName: (k, n) => 'akslantirish (o‘q 1-o‘rin orqali o‘tgan o‘qdan ' + MC.util.fmt((180 * k) / n, 1) + '° ga burilgan)',
      polyAria: 'Muntazam ko‘pburchak va uning simmetriyasi',
      polyNote: (name, cnt, only) => 'Hozir: ' + name + '. ' + (only ? 'Muntazam n-burchakning burilishlari ' + cnt + ' elementli H_n gruppani tashkil qiladi: burilishlar kompozitsiyasi — burilish, burchaklar 360° modul bo‘yicha qo‘shiladi.' : 'Barcha simmetriyalar — ' + cnt + ' ta: n ta burilish va n ta akslantirish. Akslantirish, keyin burish — yana akslantirish; tartib muhim: n ≥ 3 da gruppa abel emas.'),
    },
  });

  /* ---------- Группы: элементы — индексы 0…N−1, op(i, j) — индекс произведения i·j ---------- */
  const SUB = '₀₁₂₃₄₅₆₇₈₉';
  const sub = (k) => String(k).split('').map((d) => SUB[+d]).join('');
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);

  /** Подстановки списком образов; композиция по Куликову: (f·g)(x) = f(g(x)) — сначала g. */
  const comp = (f, g) => g.map((x) => f[x]);
  const fromPerms = (perms, names) => ({
    N: perms.length,
    name: (i) => names[i],
    op: (i, j) => {
      const h = comp(perms[i], perms[j]);
      return perms.findIndex((p) => p.every((v, k) => v === h[k]));
    },
  });
  const rot = (n, k) => [...Array(n).keys()].map((i) => (i + k) % n);
  const refl = (n, k) => [...Array(n).keys()].map((i) => (((k - i) % n) + n) % n);

  const GROUPS = {
    zn: { label: '$\\mathbf{Z}_n$', num: true, make: (n) => ({ N: n, name: String, op: (i, j) => (i + j) % n }) },
    un: {
      label: '$\\mathbf{Z}_n^*$', num: true, make: (n) => {
        const els = [...Array(n).keys()].filter((k) => k > 0 && gcd(k, n) === 1);
        if (n === 1) els.push(0);
        return { N: els.length, name: (i) => String(els[i]), op: (i, j) => els.indexOf((els[i] * els[j]) % n) };
      },
    },
    cn: { label: '$H_n$', num: true, make: (n) => ({ N: n, name: (i) => 'r' + sub(i), op: (i, j) => (i + j) % n }) },
    d3: { label: '$D_3$', make: () => fromPerms([rot(3, 0), rot(3, 1), rot(3, 2), refl(3, 0), refl(3, 2), refl(3, 1)], ['r₀', 'r₁', 'r₂', 's₁', 's₂', 's₃']) },
    s3: { label: '$S_3$', make: () => fromPerms([[0, 1, 2], [1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1]], ['e', '(12)', '(13)', '(23)', '(123)', '(132)']) },
    v4: { label: '$V_4$', make: () => fromPerms([[0, 1, 2, 3], [2, 3, 0, 1], [0, 3, 2, 1], [2, 1, 0, 3]], ['e', 'r', 'd₁', 'd₂']) },
    d4: { label: '$D_4$', make: () => fromPerms([rot(4, 0), rot(4, 1), rot(4, 2), rot(4, 3), [0, 3, 2, 1], [2, 1, 0, 3], [3, 2, 1, 0], [1, 0, 3, 2]], ['r₀', 'r₁', 'r₂', 'r₃', 'd₁', 'd₂', 'h', 'v']) },
  };

  /** Проверка аксиом Куликова (ассоциативность, правая единица, правые обратные) и всё, что показывает рисунок. */
  function analyse(G) {
    const { N, op } = G;
    const t = [];
    for (let i = 0; i < N; i++) {
      t.push([]);
      for (let j = 0; j < N; j++) t[i].push(op(i, j));
    }
    let assoc = true;
    for (let a = 0; a < N && assoc; a++) for (let b = 0; b < N && assoc; b++) for (let c = 0; c < N && assoc; c++) if (t[a][t[b][c]] !== t[t[a][b]][c]) assoc = false;
    const range = [...Array(N).keys()];
    const e = range.find((x) => range.every((a) => t[a][x] === a));
    const invs = range.map((a) => (e === undefined ? -1 : range.find((x) => t[a][x] === e)));
    const group = assoc && e !== undefined && invs.every((x) => x !== undefined && x >= 0);
    let abel = true;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (t[i][j] !== t[j][i]) abel = false;
    const latin = range.every((i) => new Set(t[i]).size === N) && range.every((j) => new Set(range.map((i) => t[i][j])).size === N);
    /** ⟨a⟩ — степени a: e, a, a², … до возврата к e. */
    const powers = (a) => {
      const out = [e];
      let x = a;
      while (x !== e && out.length <= N) {
        out.push(x);
        x = t[x][a];
      }
      return out;
    };
    return { t, assoc, e, invs, group, abel, latin, powers };
  }

  MC.widget('group-table', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 1), title: T.title1 });
    const st = { g: cfg.group || 'd3', n: cfg.n || 6, sel: null };
    const keys = cfg.groups || Object.keys(GROUPS);
    const gSeg = F.seg(keys.map((k) => ({ value: k, label: GROUPS[k].label })), st.g, (v) => {
      st.g = v;
      st.sel = null;
      nS.el.style.display = GROUPS[v].num ? '' : 'none';
      build();
    }, T.group);
    const nS = F.slider({ label: T.nLabel, min: 2, max: 10, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.sel = null;
      build();
    } });
    nS.el.style.display = GROUPS[st.g].num ? '' : 'none';
    fig.controls.append(gSeg.el, nS.el);
    const ro = F.readout(fig.readout, [
      { key: 'order', label: T.order },
      { key: 'abel', label: T.abel },
      { key: 'e', label: T.unit },
      { key: 'inv', label: T.inv },
      { key: 'sub', label: T.sub },
    ]);
    let svg = null;
    let G = null;
    let res = null;

    function build() {
      G = GROUPS[st.g].make(st.n);
      res = analyse(G);
      const { N, name } = G;
      const { t, e } = res;
      const C = N > 8 ? 44 : N > 6 ? 50 : 58;
      const size = C * (N + 1);
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl cayley', viewBox: '0 0 ' + size + ' ' + size, role: 'img', 'aria-label': T.tableAria });
      svg.style.maxWidth = Math.max(size, 300) + 'px';
      const a = st.sel ? st.sel[0] : null;
      const inSub = a === null ? [] : res.powers(a);
      const fs = (s) => (s.length > 3 ? 13 : s.length > 2 ? 15 : 18) + 'px';
      const txt = (x, y, s, cls, color) => {
        const node = S('text', { class: cls, x: x + C / 2, y: y + C / 2 }, s);
        node.style.fontSize = fs(s);
        if (color) node.style.fill = color;
        svg.appendChild(node);
      };
      txt(0, 0, '·', 'cv corner');
      for (let i = 0; i < N; i++) {
        if (inSub.includes(i)) {
          svg.appendChild(S('rect', { x: C * (i + 1) + 2, y: 2, width: C - 4, height: C - 4, rx: 4, style: 'fill: var(--accent-soft)' }));
          svg.appendChild(S('rect', { x: 2, y: C * (i + 1) + 2, width: C - 4, height: C - 4, rx: 4, style: 'fill: var(--accent-soft)' }));
        }
        txt(C * (i + 1), 0, name(i), 'cv ch');
        txt(0, C * (i + 1), name(i), 'cv ch');
      }
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const x = C * (j + 1);
          const y = C * (i + 1);
          const on = st.sel && st.sel[0] === i && st.sel[1] === j;
          const g = S('g', { class: 'cell-g', tabindex: '0', role: 'button', 'aria-label': T.cellAria(name(i), name(j)) });
          const r = S('rect', { class: 'cell' + (on ? ' on' : ''), x: x + 2, y: y + 2, width: C - 4, height: C - 4, rx: 4 });
          if (inSub.includes(i) && inSub.includes(j)) r.style.fill = 'var(--accent-soft)';
          g.appendChild(r);
          const s = name(t[i][j]);
          const node = S('text', { class: 'cv', x: x + C / 2, y: y + C / 2 }, s);
          node.style.fontSize = fs(s);
          if (t[i][j] === e) node.style.fill = 'var(--accent)';
          g.appendChild(node);
          const pick = () => {
            st.sel = [i, j];
            build();
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
      readouts(inSub);
      explain(inSub);
    }

    function readouts(inSub) {
      const { N, name } = G;
      ro.set('order', String(N));
      ro.set('abel', res.abel ? T.yes : T.no, res.abel ? 'accent' : 'warm');
      ro.set('e', name(res.e), 'accent');
      if (!st.sel) {
        ro.set('inv', T.dash);
        ro.set('sub', T.dash);
        return;
      }
      const a = st.sel[0];
      ro.set('inv', name(a) + ' → ' + name(res.invs[a]));
      ro.set('sub', String(inSub.length) + (inSub.length === N ? ' = ' + N : ''));
    }

    function explain(inSub) {
      const { N, name } = G;
      let s = T.names[st.g] + (GROUPS[st.g].num ? ', n = ' + st.n : '') + '. ' + T.axioms(N * N * N) + (res.latin ? T.latin : '');
      if (!st.sel) {
        fig.note.textContent = s + T.hint;
        return;
      }
      const [a, b] = st.sel;
      const { t } = res;
      s += T.cell(name(a), name(b), name(t[a][b]), name(t[b][a]));
      s += T.invNote(name(a), name(res.invs[a]));
      s += T.subNote(name(a), inSub.map(name).join(', '), inSub.length, N);
      fig.note.textContent = s;
    }

    build();
  });

  /* ---------- Рисунок 2: симметрия x ↦ r^k s^f правильного n-угольника ---------- */
  MC.widget('polygon-sym', (el, cfg) => {
    const fig = F.shell(el, { kicker: T.fig(cfg.fig || 2), title: T.title2 });
    const st = { n: cfg.n || 3, k: 0, f: 0, only: !!cfg.only };
    const nS = F.slider({ label: T.sides, min: 3, max: 6, step: 1, value: st.n, fmt: (v) => String(Math.round(v)), oninput: (v) => {
      st.n = Math.round(v);
      st.k = 0;
      st.f = 0;
      draw();
    } });
    const bRot = F.button(null, T.rotate, () => {
      // поворот после текущей симметрии: r · (r^k s^f) = r^(k+1) s^f
      st.k = (st.k + 1) % st.n;
      draw();
    });
    const bRef = F.button(null, T.reflect, () => {
      // отражение s после текущей: s · r^k s^f = r^(−k) s^(1−f)
      st.k = (st.n - st.k) % st.n;
      st.f = 1 - st.f;
      draw();
    });
    const bReset = F.button(null, T.reset, () => {
      st.k = 0;
      st.f = 0;
      draw();
    });
    const only = F.check(T.onlyRot, st.only, (v) => {
      st.only = v;
      st.k = 0;
      st.f = 0;
      draw();
    });
    const btns = MC.h('div', { class: 'fig-buttons' }, bRot, bRef, bReset);
    btns.style.display = 'flex';
    btns.style.flexWrap = 'wrap';
    btns.style.gap = '8px';
    fig.controls.append(nS.el, btns, only.el);
    const ro = F.readout(fig.readout, [
      { key: 'now', label: T.now },
      { key: 'perm', label: T.perm },
      { key: 'size', label: T.size },
    ]);
    let svg = null;

    /** Образ вершины i (0…n−1) при r^k s^f: s — отражение i ↦ −i, r — поворот i ↦ i + 1. */
    const img = (i) => {
      const x = st.f ? (st.n - i) % st.n : i;
      return (x + st.k) % st.n;
    };

    function draw() {
      const n = st.n;
      bRef.style.display = st.only ? 'none' : '';
      const W = 320;
      const c = W / 2;
      const R = 110;
      const ang = (i) => Math.PI / 2 + (2 * Math.PI * i) / n;
      const P = (i, rr = R) => [c + rr * Math.cos(ang(i)), c - rr * Math.sin(ang(i))];
      if (svg) svg.remove();
      svg = S('svg', { class: 'pl', viewBox: '0 0 ' + W + ' ' + W, role: 'img', 'aria-label': T.polyAria });
      svg.style.maxWidth = W + 'px';
      svg.style.display = 'block';
      svg.style.margin = '0 auto';
      // неподвижные места вершин
      const pts = [...Array(n).keys()].map((i) => P(i).map((v) => v.toFixed(1)).join(','));
      svg.appendChild(S('polygon', { class: 'poly faint', points: pts.join(' ') }));
      // ось отражения s: через вершину 0 и центр (для показа)
      if (!st.only) {
        const a0 = P(0, R + 26);
        const a1 = [2 * c - a0[0], 2 * c - a0[1]];
        svg.appendChild(S('line', { class: 'guide', x1: a0[0], y1: a0[1], x2: a1[0], y2: a1[1] }));
      }
      // многоугольник после симметрии: вершина с меткой i стоит на месте img(i)
      const moved = [...Array(n).keys()].map((i) => P(img(i)));
      svg.appendChild(S('polygon', { class: 'poly', points: moved.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ') }));
      // метка-флажок у вершины 1, чтобы видеть ориентацию
      const f0 = P(img(0), R - 22);
      svg.appendChild(S('circle', { class: 'dot warm', cx: f0[0], cy: f0[1], r: 5 }));
      for (let i = 0; i < n; i++) {
        const q = P(img(i), R + 16);
        svg.appendChild(S('circle', { class: 'dot accent', cx: P(img(i))[0], cy: P(img(i))[1], r: 4 }));
        const tx = S('text', { class: 'lbl ink', x: q[0], y: q[1], 'text-anchor': 'middle', 'dominant-baseline': 'central' }, String(i + 1));
        svg.appendChild(tx);
      }
      svg.appendChild(S('circle', { class: 'dot', cx: c, cy: c, r: 3 }));
      fig.plot.appendChild(svg);
      const name = st.f ? T.refName(st.k, n) : T.rotName(st.k, n);
      ro.set('now', st.f ? T.refShort : T.rotName(st.k, n), st.f ? 'warm' : 'accent');
      ro.set('perm', '(' + [...Array(n).keys()].map((i) => img(i) + 1).join(' ') + ')');
      const cnt = st.only ? n : 2 * n;
      ro.set('size', String(cnt));
      fig.note.textContent = T.polyNote(name, cnt, st.only);
    }

    draw();
  });

  if (typeof module !== 'undefined') module.exports = { analyse, GROUPS };
})();
