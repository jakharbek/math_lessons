/* =====================================================================================
 * boot.js — единственный скрипт, который подключает страница курса.
 *
 *   <script src="../../assets/js/boot.js" data-root="../../" data-scripts="lesson.js"></script>
 *
 * data-root    — путь к корню курса от страницы;
 * data-page    — 'lesson' (по умолчанию) или 'home';
 * data-scripts — скрипты страницы через запятую (подключаются после модулей курса).
 *
 * Порядок: тема до первой отрисовки → KaTeX и highlight.js с CDN (не блокируют курс) →
 * модули курса строго по порядку → MC.page.init() / MC.home.init().
 * Без CDN курс работает: формулы остаются текстом, код — без подсветки.
 * ===================================================================================== */
(function () {
  'use strict';
  var me = document.currentScript;
  var root = (me && me.getAttribute('data-root')) || './';
  var page = (me && me.getAttribute('data-page')) || 'lesson';
  var extra = (me && me.getAttribute('data-scripts')) || '';
  window.MC_BOOT = { root: root, page: page };

  var KATEX = '0.16.22';
  var HLJS = '11.11.1';

  // 1) Тема до первой отрисовки: явный выбор ученика, иначе — системная
  try {
    var theme = JSON.parse(localStorage.getItem('mc:theme'));
    if (theme === 'light' || theme === 'dark') document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    /* без сохранения */
  }

  function css(href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    document.head.appendChild(l);
  }
  function script(src, onload, ordered) {
    var s = document.createElement('script');
    s.src = src;
    s.async = !ordered;
    s.onload = function () {
      if (onload) onload(true);
    };
    s.onerror = function () {
      console.warn('[MC] не удалось загрузить', src);
      if (onload) onload(false);
    };
    document.head.appendChild(s);
  }

  // 2) Библиотеки с CDN
  var mcReady = false;
  var katexReady = false;
  function maybeFlushMath() {
    if (mcReady && katexReady && window.MC && window.MC.math) window.MC.math._flush();
  }
  css('https://cdn.jsdelivr.net/npm/katex@' + KATEX + '/dist/katex.min.css');
  script('https://cdn.jsdelivr.net/npm/katex@' + KATEX + '/dist/katex.min.js', function (ok) {
    if (!ok) return;
    script('https://cdn.jsdelivr.net/npm/katex@' + KATEX + '/dist/contrib/auto-render.min.js', function (ok2) {
      if (!ok2) return;
      katexReady = true;
      maybeFlushMath();
    });
  });
  if (page === 'lesson') {
    script('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/' + HLJS + '/highlight.min.js', function (ok) {
      if (ok && window.MC && window.MC.bus) window.MC.bus.emit('hljsready');
    });
  }

  // 3) Модули курса — строго по порядку
  var base = root + 'assets/js/';
  var modules = page === 'home'
    ? ['core.js', 'course.js', 'page.js', 'home.js']
    : ['core.js', 'course.js', 'plot.js', 'page.js', 'markdown.js', 'assistant.js'];
  var list = modules.map(function (m) {
    return base + m;
  });
  extra.split(',').map(function (s) {
    return s.trim();
  }).filter(Boolean).forEach(function (s) {
    list.push(s);
  });

  var remaining = list.length;
  list.forEach(function (src) {
    script(src, function () {
      remaining -= 1;
      if (remaining === 0) start();
    }, true);
  });

  function start() {
    var go = function () {
      if (!window.MC || !window.MC.page) {
        console.error('[MC] модули курса не загрузились — проверьте data-root у boot.js');
        return;
      }
      if (page === 'home') window.MC.home.init();
      else window.MC.page.init();
      mcReady = true;
      maybeFlushMath();
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
    else go();
  }
})();
