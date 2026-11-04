// Тесты трёх языков курса: ru (основной), en, uz. Переводы программы и интерфейса полны,
// переведённые страницы уроков совпадают с русскими по структуре (id, рисунки, формулы, ответы
// тестов), числа в интерфейсе — по правилам языка. node --test "tests/js/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
for (const f of ['core.js', 'course.js', 'assistant.js']) require(path.join(ROOT, 'assets', 'js', f));
const MC = globalThis.MC;
const { course } = MC;
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const LANGS = ['en', 'uz'];
const ready = course.ready();
const keys = (o) => Object.keys(o).sort();

test('программа: у каждой части и каждого урока есть перевод; у готовых — подзаголовок и все цели', () => {
  for (const L of LANGS) {
    const tr = course.translations[L];
    assert.ok(tr.course.title && tr.course.subtitle, L + ': название курса');
    for (const p of course.parts) assert.ok(tr.parts[p.id] && tr.parts[p.id].title && tr.parts[p.id].summary, L + ': часть ' + p.id);
    for (const l of course.lessons) {
      const t = tr.lessons[l.id];
      assert.ok(t && t.title && t.summary, L + ': урок ' + l.id);
      if (l.status === 'ready') {
        assert.ok(t.subtitle && t.short, L + ': подзаголовок урока ' + l.id);
        assert.equal((t.objectives || []).length, l.objectives.length, L + ': цели урока ' + l.id);
        const dollars = (s) => (s.match(/\$/g) || []).length;
        t.objectives.forEach((o, i) => assert.equal(dollars(o), dollars(l.objectives[i]), L + ': формулы в цели ' + (i + 1) + ' урока ' + l.id));
      }
    }
    assert.deepEqual(Object.keys(tr.lessons).sort(), course.lessons.map((l) => l.id).sort(), L + ': лишние уроки в переводе');
  }
});

test('интерфейс: тексты каркаса и ИИ-наставника есть на всех языках с теми же ключами', () => {
  const S = MC.i18n.strings;
  for (const L of LANGS) {
    assert.deepEqual(keys(S[L]), keys(S.ru), 'MC.T: ' + L);
    assert.deepEqual(keys(S[L].env), keys(S.ru.env), 'MC.T.env: ' + L);
    const P = MC.assistant._pure.PROMPT;
    assert.deepEqual(keys(P[L]), keys(P.ru), 'подсказка наставника: ' + L);
  }
});

test('числа: запятая в ru и uz, точка в en; координаты (1; 2) и (1, 2); счёт со словом', () => {
  const was = MC.lang;
  try {
    MC.lang = 'en';
    assert.equal(MC.util.fmt(-2.5), '−2.5');
    assert.equal(MC.util.pt(1, -0.5), '(1, −0.5)');
    assert.equal(MC.i18n.count(1, { en: ['lesson', 'lessons'] }), '1 lesson');
    MC.lang = 'uz';
    assert.equal(MC.util.fmt(-2.5), '−2,5');
    assert.equal(MC.util.pt(1, -0.5), '(1; −0,5)');
    assert.equal(MC.i18n.count(3, { uz: 'dars' }), '3 dars');
  } finally {
    MC.lang = was;
  }
  assert.equal(MC.util.fmt(2.5), '2,5');
  assert.equal(course.href('7.3', '../', 'uz'), '../uz/lessons/lesson_7_3/index.html');
  assert.equal(course.home('', 'en'), 'en/index.html');
});

test('наставник: запрос на языке страницы — системное сообщение, подписи контекста, главная страница', () => {
  const A = MC.assistant._pure;
  const turn = [{ role: 'user', text: 'Why?', quote: 'slope', section: 'Secant', context: 'text' }];
  const en = A.buildMessages({ number: '2.2', title: 'The derivative', part: 'II “Calculus: change”' }, turn, 'en');
  assert.ok(en[0].content.includes('“Math, bone by bone”') && en[0].content.includes('Lesson 2.2 “The derivative” (course part: II “Calculus: change”)'));
  assert.ok(en[1].content.startsWith('Selected fragment of the lesson (section “Secant”):\n“slope”') && en[1].content.endsWith('Student’s question: Why?'));
  const uz = A.buildMessages({ home: true, title: 'Matematika: mayda detallarigacha', program: ['VII «Kulikov bo‘yicha algebra»: 7.3 Kongruensiya*'] }, [{ role: 'user', text: 'Qaysi darsdan boshlay?' }], 'uz');
  assert.ok(uz[0].content.includes('kursining bosh sahifasi') && uz[0].content.includes('7.3 Kongruensiya*'));
  assert.ok(uz[1].content.endsWith('O‘quvchining savoli: Qaysi darsdan boshlay?'));
});

/* ------------------------------ переведённые страницы ------------------------------ */
const attrs = (html, name) => Array.from(html.matchAll(new RegExp('\\s' + name + '="([^"]*)"', 'g')), (m) => m[1]);
const quizzes = (html) => Array.from(html.matchAll(/<div class="quiz"[^>]*>\s*<script type="application\/json">([\s\S]*?)<\/script>/g), (m) => JSON.parse(m[1]));
const dollars = (html) => (html.replace(/<script[\s\S]*?<\/script>/g, '').match(/(?<!\\)\$/g) || []).length;

test('главные страницы en/ и uz/: язык, перевод без кириллицы, тот же каркас', () => {
  const ru = read('index.html');
  for (const L of LANGS) {
    const html = read(L + '/index.html');
    assert.ok(html.includes('<html lang="' + L + '">') && html.includes('data-root="../"'), L + ': lang и data-root');
    assert.deepEqual(attrs(html, 'id'), attrs(ru, 'id'), L + ': id главной');
    assert.ok(!/[А-Яа-яЁё]/.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), L + ': кириллица на главной');
  }
});

test('уроки en/ и uz/: есть для каждого готового урока и совпадают с русскими по структуре', () => {
  for (const l of ready) {
    const ru = read('lessons/' + l.folder + '/index.html');
    for (const L of LANGS) {
      const rel = L + '/lessons/' + l.folder + '/index.html';
      assert.ok(fs.existsSync(path.join(ROOT, rel)), 'нет перевода ' + rel);
      const html = read(rel);
      const where = rel + ': ';
      assert.ok(html.includes('<html lang="' + L + '" data-lesson="' + l.id + '">'), where + 'lang и data-lesson');
      assert.ok(html.includes('data-root="../../../"'), where + 'data-root');
      for (const s of ((/data-scripts="([^"]*)"/.exec(html) || [])[1] || '').split(',').map((x) => x.trim()).filter(Boolean)) {
        assert.ok(fs.existsSync(path.join(ROOT, L, 'lessons', l.folder, s)), where + 'нет скрипта ' + s);
      }
      for (const a of ['id', 'data-widget', 'data-config', 'data-lesson', 'data-stars']) assert.deepEqual(attrs(html, a), attrs(ru, a), where + a);
      assert.equal(dollars(html), dollars(ru), where + 'число $ (формулы)');
      const qa = quizzes(html);
      const qr = quizzes(ru);
      assert.equal(qa.length, qr.length, where + 'тесты');
      qa.forEach((q, i) => q.forEach((x, j) => {
        assert.deepEqual(x.answer, qr[i][j].answer, where + 'ответ вопроса ' + (j + 1));
        assert.equal(x.options.length, qr[i][j].options.length, where + 'варианты вопроса ' + (j + 1));
      }));
      assert.ok(!/[А-Яа-яЁё]/.test(html.replace(/<script[\s\S]*?<\/script>/g, '')), where + 'кириллица в переводе');
    }
  }
  for (const L of LANGS) {
    for (const dir of fs.readdirSync(path.join(ROOT, L, 'lessons'))) assert.ok(ready.some((l) => l.folder === dir), L + '/lessons/' + dir + ': урок не отмечен в course.js как готовый');
  }
});
