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
      // урок только на русском (ruOnly): на другом языке его ещё нет — ведём на главную того языка
      const href = lesson && (!lesson.ruOnly || L === 'ru') ? MC.course.href(lesson.id, r, L) : MC.course.home(r, L);
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
    book: { label: T.env.book },
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

  /* --------------------------------- чтение книги с аккордеонами -------------------- */
  /**
   * <div class="reader"> — текст учебника подряд, предложение за предложением:
   *   <details class="sent"><summary data-kind="quote|retell" data-page="39">предложение</summary>
   *   <div class="sent-body">разбор</div></details>
   * Каркас добавляет метку «Цитата · с. 39» / «Пересказ · с. 39», сквозной номер предложения
   * и кнопки «Раскрыть всё» / «Свернуть всё» над каждым блоком.
   */
  let sentNo = 0;
  const bookIndex = []; // {details, target, raw} — для поиска по фразе из книги
  let bookSearchMade = false;

  /** Ключ хранения личного текста: урок + хеш исходного текста предложения (до отрисовки формул). */
  function hashText(t) {
    let h = 0x811c9dc5;
    for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  const lessonKey = () => doc.documentElement.dataset.lesson || 'page';
  const myKey = (raw) => 'book:' + lessonKey() + ':' + hashText(raw.replace(/\s+/g, ' ').trim());

  /** Поле «Текст из моей книги» — только в localStorage этого браузера, на сайт не попадает. */
  function myBook(raw) {
    const R = T.reader;
    const key = myKey(raw);
    const box = H('div', { class: 'mybook' });
    const show = () => {
      const saved = MC.storage.get(key, '');
      box.replaceChildren();
      if (saved) {
        box.append(
          H('p', { class: 'mybook-h' }, R.myLabel),
          H('blockquote', { class: 'mybook-text' }, saved),
          H('div', { class: 'mybook-row' }, MC.ui.button(R.edit, { small: true, onclick: edit })),
        );
      } else {
        box.append(H('div', { class: 'mybook-row' }, MC.ui.button(R.my, { small: true, icon: 'plus', onclick: edit })));
      }
    };
    function edit() {
      const saved = MC.storage.get(key, '');
      const ta = H('textarea', { class: 'mybook-input', rows: '3', placeholder: R.myPh });
      ta.value = saved;
      const row = H('div', { class: 'mybook-row' },
        MC.ui.button(R.save, { small: true, kind: 'primary', onclick: () => { const v = ta.value.trim(); if (v) MC.storage.set(key, v); else removeKey(key); show(); } }),
        MC.ui.button(R.cancel, { small: true, onclick: show }),
        saved ? MC.ui.button(R.del, { small: true, onclick: () => { removeKey(key); show(); } }) : null);
      box.replaceChildren(H('p', { class: 'mybook-h' }, R.my), ta, H('p', { class: 'mybook-note' }, R.myNote), row);
      ta.focus();
    }
    show();
    return box;
  }
  function removeKey(key) { try { root.localStorage.removeItem('mc:' + key); } catch (e) { /* нет хранилища */ } }

  /** Нормализация для поиска: строчные, ё → е, без TeX-команд и знаков; основа слова — первые 5 букв. */
  const STOP = new Set('это эти этот этого этой что как для при или его она они оно если так также тогда только все всех всё том того тот которые который которая является являются есть будем будет может можно быть был была было где уже еще ещё под над без через между'.split(' '));
  function stems(text) {
    const words = text.toLowerCase().replace(/ё/g, 'е').replace(/\\[a-z]+/g, ' ').split(/[^\p{L}\p{N}]+/u);
    const out = new Set();
    for (const w of words) {
      if (!w || STOP.has(w)) continue;
      if (/^\p{N}+$/u.test(w)) { out.add(w); continue; }
      if (w.length < 3) continue;
      out.add(w.length > 5 ? w.slice(0, 5) : w);
    }
    return out;
  }

  function bookSearch() {
    const R = T.reader;
    const input = H('input', { type: 'search', class: 'book-search-input', placeholder: R.find, 'aria-label': R.find });
    const list = H('ol', { class: 'book-search-results' });
    const fileIn = H('input', { type: 'file', accept: 'application/json,.json', hidden: '' });
    let timer = 0;
    const run = () => {
      const q = stems(input.value);
      list.replaceChildren();
      if (input.value.trim().length < 3 || !q.size) return;
      const scored = [];
      for (const e of bookIndex) {
        const own = MC.storage.get(myKey(e.raw), '');
        const have = stems(e.raw + ' ' + own);
        let m = 0;
        q.forEach((w) => { if (have.has(w)) m += 1; });
        if (m) scored.push({ e, score: m / q.size, own });
      }
      scored.sort((a, b) => b.score - a.score);
      const top = scored.filter((x) => x.score >= Math.min(0.34, scored.length ? scored[0].score : 1)).slice(0, 6);
      if (!top.length) { list.append(H('li', { class: 'none' }, R.none)); return; }
      for (const { e, own } of top) {
        const n = e.details.querySelector('.sent-tag .n');
        const snippet = (own || e.raw).replace(/\$+/g, '').replace(/\s+/g, ' ').trim();
        const b = H('button', { type: 'button' },
          H('span', { class: 'n' }, '№ ' + (n ? n.textContent : '')),
          H('span', { class: 'pg' }, e.page ? T.reader.page(e.page) : ''),
          H('span', { class: 't' }, snippet.length > 170 ? snippet.slice(0, 170) + '…' : snippet));
        b.addEventListener('click', () => {
          showSent(e.details);
          e.details.open = true;
          e.target.scrollIntoView({ block: 'center', behavior: 'smooth' });
          e.target.classList.remove('hit'); void e.target.offsetWidth; e.target.classList.add('hit');
        });
        list.append(H('li', null, b));
      }
    };
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 150); });
    const exp = MC.ui.button(R.exp, { small: true, onclick: () => {
      const data = {};
      try {
        const pre = 'mc:book:' + lessonKey() + ':';
        for (let i = 0; i < root.localStorage.length; i++) { const k = root.localStorage.key(i); if (k.startsWith(pre)) data[k.slice(3)] = MC.storage.get(k.slice(3), ''); }
      } catch (e) { /* нет хранилища */ }
      const a = H('a', { href: URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' })), download: 'my-book-' + lessonKey() + '.json' });
      doc.body.append(a); a.click(); a.remove();
    } });
    const imp = MC.ui.button(R.imp, { small: true, onclick: () => fileIn.click() });
    fileIn.addEventListener('change', async () => {
      const f = fileIn.files[0];
      if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        let n = 0;
        for (const [k, v] of Object.entries(data)) if (/^book:[\w.-]+:[0-9a-z]+$/.test(k) && typeof v === 'string' && v) { MC.storage.set(k, v); n += 1; }
        MC.ui.toast(R.impDone(n));
        setTimeout(() => root.location.reload(), 800);
      } catch (e) { MC.ui.toast(R.none); }
      fileIn.value = '';
    });
    return H('div', { class: 'book-search' },
      book ? bookFilter() : null,
      H('p', { class: 'book-search-h' }, R.find),
      H('p', { class: 'book-search-hint' }, R.findHint),
      input, list,
      H('div', { class: 'book-search-tools' }, exp, imp, fileIn));
  }

  /* ---------- оглавление учебника (как у автора): главы › параграфы › подпараграфы со страницами ---------- */
  /**
   * opts.root — путь к корню курса; opts.current — урок, который сейчас открыт (его параграф выделен,
   * ссылки на подпараграфы ведут на якоря этой же страницы); opts.openAll — раскрыть главы с уроками.
   */
  function bookTocView(bookId, opts = {}) {
    const toc = MC.course.bookToc(bookId);
    if (!toc) return null;
    const B = T.bookToc;
    const cur = opts.current || null;
    const ready = (l) => l && l.status === 'ready';
    const href = (l, anchor) => {
      if (cur && l && l.id === cur.id) return anchor ? '#' + anchor : '#';
      return MC.course.href(l.id, opts.root || '') + (anchor ? '#' + anchor : '');
    };
    const plain = (items) => items.map((x) => H('li', { class: 'bt-par bt-plain' },
      H('div', { class: 'bt-row' }, H('span', { class: 'bt-ptitle' }, x.title), H('span', { class: 'bt-dots', 'aria-hidden': 'true' }), H('span', { class: 'bt-page' }, String(x.page)))));
    const chapters = toc.chapters.map((c) => {
      const n = c.paragraphs.length;
      const done = c.paragraphs.filter((p) => ready(p.lesson)).length;
      const here = cur && c.paragraphs.some((p) => p.lesson === cur || p.extras.includes(cur));
      const pars = c.paragraphs.map((p) => {
        const l = ready(p.lesson) ? p.lesson : null;
        const isCur = !!(cur && (p.lesson === cur || p.extras.includes(cur)));
        const title = '§ ' + p.n + '. ' + p.title;
        const tag = l
          ? H('span', { class: 'bt-tag on' }, isCur && p.lesson === cur ? B.here : B.lesson(l.id))
          : H('span', { class: 'bt-tag' }, p.lesson ? B.lesson(p.lesson.id) + ' · ' + B.soon : B.soon);
        const subs = (p.subs || []).map((x, i, arr) => {
          const text = x.title + ' (' + x.page + ')' + (i < arr.length - 1 ? '. ' : '.');
          return l && x.anchor ? H('a', { href: href(l, x.anchor) }, text) : H('span', null, text);
        });
        const extras = p.extras.filter(ready).map((e) => H('p', { class: 'bt-extra' }, B.more + ' ',
          H('a', { href: href(e) }, B.lesson(e.id) + ' «' + e.title + '»'), cur === e ? ' · ' + B.here : ''));
        return H('li', { class: 'bt-par' + (isCur ? ' current' : '') + (l ? '' : ' soon') },
          H('div', { class: 'bt-row' },
            l ? H('a', { class: 'bt-ptitle', href: href(l) }, title) : H('span', { class: 'bt-ptitle' }, title),
            H('span', { class: 'bt-dots', 'aria-hidden': 'true' }),
            H('span', { class: 'bt-page' }, String(p.page)), tag),
          subs.length ? H('p', { class: 'bt-subs' }, ...subs) : null,
          ...extras);
      });
      const open = here || (opts.openAll && done > 0);
      return H('details', { class: 'bt-ch' + (here ? ' current' : ''), open: open ? '' : null },
        H('summary', null,
          H('span', { class: 'bt-chname' }, c.name),
          H('span', { class: 'bt-chtitle' }, c.title),
          H('span', { class: 'bt-count' }, B.count(done, n))),
        H('ol', { class: 'bt-pars' }, ...pars));
    });
    return H('div', { class: 'book-toc' },
      toc.front.length ? H('ol', { class: 'bt-pars bt-front' }, ...plain(toc.front)) : null,
      ...chapters,
      toc.back.length ? H('ol', { class: 'bt-pars bt-front' }, ...plain(toc.back)) : null);
  }

  /** Урок по учебнику: свёрнутое «Оглавление учебника» над текстом, текущий параграф раскрыт и выделен. */
  function bookNav(lesson, main) {
    if (!lesson.book || MC.lang !== 'ru') return;
    const view = bookTocView(lesson.book.id, { current: lesson, root: rootPath() });
    if (!view) return;
    main.prepend(H('details', { class: 'book-nav' }, H('summary', null, T.bookToc.open), view));
  }

  /* ---------- адрес цитаты в книге: глава › параграф › подпараграф › роль · страница ---------- */
  let book = null; // {cite, chapter, paragraph, …} — из записи урока в course.js
  const TYPES = [
    ['def', /^Определение/], ['thm', /^(Теорема|Следствие|Предложение|Лемма)/], ['proof', /^Доказательство/],
    ['example', /^Пример/], ['remark', /^Замечание/], ['exercise', /^Упражнение/],
  ];
  const typeOf = (role) => (role ? (TYPES.find(([, re]) => re.test(role)) || ['text'])[0] : 'text');
  const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const cleanHead = (t) => String(t || '').replace(/\s+/g, ' ').replace(/\s+из учебника$/i, '').replace(/[.:]\s*$/, '').trim();

  /** Подпараграф книги, к которому относится цитата: ближайший p.reader-h выше в том же reader, иначе заголовок раздела. */
  function subOf(d) {
    for (let n = d.previousElementSibling; n; n = n.previousElementSibling) {
      if (n.matches('p.reader-h')) return cleanHead(n.textContent);
    }
    const sec = d.closest('section');
    const h = sec && sec.querySelector(':scope > h2');
    return h ? cleanHead(h.dataset.title || h.textContent) : '';
  }

  /** Указатель определений и теорем (раздел перед «Итогами»; строится до оглавления). */
  function bookIndexSection(main) {
    const R = T.reader;
    const sents = Array.from(main.querySelectorAll('.reader > details.sent'));
    const seen = new Set();
    const groups = { def: [], thm: [] };
    sents.forEach((d, i) => {
      const s = d.querySelector(':scope > summary');
      const role = s && s.dataset.role;
      const type = typeOf(role);
      const key = type === 'def' ? 'def' : type === 'thm' ? 'thm' : '';
      if (!key || seen.has(role)) return;
      seen.add(role);
      // в группе «Определения» — только термины: «функция», а не «Определение (функция)»
      const label = key === 'def' ? role.replace(/^Определение \((.*)\)$/, '$1').replace(/^./, (c) => c.toUpperCase()) : role;
      groups[key].push({ role, label, href: '#' + (d.id || 's' + (i + 1)), page: s.dataset.page, sub: subOf(d) });
    });
    if (!groups.def.length && !groups.thm.length) return;
    const list = (items) => H('ol', { class: 'book-index-list' }, ...items.map((x) => H('li', null,
      H('a', { href: x.href, 'data-sent': x.href.slice(1) }, x.label),
      H('span', { class: 'bi-where' }, (x.sub ? x.sub + ' · ' : '') + R.page(x.page)))));
    const sec = H('section', { id: 'book-index', class: 'book-index' },
      H('h2', null, R.index),
      H('p', null, R.indexLead),
      groups.def.length ? H('h3', null, R.indexDefs) : null, groups.def.length ? list(groups.def) : null,
      groups.thm.length ? H('h3', null, R.indexThms) : null, groups.thm.length ? list(groups.thm) : null);
    const before = main.querySelector(':scope > section#summary');
    if (before) before.before(sec); else main.append(sec);
    sec.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-sent]');
      if (!a) return;
      const d = doc.getElementById(a.dataset.sent);
      if (d) { showSent(d); d.open = true; }
    });
  }

  /** Библиографическая ссылка на место книги. */
  function citeText(page, role) {
    const R = T.reader;
    const parts = [R.chFull(book.chapter), '§ ' + book.paragraph];
    if (role) parts.push(lowerFirst(role));
    if (page) parts.push(R.pageFull(page));
    return book.cite + '. — ' + parts.join(', ') + '.';
  }

  async function copyText(t) {
    try { await root.navigator.clipboard.writeText(t); return true; } catch (e) { /* нет доступа — запасной путь */ }
    const ta = H('textarea', { style: 'position:fixed;opacity:0' });
    ta.value = t; doc.body.append(ta); ta.select();
    let ok = false;
    try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  /** Предложение скрыто фильтром — сбросить фильтр на «Всё», чтобы переход по ссылке не вёл в пустоту. */
  function showSent(d) {
    if (!d || !d.hidden) return;
    const all = doc.querySelector('.bf-chip[data-type="all"]');
    if (all) all.click(); else d.hidden = false;
  }

  /** Фильтр «Всё / Определения / Теоремы…» над текстом урока. */
  function bookFilter() {
    const R = T.reader;
    const box = H('div', { class: 'book-filter', role: 'group', 'aria-label': R.show });
    const info = H('span', { class: 'bf-info', 'aria-live': 'polite' });
    const btns = [];
    const apply = (type) => {
      const main = box.closest('main') || doc;
      const all = Array.from(main.querySelectorAll('.reader > details.sent'));
      let shown = 0;
      for (const d of all) {
        const t = d.dataset.type || 'text';
        const on = type === 'all' || t === type;
        d.hidden = !on;
        if (on) shown += 1;
      }
      main.classList.toggle('book-filtered', type !== 'all');
      info.textContent = type === 'all' ? '' : R.shown(shown, all.length);
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === type)));
    };
    for (const type of ['all', 'def', 'thm', 'proof', 'example', 'exercise']) {
      const b = H('button', { type: 'button', class: 'bf-chip', 'data-type': type, 'aria-pressed': String(type === 'all') }, R.types[type]);
      b.addEventListener('click', () => apply(type));
      btns.push(b);
      box.append(b);
    }
    box.append(info);
    return box;
  }

  function reader(el) {
    const R = T.reader;
    for (const s of el.querySelectorAll(':scope > details.sent > summary')) {
      if (s.querySelector(':scope > .sent-tag')) continue;
      sentNo += 1;
      const d = s.parentElement;
      const kind = s.dataset.kind === 'quote' ? 'quote' : 'retell';
      d.classList.add(kind);
      d.id = d.id || 's' + sentNo;
      bookIndex.push({ details: d, target: d, raw: s.textContent, page: s.dataset.page });
      for (const r of d.querySelectorAll(':scope > .sent-body > .retold')) {
        const t = r.querySelector(':scope > .retold-t');
        if (!t) continue;
        const pg = (r.querySelector(':scope > .retold-h') || {}).textContent || '';
        const m = pg.match(/\d+(?:[–-]\d+)?/);
        bookIndex.push({ details: d, target: r, raw: t.textContent, page: m ? m[0] : '' });
        t.after(myBook(t.textContent));
      }
      const role = s.dataset.role || '';
      const type = typeOf(role);
      d.dataset.type = type;
      let tag;
      if (book && kind === 'quote') {
        const sub = subOf(d);
        const crumb = [[R.ch(book.chapter), 'c-wide'], [R.par(book.paragraph), ''], [sub, 'c-wide'], [role || R.text, role ? 'c-role' : 'c-text']].filter(([t]) => t);
        const parts = [];
        crumb.forEach(([t, c], i) => {
          if (i) parts.push(H('span', { class: 'c-sep' + (crumb[i - 1][1] === 'c-wide' ? ' c-wide' : ''), 'aria-hidden': 'true' }, ' › '));
          parts.push(H('span', { class: c || null }, t));
        });
        if (s.dataset.page) parts.push(H('span', { class: 'c-page' }, ' · ' + R.page(s.dataset.page)));
        tag = H('span', { class: 'sent-tag' }, H('span', { class: 'n' }, String(sentNo)), H('span', { class: 'crumb' }, ...parts));
        d.dataset.address = [R.ch(book.chapter), R.par(book.paragraph), sub, role].filter(Boolean).join(' › ') + (s.dataset.page ? ' · ' + R.page(s.dataset.page) : '');
        const body = d.querySelector(':scope > .sent-body');
        if (body) {
          const ref = citeText(s.dataset.page, role);
          const b = MC.ui.button(R.cite, { small: true, title: R.citeTitle });
          b.addEventListener('click', async () => { if (await copyText(ref)) MC.ui.toast(R.citeDone); });
          body.prepend(H('div', { class: 'sent-cite' }, H('span', { class: 'sent-ref' }, ref), b));
        }
      } else {
        tag = H('span', { class: 'sent-tag' }, H('span', { class: 'n' }, String(sentNo)), R[kind] + (s.dataset.page ? ' · ' + R.page(s.dataset.page) : ''));
      }
      const text = H('span', { class: 'sent-text' });
      while (s.firstChild) text.appendChild(s.firstChild);
      s.append(tag, text);
    }
    const items = () => Array.from(el.querySelectorAll(':scope > details.sent'));
    const btn = (label, open) => {
      const b = MC.ui.button(label, { small: true });
      b.addEventListener('click', () => items().forEach((d) => (d.open = open)));
      return b;
    };
    el.prepend(H('div', { class: 'reader-bar' }, H('span', null, R.hint), btn(R.open, true), btn(R.close, false)));
    if (!bookSearchMade) {
      bookSearchMade = true;
      el.before(bookSearch());
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

    book = lesson.book && MC.course.books && MC.course.books[lesson.book.id] ? Object.assign({}, MC.course.books[lesson.book.id], lesson.book) : null;
    if (book) bookIndexSection(main);
    bookNav(lesson, main);
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

    main.querySelectorAll('.reader').forEach(reader);
    if (!main.querySelector('.mybook')) main.querySelectorAll('.book-search-tools').forEach((t) => t.remove());
    main.querySelectorAll('.quiz').forEach(quiz);
    MC.math.render(doc.body);
    mountWidgets(main);
    main.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#s"]');
      const d = a && doc.getElementById(a.getAttribute('href').slice(1));
      if (d && d.matches('details.sent')) { showSent(d); d.open = true; }
    });
    if (root.location.hash) {
      const target = doc.getElementById(decodeURIComponent(root.location.hash.slice(1)));
      if (target) setTimeout(() => target.scrollIntoView(), 50);
    }
    MC.bus.emit('pageready', { lesson, main });
  }

  MC.page = { init, header, footer, wireHeader, brandMark, themeButton, langSwitch, mountWidgets, rootPath, LEVELS, bookToc: bookTocView };
})(typeof window !== 'undefined' ? window : globalThis);
