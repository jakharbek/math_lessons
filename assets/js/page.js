/* =====================================================================================
 * MC.page — каркас страниц курса.
 *
 * В файле урока — только содержание: <main class="lesson"> с разделами <section id>.
 * Всё остальное строит MC.page.init() по записи урока в MC.course:
 *   шапка, полоса прочтения, заголовок урока с целями, оглавление, нумерация разделов,
 *   окружений (определение, теорема, пример…), формул и задач, тесты, ссылки на уроки,
 *   «урок пройден», переходы к соседним урокам, подвал. Затем — рисунки (MC.widget)
 *   и событие 'pageready' (на него подписан ИИ-ассистент).
 * ===================================================================================== */
(function (root) {
  'use strict';
  const MC = root.MC;
  const H = MC.h;
  const icon = (n, c) => MC.ui.icon(n, c);
  const doc = root.document;
  const rootPath = () => (root.MC_BOOT && root.MC_BOOT.root) || './';

  const T = MC.T;
  const LEVELS = T.levels;

  /* --------------------------------- шапка и подвал -------------------------------- */
  /** Знак курса: парабола и касательная в минимуме — производная равна нулю. */
  function brandMark() {
    const s = MC.svg(
      'svg',
      { viewBox: '0 0 64 64', class: 'brand-mark', 'aria-hidden': 'true' },
      MC.svg('rect', { width: 64, height: 64, rx: 14, fill: 'var(--pb)' }),
      MC.svg('path', { d: 'M13 14C19 50 45 50 51 14', fill: 'none', stroke: 'var(--pf)', 'stroke-width': 4.5, 'stroke-linecap': 'round' }),
      MC.svg('path', { d: 'M14 41H50', stroke: 'var(--pf)', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: '.55' }),
      MC.svg('circle', { cx: 32, cy: 41, r: 4.5, fill: 'var(--pf)' })
    );
    return s;
  }

  function themeButton() {
    const b = H('button', { type: 'button', class: 'icon-btn theme-btn', id: 'theme-toggle' }, icon('sun', 'sun'), icon('moon', 'moon'));
    const relabel = () => {
      const label = MC.theme.current() === 'dark' ? T.themeLight : T.themeDark;
      b.setAttribute('aria-label', label);
      b.title = label;
    };
    relabel();
    b.addEventListener('click', () => {
      MC.theme.toggle();
      relabel();
    });
    return b;
  }

  /**
   * Переключатель языка RU / EN / UZ: та же страница на другом языке (урок — тот же урок, главная — главная).
   * Выбор запоминается: корневая главная index.html по нему перенаправляет на en/ или uz/.
   */
  function langSwitch(lesson) {
    const r = rootPath();
    const nav = H('nav', { class: 'langs', 'aria-label': T.language });
    for (const L of MC.LANGS) {
      const href = lesson ? MC.course.href(lesson.id, r, L) : MC.course.home(r, L);
      const a = H('a', { href, lang: L, hreflang: L, title: MC.i18n.names[L], 'aria-current': L === MC.lang ? 'true' : null }, MC.i18n.short[L]);
      a.addEventListener('click', () => MC.storage.set('lang', L));
      nav.appendChild(a);
    }
    return nav;
  }

  function header(lesson) {
    const r = rootPath();
    const brand = H('a', { class: 'brand', href: MC.course.home(r), 'aria-label': MC.course.title + ' — ' + T.toHome }, brandMark(), H('span', null, T.brand[0], H('span', { class: 'lite' }, T.brand[1])));
    const mid = lesson
      ? H('div', { class: 'header-lesson', 'aria-hidden': 'true' }, H('span', { class: 'num' }, lesson.id), H('b', null, lesson.title))
      : null;
    const nav = H('nav', { class: 'nav', 'aria-label': T.mainNav }, H('a', { href: MC.course.home(r) + '#program' }, T.program), H('a', { class: 'opt', href: MC.course.home(r) + '#howto' }, T.about));
    // ИИ-ассистент добавляет свою кнопку перед кнопкой темы
    const tools = H('div', { class: 'tools' }, nav, langSwitch(lesson), themeButton());
    return H('header', { class: 'site-header' }, H('div', { class: 'wrap' }, brand, mid, tools));
  }

  /** Тень у шапки при прокрутке; на страницах уроков — ещё и название урока в шапке. */
  function wireHeader(el) {
    const update = () => el.classList.toggle('scrolled', root.scrollY > 8);
    root.addEventListener('scroll', MC.util.rafThrottle(update), { passive: true });
    update();
    requestAnimationFrame(() => doc.body.classList.add('themed'));
  }

  function footer() {
    const L = MC.course.links;
    return H(
      'footer',
      { class: 'site-footer' },
      H(
        'div',
        { class: 'wrap-m' },
        H('span', null, '© ', new Date().getFullYear(), ' ', MC.course.author, ' · ', H('span', { class: 'sig' }, MC.course.title)),
        H(
          'nav',
          { 'aria-label': T.links },
          H('a', { href: MC.course.home(rootPath()) + '#program' }, T.program),
          H('a', { href: L.boosting }, T.boosting),
          H('a', { href: L.blog }, T.blog),
          H('a', { href: L.repo }, 'GitHub')
        )
      )
    );
  }

  /* --------------------------------- заголовок урока ------------------------------- */
  function hero(lesson) {
    const part = MC.course.part(lesson.part);
    const r = rootPath();
    const lvl = H('span', { class: 'lvl', 'aria-hidden': 'true' }, [1, 2, 3, 4].map((i) => H('i', { class: i <= lesson.level ? 'on' : null })));
    const goals = (lesson.objectives || []).length
      ? H('div', { class: 'goals' }, H('span', null, T.goals), H('ol', null, lesson.objectives.map((o) => H('li', null, H('span', null, o)))))
      : null;
    return H(
      'section',
      { class: 'lesson-hero wrap-xs' },
      H('span', { class: 'kicker rise' }, H('a', { href: MC.course.home(r) + '#part-' + part.id }, T.part(part.id)), H('i', null, '·'), H('span', null, part.title)),
      H('h1', { class: 'rise' }, H('span', { class: 'n' }, T.lesson(lesson.id)), lesson.title),
      lesson.subtitle ? H('p', { class: 'dek rise' }, lesson.subtitle) : null,
      H(
        'div',
        { class: 'lesson-meta rise' },
        H('span', null, icon('clock'), T.minutes(lesson.minutes)),
        H('span', null, lvl, T.level(LEVELS[lesson.level])),
        H('span', { class: 'kbd-hint' }, icon('spark'), T.kbdHint[0], H('kbd', null, 'Alt'), '+', H('kbd', null, 'I'), T.kbdHint[1])
      ),
      goals
    );
  }

  /* --------------------------------- оглавление ------------------------------------ */
  function toc(main) {
    const items = Array.from(main.querySelectorAll(':scope > section[id] > h2')).map((h) => ({ id: h.parentElement.id, text: h.dataset.title || h.textContent.replace(/^\d+\s*/, '').trim() }));
    const link = (it) => H('a', { href: '#' + it.id, 'data-id': it.id }, it.text);
    const aside = H('aside', { class: 'toc', 'aria-label': T.toc }, H('span', null, T.toc), H('nav', null, items.map(link)));
    const mobile = H('div', { class: 'toc-mobile' }, H('details', null, H('summary', null, T.tocLesson), H('nav', null, items.map(link))));
    mobile.addEventListener('click', (e) => {
      if (e.target.closest('a')) mobile.querySelector('details').open = false;
    });
    return { aside, mobile, items };
  }

  function watchToc(aside, items) {
    const links = Array.from(aside.querySelectorAll('a'));
    const heads = items.map((it) => doc.getElementById(it.id)).filter(Boolean);
    if (!('IntersectionObserver' in root) || !heads.length) return;
    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => (en.isIntersecting ? visible.add(en.target.id) : visible.delete(en.target.id)));
        // активен первый видимый раздел; если ни одного — последний, ушедший вверх
        let active = heads.find((h) => visible.has(h.id));
        if (!active) active = heads.filter((h) => h.getBoundingClientRect().top < root.innerHeight * 0.3).pop();
        links.forEach((a) => a.classList.toggle('active', !!active && a.dataset.id === active.id));
      },
      { rootMargin: '-' + (60 + 16) + 'px 0px -55% 0px' }
    );
    heads.forEach((h) => io.observe(h));
  }

  function readingProgress(main) {
    const bar = H('i');
    const wrap = H('div', { class: 'read-progress', 'aria-hidden': 'true' }, bar);
    const update = () => {
      const r = main.getBoundingClientRect();
      const total = r.height - root.innerHeight * 0.6;
      const p = total > 0 ? MC.util.clamp((root.innerHeight * 0.4 - r.top) / total, 0, 1) : 1;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    };
    root.addEventListener('scroll', MC.util.rafThrottle(update), { passive: true });
    root.addEventListener('resize', MC.util.rafThrottle(update));
    setTimeout(update, 0);
    return wrap;
  }

  /* --------------------------------- разметка содержания --------------------------- */
  const ENV = {
    def: { label: T.env.def, numbered: true },
    thm: { label: T.env.thm, numbered: true },
    example: { label: T.env.example, numbered: true },
    intuition: { label: T.env.intuition },
    warn: { label: T.env.warn },
    note: { label: T.env.note },
    history: { label: T.env.history },
  };

  function numberSections(main) {
    let n = 0;
    for (const sec of main.querySelectorAll(':scope > section[id]')) {
      const h = sec.querySelector(':scope > h2');
      if (!h) continue;
      h.dataset.title = h.textContent.trim();
      if (sec.classList.contains('unnumbered')) continue;
      n += 1;
      h.prepend(H('span', { class: 'h-num', 'aria-hidden': 'true' }, String(n)));
    }
  }

  function environments(main) {
    const count = {};
    for (const el of main.querySelectorAll('.env')) {
      const type = Object.keys(ENV).find((k) => el.classList.contains(k));
      if (!type || el.querySelector(':scope > .env-head')) continue;
      const spec = ENV[type];
      let label = el.dataset.label || spec.label;
      if (spec.numbered && !el.dataset.label) {
        count[type] = (count[type] || 0) + 1;
        label = T.numbered(label, count[type]);
      }
      const body = H('div', { class: 'env-body' });
      while (el.firstChild) body.appendChild(el.firstChild);
      el.append(H('div', { class: 'env-head' }, H('span', null, label), el.dataset.name ? H('span', { class: 'nm' }, el.dataset.name) : null), body);
    }
  }

  function equations(main) {
    let n = 0;
    const numbers = {};
    for (const eq of main.querySelectorAll('.eq')) {
      if (eq.classList.contains('plain') || eq.classList.contains('nonum')) continue;
      n += 1;
      if (eq.id) numbers[eq.id] = n;
      eq.appendChild(H('span', { class: 'eq-num', 'aria-hidden': 'true' }, '(' + n + ')'));
    }
    for (const a of main.querySelectorAll('a.eq-ref[href^="#"]')) {
      const k = numbers[a.getAttribute('href').slice(1)];
      if (k) a.textContent = '(' + k + ')';
    }
  }

  function exercises(main) {
    let n = 0;
    for (const ex of main.querySelectorAll('.exercise')) {
      if (ex.querySelector(':scope > .env-head')) continue;
      n += 1;
      const stars = MC.util.clamp(Number(ex.dataset.stars) || 1, 1, 3);
      ex.prepend(
        H(
          'div',
          { class: 'env-head' },
          H('span', null, T.numbered(T.problem, n)),
          H('span', { class: 'stars', title: T.stars[stars], 'aria-label': T.difficulty(stars) }, H('b', null, '★'.repeat(stars)), '★'.repeat(3 - stars)),
          ex.dataset.name ? H('span', { class: 'nm' }, ex.dataset.name) : null
        )
      );
    }
  }

  /**
   * <a data-lesson="2.1"></a> → «урок 2.1 «Предел»» (ссылка, если урок готов).
   * data-case="prep" → «уроке 2.1 …» (в уроке), "gen" → «урока 2.1 …» (из урока).
   */
  function lessonLinks(main) {
    for (const a of main.querySelectorAll('a[data-lesson]')) {
      const l = MC.course.byId(a.dataset.lesson);
      if (!l) continue;
      if (!a.textContent.trim()) a.textContent = T.lessonLink(l, a.dataset.case);
      if (l.status === 'ready') a.href = MC.course.href(l.id, rootPath());
      else {
        const span = H('span', { class: 'soon-link', title: T.soonTitle }, a.textContent, ' ', H('span', { class: 'tag' }, T.soon));
        a.replaceWith(span);
      }
    }
  }

  /* --------------------------------- тест «Проверь себя» --------------------------- */
  function quiz(el) {
    let data = [];
    try {
      data = JSON.parse(el.querySelector('script[type="application/json"]').textContent);
    } catch (e) {
      el.textContent = T.quizBroken;
      return;
    }
    const answered = new Map();
    const score = H('b');
    const total = data.length;
    const again = MC.ui.button(T.again, { small: true, icon: 'reset' });
    const foot = H('div', { class: 'quiz-foot' }, H('span', null, T.right, score), again);
    const update = () => {
      const right = Array.from(answered.values()).filter(Boolean).length;
      score.textContent = T.of(right, total);
      foot.hidden = answered.size === 0;
    };
    const build = () => {
      answered.clear();
      const qs = data.map((q, qi) => {
        const right = Array.isArray(q.answer) ? q.answer : [q.answer];
        const explain = H('div', { class: 'quiz-explain', hidden: true, html: q.explain || '' });
        const opts = q.options.map((o, oi) =>
          H('button', { type: 'button', class: 'quiz-opt' }, H('span', { class: 'mk' }, T.letters[oi] + ')'), H('span', { html: o }))
        );
        opts.forEach((b, oi) =>
          b.addEventListener('click', () => {
            const ok = right.includes(oi);
            opts.forEach((x, xi) => {
              x.disabled = true;
              if (right.includes(xi)) x.classList.add('right');
            });
            if (!ok) b.classList.add('wrong');
            explain.hidden = false;
            answered.set(qi, ok);
            update();
          })
        );
        return H('div', { class: 'quiz-q' }, H('p', null, H('span', { class: 'qn' }, qi + 1 + '.'), H('span', { html: q.q })), H('div', { class: 'quiz-opts' }, opts), explain);
      });
      el.replaceChildren(...qs, foot);
      update();
      MC.math.render(el);
    };
    again.addEventListener('click', build);
    build();
  }

  /* --------------------------------- рисунки --------------------------------------- */
  const widgets = {};
  MC.widget = (name, fn) => (widgets[name] = fn);
  function mountWidgets(scope) {
    for (const el of scope.querySelectorAll('[data-widget]')) {
      const name = el.dataset.widget;
      if (el.dataset.mounted) continue;
      el.dataset.mounted = '1';
      let cfg = {};
      try {
        cfg = JSON.parse(el.dataset.config || '{}');
      } catch (e) {
        console.warn('[MC] data-config не JSON', el);
      }
      if (!widgets[name]) {
        console.warn('[MC] нет рисунка', name);
        continue;
      }
      try {
        widgets[name](el, cfg);
      } catch (e) {
        console.error('[MC] рисунок', name, e);
        el.appendChild(H('p', { class: 'fig-note bad' }, T.figFail + e.message));
      }
    }
  }

  /* --------------------------------- конец урока ----------------------------------- */
  function lessonEnd(lesson) {
    const btn = MC.ui.button('', { kind: 'primary' });
    const note = H('p');
    const paint = () => {
      const done = MC.progress.isDone(lesson.id);
      btn.replaceChildren(icon('check'), done ? T.done : T.markDone);
      btn.classList.toggle('is-done', done);
      btn.setAttribute('aria-pressed', String(done));
      note.textContent = done ? T.doneNote : T.todoNote;
    };
    btn.addEventListener('click', () => {
      const done = !MC.progress.isDone(lesson.id);
      MC.progress.setDone(lesson.id, done);
      paint();
      if (done) MC.ui.toast(T.toastDone(lesson.id));
    });
    paint();
    const end = H('section', { class: 'lesson-done' }, H('div', { class: 'wrap-xs' }, H('span', { class: 'kicker' }, T.endKicker(lesson.id)), H('h2', null, T.endTitle), note, btn));

    const nb = MC.course.neighbours(lesson.id);
    const r = rootPath();
    const card = (l, dir) =>
      H(
        'a',
        { class: dir, href: MC.course.href(l.id, r), rel: dir },
        H('span', { class: 'kicker' }, dir === 'prev' ? T.prev : T.next),
        H('span', { class: 'big' }, H('span', { class: 'n' }, l.id), l.title)
      );
    const home = H('a', { class: 'next', href: MC.course.home(r) + '#program' }, H('span', { class: 'kicker' }, T.further), H('span', { class: 'big' }, T.allProgram));
    const nav = H('nav', { class: 'lesson-nav', 'aria-label': T.neighbours }, H('div', { class: 'wrap-m' }, nb.prev ? card(nb.prev, 'prev') : null, nb.next ? card(nb.next, 'next') : home));
    return [end, nav];
  }

  /* --------------------------------- инициализация --------------------------------- */
  function init() {
    const id = doc.documentElement.dataset.lesson;
    const lesson = MC.course.byId(id);
    const main = doc.querySelector('main.lesson');
    if (!lesson || !main) {
      console.error('[MC] урок', id, 'не найден в MC.course');
      return;
    }
    MC.progress.visit(lesson.id);
    MC.storage.set('lang', MC.lang); // корневая главная перенаправит на этот язык
    if (!doc.title) doc.title = lesson.id + ' ' + lesson.title + ' — ' + MC.course.title;

    numberSections(main);
    environments(main);
    equations(main);
    exercises(main);
    lessonLinks(main);

    const head = header(lesson);
    const t = toc(main);
    const layout = H('div', { class: 'lesson-layout wrap-m' }, t.aside);
    main.replaceWith(layout);
    layout.appendChild(main);
    const top = hero(lesson);
    top.appendChild(t.mobile);
    doc.body.prepend(head, readingProgress(main), top);
    layout.after(...lessonEnd(lesson), footer());
    wireHeader(head);
    head.querySelector('.header-lesson').classList.add('on');
    watchToc(t.aside, t.items);

    main.querySelectorAll('.quiz').forEach(quiz);
    MC.math.render(doc.body);
    mountWidgets(main);
    if (root.location.hash) {
      const target = doc.getElementById(decodeURIComponent(root.location.hash.slice(1)));
      if (target) setTimeout(() => target.scrollIntoView(), 50);
    }
    MC.bus.emit('pageready', { lesson, main });
  }

  MC.page = { init, header, footer, wireHeader, brandMark, themeButton, langSwitch, mountWidgets, rootPath, LEVELS };
})(typeof window !== 'undefined' ? window : globalThis);
