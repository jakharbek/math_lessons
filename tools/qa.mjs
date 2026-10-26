#!/usr/bin/env node
/**
 * Проверка страниц курса в браузере (Playwright): ошибки JS, горизонтальная прокрутка,
 * отрисовка формул и рисунков — в светлой и тёмной теме, на широком экране и на 390 px.
 *
 *   node tools/qa.mjs                         # главная и все готовые уроки
 *   node tools/qa.mjs --only 2.2              # один урок (id из assets/js/course.js) или home
 *   node tools/qa.mjs --shots out/            # сохранить скриншоты (полная страница)
 *   node tools/qa.mjs --katex-dir path/katex  # взять KaTeX с диска вместо CDN (без сети)
 *
 * Нужен пакет playwright (npm i -D playwright, затем npx playwright install chromium).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const only = opt('--only');
const shots = opt('--shots');
const katexDir = opt('--katex-dir');
const widths = (opt('--widths') || '1440,390').split(',').map(Number);
const themes = (opt('--themes') || 'light,dark').split(',');

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
    res.writeHead(404);
    return res.end('not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + server.address().port + '/';

// Список страниц — из программы курса (course.js — обычный скрипт, в Node он кладёт MC в globalThis)
require(path.join(ROOT, 'assets/js/course.js'));
const pages = [{ id: 'home', url: 'index.html' }, ...globalThis.MC.course.ready().map((l) => ({ id: l.id, url: 'lessons/' + l.folder + '/index.html' }))].filter((p) => !only || p.id === only);

const browser = await chromium.launch();
let problems = 0;
for (const pg of pages) {
  for (const theme of themes) {
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: theme, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      if (katexDir) {
        await page.route(/cdn\.jsdelivr\.net\/npm\/katex@[^/]+\/dist\/(.*)$/, (route) => {
          const rel = route.request().url().replace(/^.*\/dist\//, '');
          const file = path.join(katexDir, 'dist', rel);
          if (fs.existsSync(file)) route.fulfill({ path: file, contentType: TYPES[path.extname(file)] || (file.endsWith('.ttf') ? 'font/ttf' : 'font/woff') });
          else route.abort();
        });
      }
      const errors = [];
      page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
      page.on('console', (m) => {
        if (m.type() === 'error' && !/Failed to load resource|net::ERR|ERR_TUNNEL|fonts\.g/.test(m.text())) errors.push('console: ' + m.text());
      });
      await page.goto(base + pg.url, { waitUntil: 'load' });
      await page.waitForTimeout(1600);
      const info = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        katex: document.querySelectorAll('.katex').length,
        rawTex: Array.from(document.querySelectorAll('main p, main li, main dd, main td')).filter((n) => /\$[^$\s][^$]*\$/.test(n.textContent) && !n.closest('pre,code,.no-math')).length,
        figures: document.querySelectorAll('[data-widget]').length,
        svgs: document.querySelectorAll('[data-widget] svg.pl').length,
        widgetErrors: document.querySelectorAll('.fig-note.bad').length,
      }));
      const bad = [];
      if (errors.length) bad.push(...errors);
      if (info.overflow > 1) bad.push('горизонтальная прокрутка: +' + info.overflow + 'px');
      if (katexDir && info.rawTex) bad.push('неотрисованные формулы: ' + info.rawTex);
      if (info.figures && info.svgs < info.figures) bad.push('рисунков без графика: ' + (info.figures - info.svgs));
      if (info.widgetErrors) bad.push('ошибки рисунков: ' + info.widgetErrors);
      problems += bad.length;
      console.log((bad.length ? '✗ ' : '✓ ') + pg.id.padEnd(5) + theme.padEnd(6) + String(width).padStart(5) + ' px · формул ' + info.katex + ' · рисунков ' + info.figures + (bad.length ? '\n    ' + bad.join('\n    ') : ''));
      if (shots) {
        fs.mkdirSync(shots, { recursive: true });
        await page.screenshot({ path: path.join(shots, `${pg.id}-${theme}-${width}.png`), fullPage: true });
      }
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
console.log(problems ? `\nПроблем: ${problems}` : '\nВсё в порядке.');
process.exit(problems ? 1 : 0);
