#!/usr/bin/env node
/**
 * Сквозная проверка ИИ-наставника в браузере с подставным сервером (к Claude не обращается):
 * выделение текста → «Спросить ИИ» → вопрос → потоковый ответ с формулами; кнопка «Подсказка»
 * у задачи; новый диалог; что именно ушло на сервер (урок, раздел, фрагмент в TeX).
 *
 *   node tools/qa_assistant.mjs [--shots out/] [--katex-dir path/katex] [--theme dark]
 *
 * Нужен пакет playwright.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const shots = opt('--shots');
const katexDir = opt('--katex-dir');
const theme = opt('--theme') || 'light';

const ANSWER = [
  'Наклон секущей — это **средняя скорость** на отрезке длиной $h$:',
  '',
  '$$\\frac{f(x_0+h)-f(x_0)}{h}.$$',
  '',
  'Для $f(x) = x^2$ в точке $x_0 = 1$ он равен $2 + h$:',
  '',
  '| $h$ | наклон |',
  '|---|---:|',
  '| $0{,}1$ | $2{,}1$ |',
  '| $0{,}01$ | $2{,}01$ |',
  '',
  'При $h \\to 0$ остаётся $2$ — это и есть $f\'(1)$.',
].join('\n');

/* ------------------------------ подставной claude-server ------------------------------ */
const requests = [];
const mock = http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': req.headers.origin || '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
  if (req.url === '/health') return res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }).end(JSON.stringify({ ok: true, images: true }));
  if (req.url === '/v1/chat/completions') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', async () => {
      requests.push(JSON.parse(body));
      res.writeHead(200, { ...cors, 'Content-Type': 'text/event-stream' });
      res.write('data: ' + JSON.stringify({ choices: [{ delta: { reasoning_tokens: 12 } }] }) + '\n\n');
      for (let i = 0; i < ANSWER.length; i += 9) {
        res.write('data: ' + JSON.stringify({ choices: [{ delta: { content: ANSWER.slice(i, i + 9) } }] }) + '\n\n');
        await new Promise((r) => setTimeout(r, 4));
      }
      res.end('data: [DONE]\n\n');
    });
    return;
  }
  res.writeHead(404, cors).end();
});
await new Promise((r) => mock.listen(0, '127.0.0.1', r));
const mockUrl = 'http://127.0.0.1:' + mock.address().port;

/* ------------------------------ статический сервер курса ------------------------------ */
const site = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return res.writeHead(404).end();
  const type = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(p)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => site.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + site.address().port + '/';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 }, colorScheme: theme });
const page = await ctx.newPage();
if (katexDir) {
  await page.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/(.*)$/, (r) => r.fulfill({ path: path.join(katexDir, 'dist', r.request().url().replace(/^.*\/dist\//, '')) }));
}
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.addInitScript((url) => localStorage.setItem('mc:assistant-settings', JSON.stringify({ url })), mockUrl);
await page.goto(base + 'lessons/lesson_20_1/index.html');
await page.waitForTimeout(1200);

const step = (name) => console.log('✓ ' + name);
try {
  // 1. выделение абзаца с формулой → кнопка «Спросить ИИ»
  await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('#secant p')).find((x) => x.textContent.includes('Средняя скорость — это наклон'));
    p.scrollIntoView({ block: 'center' });
    const r = document.createRange();
    r.selectNodeContents(p);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    document.dispatchEvent(new MouseEvent('mouseup'));
  });
  await page.waitForSelector('.assistant-ask.show', { timeout: 3000 });
  step('кнопка «Спросить ИИ» появляется у выделения');
  await page.click('.assistant-ask');
  await page.waitForSelector('.assistant:not([hidden])');
  await page.waitForSelector('.assistant[data-status="online"]', { timeout: 5000 });
  assert.ok(await page.isVisible('.assistant-quote .assistant-cite'));
  step('панель открыта, сервер на связи, фрагмент приложен');

  // 2. вопрос чипом → потоковый ответ с формулами и таблицей
  await page.click('.assistant-chip >> text=Объясните проще');
  await page.waitForFunction(() => !document.querySelector('.assistant.busy') && document.querySelectorAll('.assistant-answer .katex').length >= 5, null, { timeout: 8000 });
  assert.ok(await page.isVisible('.assistant-answer table'));
  assert.ok(await page.isVisible('.assistant-answer .md-formula'));
  step('ответ пришёл потоком: формулы KaTeX, таблица, выключная формула');

  const req1 = requests[0];
  assert.equal(req1.stream, true);
  const sys = req1.messages[0].content;
  const user = req1.messages[req1.messages.length - 1].content;
  assert.ok(sys.includes('«Математика по косточкам»') && sys.includes('Урок 20.1 «Производная»') && sys.includes('Цели урока'), 'системное сообщение');
  assert.ok(user.includes('раздел «От средней скорости к мгновенной»') && /\$A = \(x_0,\\,\s*f\(x_0\)\)\$/.test(user), 'фрагмент с формулами в TeX: ' + user.slice(0, 300));
  assert.ok(user.endsWith('Вопрос ученика: Объясните проще'));
  for (const k of ['allow_tools', 'permission_mode', 'cwd']) assert.ok(!(k in req1), 'запрос не включает инструменты');
  step('на сервер ушли урок, раздел, фрагмент в TeX; инструменты не запрошены');
  if (shots) {
    fs.mkdirSync(shots, { recursive: true });
    await page.screenshot({ path: path.join(shots, 'assistant-' + theme + '.png') });
  }

  // 3. «Подсказка» у задачи — условие без решения
  await page.evaluate(() => document.querySelector('.exercise').scrollIntoView({ block: 'center' }));
  await page.click('.exercise .assistant-hint-btn');
  await page.click('.assistant-chip >> text=Дайте подсказку, не решение');
  await page.waitForFunction((n) => !document.querySelector('.assistant.busy') && document.querySelectorAll('.assistant-msg.bot').length >= 2, null, { timeout: 8000 });
  // цитата — только условие; эталонное решение остаётся в тексте раздела, чтобы наставник мог сверять
  const hint = requests[1].messages[requests[1].messages.length - 1].content;
  const quote = hint.slice(0, hint.indexOf('»\n'));
  assert.ok(hint.startsWith('Задача из урока (раздел «Задача 1»)') && quote.includes('x^3') && !quote.includes('3x^2'), 'условие задачи без решения: ' + quote);
  step('кнопка «Подсказка» цитирует условие задачи без решения');

  // 4. история сохраняется по уроку, новый диалог её очищает
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('mc:assistant:20.1')).length);
  assert.equal(stored, 4);
  await page.click('.assistant-head [aria-label="Новый диалог"]');
  assert.ok(await page.isVisible('.assistant-empty'));
  step('диалог хранится по уроку; «Новый диалог» очищает его');

  // 5. Esc закрывает панель; Alt+I открывает
  await page.keyboard.press('Escape');
  assert.ok(await page.isHidden('.assistant'));
  await page.keyboard.press('Alt+KeyI');
  assert.ok(await page.isVisible('.assistant'));
  step('Esc закрывает, Alt+I открывает панель');
  assert.deepEqual(errors, []);
  console.log('\nИИ-наставник работает.');
} catch (e) {
  console.error('✗ ' + e.message);
  if (shots) await page.screenshot({ path: path.join(shots, 'assistant-fail.png') });
  process.exitCode = 1;
} finally {
  await browser.close();
  mock.close();
  site.close();
}
