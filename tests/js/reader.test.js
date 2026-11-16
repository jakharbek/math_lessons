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
      const sm = s.match(/<summary data-kind="(\w+)" data-page="([^"]*)">([\s\S]*?)<\/summary>/);
      assert.ok(sm, `№ ${n}: нет summary с data-kind и data-page`);
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
