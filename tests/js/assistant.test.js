// Тесты ИИ-наставника: разбор Markdown и чистая логика запроса. node --test "tests/js/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const JS = path.resolve(__dirname, '..', '..', 'assets', 'js');
for (const f of ['core.js', 'markdown.js', 'assistant.js']) require(path.join(JS, f));
const { md } = globalThis.MC;
const A = globalThis.MC.assistant._pure;
const types = (nodes) => nodes.map((n) => n.t);

test('Markdown: формулы не ломаются разметкой, «$5 и $7» — не формула', () => {
  const [p] = md.parse('Шаг $F_m = F_{m-1} + \\nu h_m$ и my_var_name стоят $5 и $7, а *курсив* и **жирный** работают.');
  const math = p.c.filter((n) => n.t === 'math');
  assert.equal(math.length, 1);
  assert.equal(math[0].v, 'F_m = F_{m-1} + \\nu h_m');
  assert.equal(math[0].display, false);
  assert.ok(p.c.some((n) => n.t === 'text' && n.v.includes('my_var_name стоят $5 и $7')));
  assert.deepEqual(types(p.c.filter((n) => n.t === 'em' || n.t === 'strong')), ['em', 'strong']);
});

test('Markdown: выключные формулы $$…$$ и \\[…\\], строчные \\(…\\)', () => {
  const ast = md.parse('До\n\n$$\nL = \\sum_i (y_i - F)^2\n$$\n\n\\[ a^2 \\]\n\nи \\(x_i\\) в строке');
  assert.deepEqual(types(ast), ['p', 'mathblock', 'mathblock', 'p']);
  assert.equal(ast[1].v, 'L = \\sum_i (y_i - F)^2');
  assert.equal(ast[2].v, 'a^2');
  assert.deepEqual(ast[3].c.find((n) => n.t === 'math'), { t: 'math', v: 'x_i', display: false });
});

test('Markdown: списки с вложенностью, код, таблица, заголовок, цитата', () => {
  const ast = md.parse(['## Итог', '1. один', '   - вложенный', '2. два', '', '```python', 'x = 1  # **не жирный**', '```', '', '| a | b |', '|---|--:|', '| 1 | 2 |', '', '> цитата'].join('\n'));
  assert.deepEqual(types(ast), ['h', 'list', 'codeblock', 'table', 'quote']);
  assert.equal(ast[1].ordered, true);
  assert.equal(ast[1].items.length, 2);
  assert.equal(ast[1].items[0][1].t, 'list');
  assert.equal(ast[2].lang, 'python');
  assert.equal(ast[2].v, 'x = 1  # **не жирный**');
  assert.deepEqual(ast[3].align, [null, 'right']);
  assert.equal(ast[3].rows.length, 1);
});

test('Markdown: поток — незакрытые блок кода и формула не теряют текст', () => {
  const code = md.parse('Смотрите:\n```python\nfor m in range(3):');
  assert.equal(code[1].t, 'codeblock');
  assert.equal(code[1].v, 'for m in range(3):');
  const math = md.parse('Формула:\n$$\nF_m = F_{m-1}');
  assert.equal(math[1].t, 'p');
  assert.ok(math[1].c[0].v.includes('F_m = F_{m-1}'));
  assert.equal(md.parse('цена $x_i').length, 1);
});

test('Markdown: ссылки — только http(s); HTML остаётся текстом', () => {
  const [p] = md.parse('[курс](https://example.org/a) и [зло](javascript:alert(1)) <img src=x onerror=1>');
  const links = p.c.filter((n) => n.t === 'link');
  assert.equal(links.length, 1);
  assert.equal(links[0].href, 'https://example.org/a');
  assert.ok(p.c.some((n) => n.t === 'text' && n.v.includes('<img src=x onerror=1>')));
  assert.ok(!JSON.stringify(p).includes('javascript:'));
});

test('SSE: события собираются из произвольно нарезанных кусков', () => {
  const events = [];
  const p = A.sseParser((e) => events.push(e));
  const raw = 'data: {"choices":[{"delta":{"content":"При"}}]}\n\ndata: {"choices":[{"delta":{"reasoning_tokens":7}}]}\r\n\r\ndata: {"error":{"message":"сбой"}}\n\ndata: [DONE]\n\n';
  for (let i = 0; i < raw.length; i += 5) p.feed(raw.slice(i, i + 5));
  p.end();
  assert.equal(events.length, 4);
  assert.equal(events[0].choices[0].delta.content, 'При');
  assert.equal(events[1].choices[0].delta.reasoning_tokens, 7);
  assert.equal(events[2].error.message, 'сбой');
  assert.equal(events[3], '[DONE]');
});

test('clip: окно вокруг выделенного фрагмента; tidy: пробелы и пустые строки', () => {
  const text = 'а'.repeat(5000) + ' КЛЮЧЕВОЕ МЕСТО ' + 'б'.repeat(5000);
  const c = A.clip(text, 1000, 'КЛЮЧЕВОЕ МЕСТО');
  assert.ok(c.length <= 1002 && c.includes('КЛЮЧЕВОЕ МЕСТО') && c.startsWith('…') && c.endsWith('…'));
  assert.equal(A.clip('коротко', 100), 'коротко');
  assert.equal(A.tidy('  a \u00a0 b \n\n\n\n c  '), 'a b\n\nc');
});

const LESSON = { number: '2.2', title: 'Производная', part: 'II «Анализ: изменение»', summary: 'Наклон секущей и предел', objectives: ['вычислить производную по определению'], outline: ['Зачем', 'Данные'] };

test('buildMessages: урок — в системном сообщении, фрагмент и раздел — в вопросе', () => {
  const m = A.buildMessages(LESSON, [{ role: 'user', text: 'Почему так?', quote: 'остаток $r_i$', section: 'Данные', context: 'Текст раздела про остаток $r_i$ и дерево.' }]);
  assert.deepEqual(m.map((x) => x.role), ['system', 'user']);
  assert.ok(m[0].content.includes('Урок 2.2 «Производная» (часть курса: II «Анализ: изменение»)') && m[0].content.includes('Разделы урока: Зачем → Данные'));
  assert.ok(m[1].content.includes('Выделенный фрагмент урока (раздел «Данные»):\n«остаток $r_i$»'));
  assert.ok(m[1].content.includes('Текст раздела для контекста') && m[1].content.endsWith('Вопрос ученика: Почему так?'));
});

test('buildMessages: история без текста разделов, ошибочные ответы пропускаются', () => {
  const turns = [
    { role: 'user', text: 'Первый', quote: 'фрагмент', section: 'Данные', context: 'ДЛИННЫЙ КОНТЕКСТ' },
    { role: 'assistant', text: 'Ответ 1' },
    { role: 'user', text: 'Второй' },
    { role: 'assistant', text: '', error: 'сбой' },
    { role: 'user', text: 'Третий', section: 'Итоги', context: 'Текст итогов' },
  ];
  const m = A.buildMessages(LESSON, turns);
  assert.deepEqual(m.map((x) => x.role), ['system', 'user', 'assistant', 'user', 'user']);
  assert.ok(!m[1].content.includes('ДЛИННЫЙ КОНТЕКСТ') && m[1].content.includes('«фрагмент»'));
  assert.ok(m[4].content.includes('Ученик сейчас читает раздел «Итоги»') && m[4].content.includes('Текст итогов'));
});

test('buildMessages: запрос всегда укладывается в лимит командной строки', () => {
  const big = 'слово '.repeat(20000);
  const turns = [];
  for (let i = 0; i < 30; i++) turns.push({ role: 'user', text: 'вопрос ' + i + ' ' + big.slice(0, 3000), quote: big, section: 'Раздел', context: big }, { role: 'assistant', text: big });
  turns.push({ role: 'user', text: big, quote: big, section: 'Раздел', context: big });
  const m = A.buildMessages(Object.assign({}, LESSON, { summary: big, objectives: [big] }), turns);
  const size = m.reduce((s, x) => s + x.content.length, 0);
  assert.ok(size <= A.LIMITS.total, 'размер ' + size);
  assert.equal(m[0].role, 'system');
  assert.equal(m[m.length - 1].role, 'user');
  assert.ok(m.length < 2 || m[1].role === 'user');
});

test('normalizeUrl: только http(s), без хвостовых / и /v1', () => {
  assert.equal(A.normalizeUrl(' http://127.0.0.1:8137/ '), 'http://127.0.0.1:8137');
  assert.equal(A.normalizeUrl('http://localhost:8137/v1'), 'http://localhost:8137');
  assert.equal(A.normalizeUrl('ftp://x'), null);
  assert.equal(A.normalizeUrl('javascript:alert(1)'), null);
  assert.equal(A.normalizeUrl(''), null);
});

test('скриншот: уходит только с последним вопросом, в истории — пометка', () => {
  const img = 'data:image/png;base64,AAAA';
  const m = A.buildMessages(LESSON, [
    { role: 'user', text: 'Что на графике?', image: img, section: 'Данные' },
    { role: 'assistant', text: 'Кривая ошибки.' },
    { role: 'user', text: 'А здесь?', image: img, section: 'Данные', context: 'Текст раздела' },
  ]);
  assert.equal(typeof m[1].content, 'string');
  assert.ok(m[1].content.includes('прикладывал скриншот') && !m[1].content.includes('base64'));
  const last = m[m.length - 1].content;
  assert.ok(Array.isArray(last) && last.length === 2);
  assert.ok(last[0].type === 'text' && last[0].text.includes('К вопросу приложен скриншот') && last[0].text.includes('Вопрос ученика: А здесь?'));
  assert.deepEqual(last[1], { type: 'image_url', image_url: { url: img } });
  // после перезагрузки картинки нет (hadImage) — запрос остаётся текстовым
  const again = A.buildMessages(LESSON, [{ role: 'user', text: 'Что тут?', hadImage: true }]);
  assert.equal(typeof again[1].content, 'string');
  assert.ok(again[1].content.includes('прикладывал скриншот'));
});

test('скриншот: область вырезается с учётом масштаба кадра и не выходит за его края', () => {
  assert.deepEqual(A.cropRect({ x: 100, y: 200, w: 300, h: 200 }, { w: 1440, h: 900 }, { w: 2160, h: 1350 }), { x: 150, y: 300, w: 450, h: 300 });
  assert.deepEqual(A.cropRect({ x: 1400, y: 880, w: 500, h: 500 }, { w: 1440, h: 900 }, { w: 1440, h: 900 }), { x: 1400, y: 880, w: 40, h: 20 });
  assert.deepEqual(A.cropRect({ x: -50, y: -10, w: 0, h: 0 }, { w: 100, h: 100 }, { w: 100, h: 100 }), { x: 0, y: 0, w: 1, h: 1 });
  assert.deepEqual(A.fitSize(3136, 1000, 1568), { w: 1568, h: 500 });
  assert.deepEqual(A.fitSize(800, 600, 1568), { w: 800, h: 600 });
});

test('задача урока: в запросе помечена как задача, системные правила требуют подсказку, а не решение', () => {
  const m = A.buildMessages(LESSON, [{ role: 'user', text: 'Дайте подсказку, не решение', quote: 'Найдите $(x^3)\'$ по определению.', section: 'Задача 1', kind: 'exercise', context: 'Задачи' }]);
  assert.ok(m[1].content.startsWith('Задача из урока (раздел «Задача 1»):'));
  assert.ok(A.SYSTEM_PROMPT.includes('сначала дай подсказку'));
  assert.ok(A.SYSTEM_PROMPT.includes('«Математика по косточкам»'));
});
