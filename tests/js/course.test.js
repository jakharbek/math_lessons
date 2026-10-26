// Тесты структуры курса: программа, файлы уроков, ссылки, нумерация формул, тесты «Проверь себя»,
// утилиты ядра. node --test "tests/js/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
for (const f of ['core.js', 'course.js']) require(path.join(ROOT, 'assets', 'js', f));
const { course, util } = globalThis.MC;
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const ready = course.ready();
const pageOf = (l) => 'lessons/' + l.folder + '/index.html';

test('программа: id уникальны, у части есть уроки, номера уроков соответствуют частям', () => {
  const ids = course.lessons.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length);
  course.parts.forEach((p, pi) => {
    assert.ok(p.lessons.length > 0, 'пустая часть ' + p.id);
    p.lessons.forEach((l, li) => assert.equal(l.id, pi + 1 + '.' + (li + 1), 'номер урока ' + l.id + ' в части ' + p.id));
  });
  assert.ok(ready.length >= 1);
});

test('готовые уроки: страница существует, data-lesson совпадает, есть цели и подзаголовок', () => {
  for (const l of ready) {
    const html = read(pageOf(l));
    assert.ok(html.includes('data-lesson="' + l.id + '"'), l.id + ': data-lesson');
    assert.ok(/<main class="lesson"/.test(html), l.id + ': <main class="lesson">');
    assert.ok(l.subtitle && (l.objectives || []).length >= 2, l.id + ': подзаголовок и цели');
    const scripts = (/data-scripts="([^"]*)"/.exec(html) || [])[1] || '';
    for (const s of scripts.split(',').map((x) => x.trim()).filter(Boolean)) {
      assert.ok(fs.existsSync(path.join(ROOT, 'lessons', l.folder, s)), l.id + ': нет ' + s);
    }
  }
  // папки уроков без записи в программе — ошибка
  for (const dir of fs.readdirSync(path.join(ROOT, 'lessons'))) {
    assert.ok(ready.some((l) => l.folder === dir), 'папка ' + dir + ' не отмечена в course.js как готовая');
  }
});

test('уроки: ссылки на уроки и формулы ведут на существующие цели, id разделов уникальны', () => {
  for (const l of ready) {
    const html = read(pageOf(l));
    for (const m of html.matchAll(/data-lesson="([\d.]+)"/g)) assert.ok(course.byId(m[1]), l.id + ': нет урока ' + m[1]);
    const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g), (m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, l.id + ': повторяющиеся id');
    for (const m of html.matchAll(/class="eq-ref" href="#([^"]+)"/g)) {
      assert.ok(new RegExp('class="eq[^"]*" id="' + m[1] + '"').test(html), l.id + ': ссылка на несуществующую формулу ' + m[1]);
    }
    const sections = Array.from(html.matchAll(/<section id="([^"]+)"/g), (m) => m[1]);
    assert.ok(sections.includes('summary') && sections.includes('quiz'), l.id + ': нужны «Итоги» и «Проверь себя»');
    // формулы: $ парные в каждом абзаце-строке (грубая проверка опечаток)
    const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/\$\$[\s\S]*?\$\$/g, '');
    const dollars = (text.match(/(?<!\\)\$/g) || []).length;
    assert.equal(dollars % 2, 0, l.id + ': непарный $ в тексте');
  }
});

test('тесты «Проверь себя»: корректный JSON, ответ — существующий вариант, есть пояснение', () => {
  for (const l of ready) {
    const html = read(pageOf(l));
    const blocks = Array.from(html.matchAll(/<div class="quiz"[^>]*>\s*<script type="application\/json">([\s\S]*?)<\/script>/g), (m) => m[1]);
    assert.ok(blocks.length >= 1, l.id + ': нет теста');
    for (const b of blocks) {
      const qs = JSON.parse(b);
      assert.ok(qs.length >= 3, l.id + ': в тесте меньше трёх вопросов');
      for (const q of qs) {
        const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
        assert.ok(q.q && q.explain && q.options.length >= 2, l.id + ': неполный вопрос');
        ans.forEach((a) => assert.ok(Number.isInteger(a) && a >= 0 && a < q.options.length, l.id + ': ответ вне вариантов в «' + q.q + '»'));
      }
    }
  }
});

test('ядро: числа в интерфейсе — с десятичной запятой и настоящим минусом', () => {
  assert.equal(util.fmt(2.5), '2,5');
  assert.equal(util.fmt(-0.125, 3), '−0,125');
  assert.equal(util.fmt(3), '3');
  assert.equal(util.fixed(1.6e-8, 3), '0,000');
  assert.equal(util.fixed(-0.531, 3), '−0,531');
  assert.equal(util.plural(1, 'урок', 'урока', 'уроков'), '1 урок');
  assert.equal(util.plural(3, 'урок', 'урока', 'уроков'), '3 урока');
  assert.equal(util.plural(11, 'урок', 'урока', 'уроков'), '11 уроков');
  assert.equal(util.plural(22, 'урок', 'урока', 'уроков'), '22 урока');
});

test('соседние уроки — только готовые, по порядку программы', () => {
  const nb = course.neighbours(ready[0].id);
  assert.equal(nb.prev, null);
  if (ready.length > 1) assert.equal(nb.next.id, ready[1].id);
  assert.equal(course.href('2.2', '../../'), '../../lessons/lesson_2_2/index.html');
});
