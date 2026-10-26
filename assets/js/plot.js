/* =====================================================================================
 * MC.Plot — лёгкие SVG-графики для рисунков курса; MC.fig — каркас интерактивного рисунка.
 *
 *   const p = new MC.Plot(parent, {x: [-3, 3], y: [-1, 5], height: 420, equal: false});
 *   p.axes({xLabel: 'x', yLabel: 'y'});
 *   p.clear(); p.fn(x => x * x, 'curve'); p.dot(1, 1, 'accent');
 *
 * Цвета задаются классами (.curve.accent, .dot.warm, …) и токенами course.css, поэтому
 * смена темы не требует перерисовки. Координаты всех методов — в единицах данных.
 * ===================================================================================== */
(function (root) {
  'use strict';
  const MC = root.MC;
  const S = MC.svg;
  const H = MC.h;
  const f2 = (v) => (Math.round(v * 100) / 100).toString();

  function niceStep(span, count) {
    const raw = span / Math.max(1, count);
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const err = raw / pow;
    return (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * pow;
  }
  function ticks(lo, hi, count) {
    const step = niceStep(hi - lo, count);
    const out = [];
    for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : +v.toPrecision(12));
    return out;
  }
  const tickText = (v) => MC.util.fmt(v, 2);

  class Plot {
    constructor(parent, o = {}) {
      this.o = o;
      this.W = o.width || 720;
      this.H = o.height || 420;
      this.m = Object.assign({ l: 40, r: 16, t: 14, b: 30 }, o.margin || {});
      this.xd = (o.x || [-1, 1]).slice();
      this.yd = (o.y || [-1, 1]).slice();
      if (o.equal) this._equalize();
      const id = MC.util.uid('clip');
      this.clipId = id;
      this.clipRect = S('rect');
      this.svg = S('svg', { viewBox: '0 0 ' + this.W + ' ' + this.H, class: 'pl', role: 'img', 'aria-label': o.label || 'График', preserveAspectRatio: 'xMidYMid meet' }, S('defs', null, S('clipPath', { id }, this.clipRect)));
      this.back = S('g', { class: 'back' });
      this.main = S('g', { class: 'main', 'clip-path': 'url(#' + id + ')' });
      this.front = S('g', { class: 'front' });
      this.svg.append(this.back, this.main, this.front);
      this._layout();
      parent.appendChild(this.svg);
    }
    _equalize() {
      // одинаковый масштаб по осям: растягиваем меньший диапазон вокруг его середины
      const pw = this.W - this.m.l - this.m.r;
      const ph = this.H - this.m.t - this.m.b;
      const kx = (this.xd[1] - this.xd[0]) / pw;
      const ky = (this.yd[1] - this.yd[0]) / ph;
      if (kx > ky) {
        const c = (this.yd[0] + this.yd[1]) / 2;
        const half = (kx * ph) / 2;
        this.yd = [c - half, c + half];
      } else {
        const c = (this.xd[0] + this.xd[1]) / 2;
        const half = (ky * pw) / 2;
        this.xd = [c - half, c + half];
      }
    }
    _layout() {
      const { l, r, t, b } = this.m;
      this.px = [l, this.W - r];
      this.py = [this.H - b, t];
      Object.entries({ x: l, y: t, width: this.W - l - r, height: this.H - t - b }).forEach(([k, v]) => this.clipRect.setAttribute(k, v));
    }
    setDomain(x, y) {
      if (x) this.xd = x.slice();
      if (y) this.yd = y.slice();
      if (this.o.equal) this._equalize();
    }
    sx(x) {
      return this.px[0] + ((x - this.xd[0]) / (this.xd[1] - this.xd[0])) * (this.px[1] - this.px[0]);
    }
    sy(y) {
      return this.py[0] + ((y - this.yd[0]) / (this.yd[1] - this.yd[0])) * (this.py[1] - this.py[0]);
    }
    ix(px) {
      return this.xd[0] + ((px - this.px[0]) / (this.px[1] - this.px[0])) * (this.xd[1] - this.xd[0]);
    }
    iy(py) {
      return this.yd[0] + ((py - this.py[0]) / (this.py[1] - this.py[0])) * (this.yd[1] - this.yd[0]);
    }
    /** Событие мыши/касания → координаты данных. */
    toData(e) {
      const r = this.svg.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * this.W;
      const py = ((e.clientY - r.top) / r.height) * this.H;
      return { x: this.ix(px), y: this.iy(py) };
    }
    layer(name) {
      return name === 'back' ? this.back : name === 'front' ? this.front : this.main;
    }
    clear(name) {
      this.layer(name || 'main').replaceChildren();
      if (!name) this.front.replaceChildren();
    }
    /** Сетка, оси и подписи делений. */
    axes(o = {}) {
      const g = this.back;
      g.replaceChildren();
      const xt = o.xTicks || ticks(this.xd[0], this.xd[1], o.xCount || Math.max(4, Math.round((this.W - this.m.l - this.m.r) / 80)));
      const yt = o.yTicks || ticks(this.yd[0], this.yd[1], o.yCount || Math.max(3, Math.round((this.H - this.m.t - this.m.b) / 60)));
      const [x0, x1] = this.px;
      const [y0, y1] = this.py;
      if (o.grid !== false) {
        for (const v of xt) g.appendChild(S('line', { class: 'grid', x1: f2(this.sx(v)), x2: f2(this.sx(v)), y1: y0, y2: y1 }));
        for (const v of yt) g.appendChild(S('line', { class: 'grid', x1: x0, x2: x1, y1: f2(this.sy(v)), y2: f2(this.sy(v)) }));
      }
      const ax = this.yd[0] <= 0 && this.yd[1] >= 0 ? this.sy(0) : y0;
      const ay = this.xd[0] <= 0 && this.xd[1] >= 0 ? this.sx(0) : x0;
      g.appendChild(S('line', { class: 'axis', x1: x0, x2: x1, y1: f2(ax), y2: f2(ax) }));
      g.appendChild(S('line', { class: 'axis', x1: f2(ay), x2: f2(ay), y1: y0, y2: y1 }));
      if (o.labels !== false) {
        for (const v of xt) if (v !== 0 || o.zero) g.appendChild(S('text', { class: 'tick-label', x: f2(this.sx(v)), y: y0 + 20, 'text-anchor': 'middle' }, tickText(v)));
        for (const v of yt) if (v !== 0 || o.zero) g.appendChild(S('text', { class: 'tick-label', x: x0 - 8, y: f2(this.sy(v) + 4), 'text-anchor': 'end' }, tickText(v)));
      }
      if (o.xLabel) g.appendChild(S('text', { class: 'lbl', x: x1 - 4, y: f2(ax - 8), 'text-anchor': 'end' }, o.xLabel));
      if (o.yLabel) g.appendChild(S('text', { class: 'lbl', x: f2(ay + 8), y: y1 + 14 }, o.yLabel));
    }
    _add(el, layer) {
      this.layer(layer).appendChild(el);
      return el;
    }
    /** Ломаная по точкам [[x, y], …]; null в массиве — разрыв. */
    path(points, cls = 'curve', layer) {
      let d = '';
      let pen = false;
      for (const p of points) {
        if (!p || !Number.isFinite(p[1]) || !Number.isFinite(p[0])) {
          pen = false;
          continue;
        }
        d += (pen ? 'L' : 'M') + f2(this.sx(p[0])) + ' ' + f2(this.sy(p[1]));
        pen = true;
      }
      return this._add(S('path', { class: cls, d }), layer);
    }
    /** График функции; точки далеко за пределами области рвут линию (асимптоты). */
    fn(f, cls = 'curve', o = {}) {
      const a = o.from !== undefined ? o.from : this.xd[0];
      const b = o.to !== undefined ? o.to : this.xd[1];
      const n = o.n || 400;
      const span = this.yd[1] - this.yd[0];
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const x = a + ((b - a) * i) / n;
        const y = f(x);
        pts.push(Number.isFinite(y) && y > this.yd[0] - 4 * span && y < this.yd[1] + 4 * span ? [x, y] : null);
      }
      return this.path(pts, cls, o.layer);
    }
    seg(x1, y1, x2, y2, cls = 'guide', layer) {
      return this._add(S('line', { class: cls, x1: f2(this.sx(x1)), y1: f2(this.sy(y1)), x2: f2(this.sx(x2)), y2: f2(this.sy(y2)) }), layer);
    }
    /** Прямая через (x0, y0) с наклоном k на всю ширину графика. */
    lineSlope(x0, y0, k, cls = 'curve accent', layer) {
      const a = this.xd[0];
      const b = this.xd[1];
      return this.seg(a, y0 + k * (a - x0), b, y0 + k * (b - x0), cls, layer);
    }
    dot(x, y, cls = '', r = 5, layer = 'front') {
      return this._add(S('circle', { class: 'dot ' + cls, cx: f2(this.sx(x)), cy: f2(this.sy(y)), r }), layer);
    }
    text(x, y, str, cls = 'lbl', o = {}) {
      return this._add(S('text', { class: cls, x: f2(this.sx(x) + (o.dx || 0)), y: f2(this.sy(y) + (o.dy || 0)), 'text-anchor': o.anchor || 'start' }, str), o.layer || 'front');
    }
    polygon(points, cls = 'poly', layer) {
      return this._add(S('polygon', { class: cls, points: points.map((p) => f2(this.sx(p[0])) + ',' + f2(this.sy(p[1]))).join(' ') }), layer);
    }
    /** Стрелка с наконечником (наконечник — часть пути, поэтому цвет берётся из класса). */
    arrow(x1, y1, x2, y2, cls = 'ink', layer = 'front', head = 9) {
      const X1 = this.sx(x1);
      const Y1 = this.sy(y1);
      const X2 = this.sx(x2);
      const Y2 = this.sy(y2);
      const len = Math.hypot(X2 - X1, Y2 - Y1);
      let d = 'M' + f2(X1) + ' ' + f2(Y1) + 'L' + f2(X2) + ' ' + f2(Y2);
      if (len > 2) {
        const ux = (X2 - X1) / len;
        const uy = (Y2 - Y1) / len;
        const h = Math.min(head, len * 0.45);
        const w = h * 0.55;
        d += 'M' + f2(X2 - ux * h - uy * w) + ' ' + f2(Y2 - uy * h + ux * w) + 'L' + f2(X2) + ' ' + f2(Y2) + 'L' + f2(X2 - ux * h + uy * w) + ' ' + f2(Y2 - uy * h - ux * w);
      }
      return this._add(S('path', { class: 'arrow ' + cls, d }), layer);
    }
    /**
     * Линии уровня f(x, y) = c (марширующие квадраты). levels — массив c;
     * major — какие уровни выделить. Возвращает группу путей.
     */
    contours(f, levels, o = {}) {
      const nx = o.nx || 120;
      const ny = o.ny || Math.round((nx * (this.H - this.m.t - this.m.b)) / (this.W - this.m.l - this.m.r));
      const xs = [];
      const ys = [];
      for (let i = 0; i <= nx; i++) xs.push(this.xd[0] + ((this.xd[1] - this.xd[0]) * i) / nx);
      for (let j = 0; j <= ny; j++) ys.push(this.yd[0] + ((this.yd[1] - this.yd[0]) * j) / ny);
      const v = ys.map((y) => xs.map((x) => f(x, y)));
      const g = S('g', null);
      levels.forEach((c, li) => {
        let d = '';
        const P = (x, y) => f2(this.sx(x)) + ' ' + f2(this.sy(y));
        const lerp = (a, b, va, vb) => a + ((c - va) / (vb - va)) * (b - a);
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            const a = v[j][i];
            const b = v[j][i + 1];
            const cc = v[j + 1][i + 1];
            const dd = v[j + 1][i];
            const k = (a > c ? 1 : 0) | (b > c ? 2 : 0) | (cc > c ? 4 : 0) | (dd > c ? 8 : 0);
            if (k === 0 || k === 15) continue;
            const x0 = xs[i];
            const x1 = xs[i + 1];
            const y0 = ys[j];
            const y1 = ys[j + 1];
            const e = {
              b: () => [lerp(x0, x1, a, b), y0], // нижняя сторона
              r: () => [x1, lerp(y0, y1, b, cc)], // правая
              t: () => [lerp(x0, x1, dd, cc), y1], // верхняя
              l: () => [x0, lerp(y0, y1, a, dd)], // левая
            };
            const seg = (p, q) => {
              const A = e[p]();
              const B = e[q]();
              d += 'M' + P(A[0], A[1]) + 'L' + P(B[0], B[1]);
            };
            switch (k) {
              case 1: case 14: seg('l', 'b'); break;
              case 2: case 13: seg('b', 'r'); break;
              case 3: case 12: seg('l', 'r'); break;
              case 4: case 11: seg('r', 't'); break;
              case 6: case 9: seg('b', 't'); break;
              case 7: case 8: seg('l', 't'); break;
              case 5: seg('l', 't'); seg('b', 'r'); break;
              case 10: seg('l', 'b'); seg('r', 't'); break;
            }
          }
        }
        const major = o.major ? o.major(c, li) : false;
        g.appendChild(S('path', { class: 'contour' + (major ? ' major' : ''), d }));
      });
      return this._add(g, o.layer || 'back');
    }
    /** Перетаскиваемая точка. onMove({x, y}) получает координаты данных. */
    handle(x, y, onMove, cls = 'accent') {
      const halo = S('circle', { class: 'halo', r: 12 });
      const dot = S('circle', { class: 'dot ' + cls, r: 6.5 });
      const g = S('g', { class: 'handle', tabindex: '0', role: 'slider', 'aria-label': 'Перетащите точку' }, halo, dot);
      const place = (X, Y) => {
        for (const c of [halo, dot]) {
          c.setAttribute('cx', f2(this.sx(X)));
          c.setAttribute('cy', f2(this.sy(Y)));
        }
      };
      place(x, y);
      let drag = false;
      g.addEventListener('pointerdown', (e) => {
        drag = true;
        g.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      g.addEventListener('pointermove', (e) => {
        if (drag) onMove(this.toData(e));
      });
      const stop = () => (drag = false);
      g.addEventListener('pointerup', stop);
      g.addEventListener('pointercancel', stop);
      this.front.appendChild(g);
      return { el: g, place };
    }
  }

  /* =================================================================================
   * MC.fig — каркас интерактивного рисунка: заголовок, график, панель управления,
   * табло чисел, живая подсказка и подпись.
   * ================================================================================= */

  /** Текст с формулами: «наклон $k$» → текст + KaTeX (перерисуется, когда KaTeX загрузится). */
  function rich(text) {
    const span = H('span');
    const paint = () => {
      const out = [];
      const re = /\$([^$]+)\$/g;
      let at = 0;
      let m;
      while ((m = re.exec(text))) {
        if (m.index > at) out.push(text.slice(at, m.index));
        out.push(MC.math.tex(m[1], false));
        at = m.index + m[0].length;
      }
      if (at < text.length) out.push(text.slice(at));
      span.replaceChildren(...out);
    };
    paint();
    if (!root.katex && text.includes('$')) MC.bus.on('mathready', paint);
    return span;
  }

  function shell(el, o = {}) {
    const caption = el.querySelector('.figcaption');
    el.classList.add('figure');
    el.replaceChildren();
    const head = H('div', { class: 'fig-head' }, H('span', { class: 'fig-title' }, H('span', { class: 'k' }, o.kicker || 'Рисунок'), rich(o.title || '')));
    const plot = H('div', { class: 'fig-plot' });
    const controls = H('div', { class: 'fig-controls' });
    const readout = H('div', { class: 'readout' });
    const note = H('p', { class: 'fig-note', 'aria-live': 'polite' });
    el.append(head, plot, controls, readout, note);
    if (caption) el.appendChild(caption);
    return { el, head, plot, controls, readout, note, caption };
  }

  /** Ползунок. fmt(v) — как показать значение; map(v) — нелинейная шкала (например, 10^v). */
  function slider(o) {
    const input = H('input', { type: 'range', min: o.min, max: o.max, step: o.step || 'any', value: o.value, 'aria-label': o.aria || (typeof o.label === 'string' ? o.label.replace(/\$/g, '') : '') });
    const out = H('output');
    const map = o.map || ((v) => v);
    const fmt = o.fmt || ((v) => MC.util.fmt(v, 2));
    const show = () => (out.textContent = fmt(map(Number(input.value))));
    input.addEventListener('input', () => {
      show();
      if (o.oninput) o.oninput(map(Number(input.value)));
    });
    show();
    const el = H('label', { class: 'ctl' }, H('span', null, typeof o.label === 'string' ? rich(o.label) : o.label), input, out);
    return {
      el,
      input,
      get: () => map(Number(input.value)),
      set(v) {
        input.value = v;
        show();
      },
    };
  }

  /** Сегментированный переключатель. options: [{value, label}] (label может содержать $…$). */
  function seg(options, value, onchange, aria) {
    const el = H('div', { class: 'seg', role: 'group', 'aria-label': aria || null });
    const buttons = options.map((op) => {
      const b = H('button', { type: 'button', 'aria-pressed': String(op.value === value) }, rich(op.label));
      b.addEventListener('click', () => {
        api.set(op.value);
        onchange(op.value);
      });
      el.appendChild(b);
      return b;
    });
    const api = {
      el,
      set(v) {
        value = v;
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(options[i].value === v)));
      },
      get: () => value,
    };
    return api;
  }

  function check(label, checked, onchange) {
    const input = H('input', { type: 'checkbox', checked: !!checked });
    input.addEventListener('change', () => onchange(input.checked));
    return { el: H('label', { class: 'check' }, input, rich(label)), input };
  }

  function button(iconName, label, fn) {
    const b = H('button', { type: 'button', class: 'b2 small' }, iconName ? MC.ui.icon(iconName) : null, label);
    b.addEventListener('click', fn);
    return b;
  }

  /** Табло: items [{key, label}] → {set(key, text, cls)}. */
  function readout(parent, items) {
    const cells = {};
    for (const it of items) {
      const b = H('b');
      cells[it.key] = b;
      parent.appendChild(H('div', null, H('span', null, rich(it.label)), b));
    }
    return {
      set(key, text, cls) {
        cells[key].textContent = text;
        cells[key].className = cls || '';
      },
    };
  }

  /** Анимация по кадрам с паузой: player(step, {interval}) → {play, pause, toggle, playing}. */
  function player(step, o = {}) {
    let timer = null;
    const api = {
      playing: () => !!timer,
      play() {
        if (timer) return;
        timer = setInterval(() => {
          if (step() === false) api.pause();
        }, o.interval || 450);
        if (o.onchange) o.onchange(true);
      },
      pause() {
        clearInterval(timer);
        timer = null;
        if (o.onchange) o.onchange(false);
      },
      toggle() {
        api.playing() ? api.pause() : api.play();
      },
    };
    return api;
  }

  MC.Plot = Plot;
  MC.fig = { shell, slider, seg, check, button, readout, player, rich, ticks };
})(typeof window !== 'undefined' ? window : globalThis);
