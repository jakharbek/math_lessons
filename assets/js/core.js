/* =====================================================================================
 * MC — «Математика по косточкам»: ядро веб-части курса.
 *
 * Все модули — обычные (не ES-модули) скрипты, которые добавляют свои части в глобальный
 * объект MC. Так страницы работают и по http://, и при открытии файла с диска (file://).
 * В Node.js тот же код подключается через require() для тестов (объект — globalThis.MC).
 *
 * Здесь: конфигурация, утилиты, построитель DOM, событийная шина, хранилище, тема,
 * формулы (KaTeX), иконки, всплывающие сообщения, прогресс прохождения.
 * ===================================================================================== */
(function (root) {
  'use strict';

  const MC = root.MC || (root.MC = {});
  MC.version = '1.0.0';
  MC.config = Object.assign({ courseTitle: 'Математика по косточкам' }, MC.config || {});

  /* ------------------------------------ утилиты ------------------------------------ */
  MC.util = {
    clamp: (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x),
    lerp: (a, b, t) => a + (b - a) * t,
    /** Число для интерфейса: десятичная запятая и настоящий минус, как в тексте уроков. */
    fmt(x, digits = 3) {
      if (x === null || x === undefined || Number.isNaN(x)) return '—';
      if (!Number.isFinite(x)) return x > 0 ? '∞' : '−∞';
      const ax = Math.abs(x);
      let s;
      if (ax !== 0 && (ax < 1e-4 || ax >= 1e6)) s = x.toExponential(Math.max(1, digits - 1));
      else s = String(Number(x.toFixed(digits)));
      if (s === '-0') s = '0';
      return s.replace(/-/g, '−').replace('.', ',');
    },
    /** Фиксированное число знаков (для координат): 1.6e-8 → «0,000», без «−0». */
    fixed(x, digits = 3) {
      if (!Number.isFinite(x)) return MC.util.fmt(x);
      const s = x.toFixed(digits);
      return (/^-0[.,]?0*$/.test(s) ? s.slice(1) : s).replace('-', '−').replace('.', ',');
    },
    rafThrottle(fn) {
      let queued = false;
      let lastArgs = null;
      return function (...args) {
        lastArgs = args;
        if (queued) return;
        queued = true;
        (root.requestAnimationFrame || ((cb) => setTimeout(cb, 16)))(() => {
          queued = false;
          fn.apply(this, lastArgs);
        });
      };
    },
    debounce(fn, ms = 120) {
      let t = null;
      return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), ms);
      };
    },
    /** «3 урока», «5 шагов»: plural(n, 'шаг', 'шага', 'шагов'). */
    plural(n, one, few, many) {
      const a = n % 10;
      const b = n % 100;
      return n + ' ' + (a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? few : many);
    },
    uid(prefix = 'mc') {
      MC.util._uid = (MC.util._uid || 0) + 1;
      return prefix + '-' + MC.util._uid;
    },
  };

  /* ---------------------------------------------------------------------------------
   * Построитель DOM: h('div', {class: 'x', onclick: fn}, 'текст', child).
   * Текст вставляется через textContent — безопасно для данных.
   * --------------------------------------------------------------------------------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function build(ns, tag, attrs, children) {
    const el = ns ? root.document.createElementNS(ns, tag) : root.document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v === null || v === undefined || v === false) continue;
        if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else if (k === 'dataset' && typeof v === 'object') Object.assign(el.dataset, v);
        else if (k === 'html') el.innerHTML = v; // только для доверенной разметки курса
        else if (k === 'text') el.textContent = v;
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, String(v));
      }
    }
    for (const c of children.flat(Infinity)) {
      if (c === null || c === undefined || c === false) continue;
      el.appendChild(typeof c === 'object' ? c : root.document.createTextNode(String(c)));
    }
    return el;
  }
  MC.h = (tag, attrs, ...children) => build(null, tag, attrs, children);
  MC.svg = (tag, attrs, ...children) => build(SVG_NS, tag, attrs, children);
  MC.SVG_NS = SVG_NS;

  /* ------------------------------------ шина событий ------------------------------- */
  const listeners = {};
  MC.bus = {
    on(evt, fn) {
      (listeners[evt] || (listeners[evt] = [])).push(fn);
      return () => MC.bus.off(evt, fn);
    },
    off(evt, fn) {
      if (listeners[evt]) listeners[evt] = listeners[evt].filter((f) => f !== fn);
    },
    emit(evt, payload) {
      for (const fn of listeners[evt] || []) {
        try {
          fn(payload);
        } catch (e) {
          console.error('[MC] обработчик события', evt, e);
        }
      }
    },
  };

  /* ---------------------------------------------------------------------------------
   * Хранилище: localStorage может быть недоступен (приватный режим, file://) —
   * тогда курс просто работает без сохранения.
   * --------------------------------------------------------------------------------- */
  MC.storage = {
    get(key, fallback = null) {
      try {
        const raw = root.localStorage.getItem('mc:' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        root.localStorage.setItem('mc:' + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  /** Прогресс: {id урока: {done: true, at: метка времени}}; последний открытый урок. */
  MC.progress = {
    all: () => MC.storage.get('progress', {}) || {},
    isDone: (id) => !!(MC.progress.all()[id] || {}).done,
    setDone(id, done) {
      const all = MC.progress.all();
      if (done) all[id] = { done: true, at: Date.now() };
      else delete all[id];
      MC.storage.set('progress', all);
      MC.bus.emit('progress', { id, done });
    },
    last: () => MC.storage.get('last-lesson', null),
    visit: (id) => MC.storage.set('last-lesson', id),
  };

  /* ------------------------------------ буфер обмена ------------------------------- */
  MC.io = {
    async copy(text) {
      try {
        await root.navigator.clipboard.writeText(text);
        return true;
      } catch (e) {
        const ta = MC.h('textarea', { style: { position: 'fixed', opacity: '0' } });
        ta.value = text;
        root.document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try {
          ok = root.document.execCommand('copy');
        } catch (e2) {
          ok = false;
        }
        ta.remove();
        return ok;
      }
    },
  };

  /* ------------------------------------ формулы (KaTeX) ----------------------------- */
  const mathQueue = [];
  MC.math = {
    ready: false,
    /** Отрисовать $…$, $$…$$, \(…\), \[…\] внутри элемента (или поставить в очередь до загрузки KaTeX). */
    render(el) {
      if (!el) return;
      if (this.ready && root.renderMathInElement) {
        try {
          root.renderMathInElement(el, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option'],
            ignoredClasses: ['no-math', 'assistant'],
          });
        } catch (e) {
          console.warn('[MC] KaTeX', e);
        }
      } else mathQueue.push(el);
    },
    /** Формула как элемент (для рисунков с «живыми» числами). */
    tex(src, display = false) {
      const span = MC.h('span');
      if (root.katex) {
        try {
          root.katex.render(src, span, { throwOnError: false, displayMode: display });
          return span;
        } catch (e) {
          /* ниже — запасной вариант */
        }
      }
      span.textContent = src;
      span.className = 'no-math';
      return span;
    },
    /** Заменить содержимое элемента формулой; до загрузки KaTeX — текстом, потом — формулой. */
    set(el, src, display = false) {
      el.replaceChildren(MC.math.tex(src, display));
      if (!root.katex) MC.bus.on('mathready', () => el.replaceChildren(MC.math.tex(src, display)));
    },
    _flush() {
      this.ready = true;
      while (mathQueue.length) this.render(mathQueue.shift());
      MC.bus.emit('mathready');
    },
  };

  /* ------------------------------------ тема ---------------------------------------- */
  MC.theme = {
    current() {
      const t = root.document.documentElement.getAttribute('data-theme');
      if (t === 'dark' || t === 'light') return t;
      return root.matchMedia && root.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    set(t) {
      root.document.documentElement.setAttribute('data-theme', t);
      MC.storage.set('theme', t);
      MC.bus.emit('themechange', t);
    },
    toggle() {
      MC.theme.set(MC.theme.current() === 'dark' ? 'light' : 'dark');
    },
  };

  /* ------------------------------------ интерфейс ----------------------------------- */
  const ICONS = {
    chat: '<path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6.5L8 20.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 10h8M8 13h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor"/>',
    sun: '<circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    search: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M20 20l-4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    chev: '<path d="M9.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    clock: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/>',
    send: '<path d="M12 19V6m0 0l-5.5 5.5M12 6l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    settings: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="15" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    alert: '<path d="M12 4l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4M12 17v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.4-2h5.2L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="10" r="2" fill="currentColor"/><path d="M21 16l-5-5-9 9" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    download: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
    pause: '<path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/>',
    step: '<path d="M6 5.5v13l9-6.5zM16 5.5h2.5v13H16z" fill="currentColor"/>',
    level: '<path d="M5 19V13M12 19V9M19 19V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  };
  function icon(name, cls) {
    const s = root.document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', 'ic' + (cls ? ' ' + cls : ''));
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name] || '';
    return s;
  }

  let toastEl = null;
  let toastTimer = null;
  function toast(text) {
    if (!toastEl) {
      toastEl = MC.h('div', { class: 'toast', role: 'status', 'aria-live': 'polite' });
      root.document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /** Кнопка в стиле курса: kind — 'primary' (b1) или 'secondary' (b2). */
  function button(label, o = {}) {
    const b = MC.h('button', { type: 'button', class: (o.kind === 'primary' ? 'b1' : 'b2') + (o.small ? ' small' : ''), title: o.title || null }, o.icon ? icon(o.icon) : null, label);
    if (o.onclick) b.addEventListener('click', o.onclick);
    return b;
  }

  MC.ui = { icon, toast, button, ICONS };

  /** Загрузка внешнего скрипта (один раз). */
  const scriptPromises = {};
  MC.loadScript = function (src) {
    if (!scriptPromises[src]) {
      scriptPromises[src] = new Promise((resolve, reject) => {
        const s = root.document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Не удалось загрузить ' + src));
        root.document.head.appendChild(s);
      });
    }
    return scriptPromises[src];
  };
})(typeof window !== 'undefined' ? window : globalThis);
