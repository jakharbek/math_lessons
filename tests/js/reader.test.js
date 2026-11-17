// Уроки-чтения учебника (<div class="reader">): формальные правила цитирования из CLAUDE.md
// «Цитирование учебников». Посимвольную сверку со сканом тест не заменяет. node --test "tests/js/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const dir = path.join(ROOT, 'lessons');
const pages = fs.readdirSync(dir)
  .map((d) => path.join('lessons', d, 'index.html'))
  .filter((p) => fs.existsSync(path.join(ROOT, p)) && fs.readFileSync(path.join(ROOT, p), 'utf8').includes('class="reader"'));

/** Словарь ролей цитат (CLAUDE.md «Цитирование учебников»). */
const ROLE = /^(Определение \([^()]+\)|(Теорема|Следствие|Предложение|Лемма|Свойство)( \d+(\.\d+)*)?|Доказательство (теоремы|следствия|предложения|леммы|свойства)( \d+(\.\d+)*)?|Пример( \d+)?|Замечание|Упражнение \d+( \([a-zа-я\d]\))?)$/;

/** Все <details class="sent">…</details> верхнего уровня (вложенные details считаются). */
function sentences(html) {
  const out = [];
  const re = /<details class="sent"[^>]*>/g;
  let m;
  while ((m = re.exec(html))) {
    let depth = 0;
    const tag = /<details\b|<\/details>/g;
    tag.lastIndex = m.index;
    let t;
    while ((t = tag.exec(html))) {
      depth += t[0] === '<details' ? 1 : -1;
      if (depth === 0) break;
    }
    out.push(html.slice(m.index, tag.lastIndex));
    re.lastIndex = tag.lastIndex;
  }
  return out;
}

test('уроки-чтения найдены', () => assert.ok(pages.length >= 6, pages.join(', ')));

for (const p of pages) {
  test(p + ': каждое предложение — цитата со страницей и непустым разбором', () => {
    const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const list = sentences(html);
    assert.ok(list.length > 0);
    list.forEach((s, i) => {
      const n = i + 1;
      const sm = s.match(/<summary data-kind="(\w+)" data-page="([^"]*)"(?: data-role="([^"]*)")?>([\s\S]*?)<\/summary>/);
      assert.ok(sm, `№ ${n}: нет summary с data-kind, data-page (и необязательным data-role)`);
      const role = sm[3];
      sm.splice(3, 1);
      if (role !== undefined) assert.match(role, ROLE, `№ ${n}: роль «${role}» не по словарю CLAUDE.md`);
      const plain = sm[3].replace(/<[^>]+>/g, '').trim();
      const head = (re, want) => { if (re.test(plain)) assert.ok(role && want.test(role), `№ ${n}: «${plain.slice(0, 30)}…» — ожидалась роль ${want}, стоит «${role || ''}»`); };
      head(/^ОПРЕДЕЛЕНИЕ\./, /^Определение/);
      head(/^(ТЕОРЕМА|Т\s?е\s?о\s?р\s?е\s?м\s?а)\s*\d+(\.\d+)*\.(?!\d)/, /^Теорема \d/); // «Теорема 3.5 следует из…» — не формулировка
      head(/^(СЛЕДСТВИЕ|Следствие)\s*\d+(\.\d+)*\.(?!\d)/, /^Следствие \d/);
      head(/^Доказательство\./, /^Доказательство /);
      assert.equal(sm[1], 'quote', `№ ${n}: не цитата (${sm[1]})`);
      assert.match(sm[2], /^\d+(–\d+)?$/, `№ ${n}: data-page «${sm[2]}»`);
      const text = sm[3].replace(/<[^>]+>/g, '').trim();
      assert.ok(text.length > 0, `№ ${n}: пустая цитата`);
      assert.ok(!/…|\.\.\./.test(sm[3].replace(/\\ldots|\\dots|\\cdots/g, '')) || /\$/.test(sm[3]), `№ ${n}: многоточие в цитате (сокращение?)`);
      assert.ok(!/^(Автор|Далее автор|Здесь автор|Куликов)/.test(text), `№ ${n}: пересказ вместо цитаты: «${text.slice(0, 40)}»`);
      assert.ok(!/<(div|a|details)\b/.test(sm[3]), `№ ${n}: в summary разметка блока или ссылка`);
      const body = s.slice(s.indexOf('</summary>'));
      assert.match(body, /<div class="sent-body">\s*\S/, `№ ${n}: нет разбора (.sent-body пустой)`);
    });
    assert.ok(!html.includes('class="retold"'), 'остались блоки .retold — весь текст должен быть цитатами');
  });

  test(p + ': ссылки «№ N» ведут на существующие предложения и совпадают с номером', () => {
    const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const list = sentences(html);
    for (const m of html.matchAll(/<a href="#s(\d+)">№&nbsp;(\d+)/g)) {
      const n = +m[1];
      assert.equal(m[1], m[2], `ссылка #s${n} подписана «№ ${m[2]}»`);
      assert.ok(n >= 1 && n <= list.length, `ссылка #s${n} за пределами 1…${list.length}`);
      assert.ok(!/^<details class="sent" id=/.test(list[n - 1]), `у предложения № ${n} свой id — ссылка #s${n} не сработает`);
    }
  });

  test(p + ': во вводной части указан источник (автор, название, год)', () => {
    const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
    const head = html.slice(0, html.indexOf('class="reader"'));
    assert.match(head, /Куликов/);
    assert.match(head, /«Алгебра и теория чисел»/);
    assert.match(head, /1979/);
  });
}

// Оглавление учебника (MC.course.books.*.toc) и привязка уроков: CLAUDE.md «Адрес цитаты», AGENTS.md §3а.
test('оглавление учебника: страницы не убывают, уроки привязаны к существующим параграфам, якоря ведут на разделы уроков', () => {
  for (const f of ['core.js', 'course.js']) require(path.join(ROOT, 'assets', 'js', f));
  const { course } = globalThis.MC;
  for (const [id, b] of Object.entries(course.books)) {
    assert.ok(b.toc, id + ': нет toc');
    let last = 0;
    for (const c of b.toc.chapters) {
      c.paragraphs.forEach((p, i) => {
        assert.equal(p.n, i + 1, `${id}: гл. ${c.n}, номера параграфов подряд`);
        assert.ok(p.page >= last, `${id}: гл. ${c.n} § ${p.n}: страница ${p.page} < ${last}`);
        last = p.page;
        let sl = p.page;
        for (const s of p.subs) {
          assert.ok(s.page >= sl, `${id}: гл. ${c.n} § ${p.n} «${s.title}»: страница убывает`);
          sl = s.page;
        }
      });
    }
    const toc = course.bookToc(id);
    for (const l of course.lessons.filter((x) => x.book && x.book.id === id)) {
      const ch = toc.chapters.find((c) => c.n === l.book.chapter);
      const par = ch && ch.paragraphs.find((p) => p.n === l.book.paragraph);
      assert.ok(par, `урок ${l.id}: нет гл. ${l.book.chapter} § ${l.book.paragraph} в оглавлении`);
      if (l.book.sub) assert.ok(par.subs.some((s) => s.title === l.book.sub), `урок ${l.id}: нет подпараграфа «${l.book.sub}»`);
      if (l.status !== 'ready' || l.book.sub) continue;
      const html = fs.readFileSync(path.join(ROOT, 'lessons', l.folder, 'index.html'), 'utf8');
      const ids = new Set([...html.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]));
      for (const s of par.subs) {
        assert.ok(s.anchor, `урок ${l.id}: у подпараграфа «${s.title}» нет anchor`);
        assert.ok(ids.has(s.anchor), `урок ${l.id}: нет раздела #${s.anchor} для «${s.title}»`);
      }
    }
  }
});
