# CLAUDE.md

Все правила проекта — в AGENTS.md (импортируется ниже). Здесь — только то, что специфично для Claude Code.

@AGENTS.md

## Специфика Claude Code

- **После любой правки урока** выполняйте цикл из §6 AGENTS.md. Минимум: `node --test "tests/js/*.test.js"` →
  `node tools/qa.mjs --only <id урока>`; после правок ассистента или CSS — `node tools/qa_assistant.mjs`.
- **Без сети к CDN** (облачная сессия) скачайте KaTeX из npm (`npm pack katex@0.16.22`, распакуйте) и передайте
  `--katex-dir <папка>/package` в `qa.mjs` / `qa_assistant.mjs`.
- **Визуальная проверка:** `node tools/qa.mjs --only <id> --shots <scratchpad>` и откройте PNG инструментом Read.
  Смотрите обе темы и 390 px.
- **Большие уроки** пишите целиком за один вызов Write (страница, lesson.js), затем проверяйте.
- **Коммиты** — только по просьбе пользователя.
