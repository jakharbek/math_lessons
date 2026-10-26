# claude-server

> Бэкенд ИИ-наставника курса «Математика по косточкам». Это тот же сервер, что и в курсе
> [«Градиентный бустинг по косточкам»](https://github.com/jakharbek/ml_gradient_boosting):
> одна запущенная копия обслуживает оба курса. Правки сервера переносите в оба репозитория.

Локальный HTTP-сервер, оборачивающий Claude Code CLI (`claude -p`) в API,
совместимый с OpenAI Chat Completions. Использует твою существующую
авторизацию по подписке Max (`claude login`) — никакого `ANTHROPIC_API_KEY`
не нужно. Каждый запрос запускает `claude` как дочерний процесс.

## Требования

- Node.js >= 18
- Установленный и авторизованный Claude Code CLI:
  ```bash
  npm install -g @anthropic-ai/claude-code
  claude login
  ```

## Запуск

```bash
cd claude-server
node server.js
```

**Без клонирования репозитория.** С сайта курса можно скачать архив
`claude-server.zip` (кнопка в панели ИИ-ассистента или `https://jakharbek.github.io/math_lessons/claude-server.zip`),
распаковать и запустить `node server.js` (или `npm start`, `start.cmd`, `./start.sh` — всё
равнозначно). Адрес сайта курса `https://jakharbek.github.io` разрешён по умолчанию вместе с
localhost и `file://`; другие адреса — через `CLAUDE_SERVER_ALLOWED_ORIGINS`.

По умолчанию слушает `http://127.0.0.1:8137` (только localhost).

### Переменные окружения

| Переменная               | По умолчанию | Описание                                              |
|---------------------------|--------------|--------------------------------------------------------|
| `CLAUDE_SERVER_PORT`      | `8137`       | Порт                                                    |
| `CLAUDE_SERVER_HOST`      | `127.0.0.1`  | Адрес для bind                                          |
| `CLAUDE_SERVER_TOKEN`     | не задан     | Если задан — требуется `Authorization: Bearer <token>` |
| `CLAUDE_SERVER_TIMEOUT_MS`| `9000000`    | Таймаут одного запроса к `claude` (мс, 150 мин)         |
| `CLAUDE_BIN`               | `claude`     | Путь/имя бинарника CLI                                  |
| `CLAUDE_SERVER_ALLOW_TOOLS`| не задан    | `1` — разрешить запросам поля `allow_tools`, `permission_mode`, `cwd`, `session_id` (см. «Безопасность») |
| `CLAUDE_SERVER_ALLOWED_ORIGINS` | не задан | Дополнительные origin браузерных страниц через запятую (localhost, `file://` и сайт курса `https://jakharbek.github.io` разрешены всегда) |

## Эндпоинты

| Метод | Путь                    | Описание                                        |
|-------|--------------------------|--------------------------------------------------|
| GET   | `/health`                | Проверка живости                                  |
| GET   | `/v1/models`              | Список моделей (OpenAI-формат)                    |
| POST  | `/v1/chat/completions`    | Основной, OpenAI-совместимый (стрим и без стрима) |
| POST  | `/ask`                    | Упрощённый нативный эндпоинт (см. ниже)           |

---

## CURL примеры

### Health check

```bash
curl http://127.0.0.1:8137/health
```

### Список моделей

```bash
curl http://127.0.0.1:8137/v1/models
```

### Chat Completions — обычный запрос (без стрима)

```bash
curl -X POST http://127.0.0.1:8137/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opus",
    "messages": [
      {"role": "system", "content": "Отвечай коротко."},
      {"role": "user", "content": "Столица Франции?"}
    ]
  }'
```

Ответ (формат идентичен OpenAI):

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1785578378,
  "model": "opus",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Париж" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 21736,
    "completion_tokens": 72,
    "total_tokens": 21808
  }
}
```

### Chat Completions — потоковый ответ (SSE)

```bash
curl -N -X POST http://127.0.0.1:8137/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opus",
    "stream": true,
    "messages": [
      {"role": "user", "content": "Посчитай от 1 до 5, по одному числу в строке."}
    ]
  }'
```

Ответ (`-N` отключает буферизацию curl, чтобы видеть чанки в реальном времени):

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1785578385,"model":"opus","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1785578385,"model":"opus","choices":[{"index":0,"delta":{"content":"1\n2\n3\n4\n5"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1785578385,"model":"opus","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

### Многоходовой диалог (история сообщений)

```bash
curl -X POST http://127.0.0.1:8137/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "opus",
    "messages": [
      {"role": "user", "content": "Меня зовут Анна."},
      {"role": "assistant", "content": "Приятно познакомиться, Анна!"},
      {"role": "user", "content": "Как меня зовут? Ответь только именем."}
    ]
  }'
```

### С Bearer-токеном (если задан `CLAUDE_SERVER_TOKEN`)

```bash
curl -X POST http://127.0.0.1:8137/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"model": "opus", "messages": [{"role": "user", "content": "Привет"}]}'
```

### Легаси-эндпоинт `/ask` (простой, без OpenAI-обёртки)

```bash
curl -X POST http://127.0.0.1:8137/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Скажи привет"}'
```

Разрешить Claude пользоваться инструментами (Bash, файлы и т.д.) без
интерактивного подтверждения — **только если сервер запущен с
`CLAUDE_SERVER_ALLOW_TOOLS=1`** (иначе ответ 403):

```bash
curl -X POST http://127.0.0.1:8137/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Создай файл hello.txt с текстом Hello World",
    "cwd": "C:/path/to/project",
    "allowTools": true
  }'
```

---

## Использование с OpenAI SDK

### Python

```python
from openai import OpenAI

client = OpenAI(base_url="http://127.0.0.1:8137/v1", api_key="not-needed")

resp = client.chat.completions.create(
    model="opus",
    messages=[{"role": "user", "content": "Привет!"}],
)
print(resp.choices[0].message.content)

# Стриминг
stream = client.chat.completions.create(
    model="opus",
    messages=[{"role": "user", "content": "Посчитай от 1 до 5"}],
    stream=True,
)
for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
```

### Node.js

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://127.0.0.1:8137/v1",
  apiKey: "not-needed",
});

const resp = await client.chat.completions.create({
  model: "opus",
  messages: [{ role: "user", content: "Привет!" }],
});
console.log(resp.choices[0].message.content);
```

---

## Дополнительные поля в `/v1/chat/completions` (нестандартные, опциональные)

Поля `cwd`, `session_id`, `allow_tools`, `permission_mode` принимаются только при
`CLAUDE_SERVER_ALLOW_TOOLS=1`; без этой переменной запрос с ними получает 403.

| Поле              | Тип     | Описание                                                          |
|-------------------|---------|---------------------------------------------------------------------|
| `cwd`             | string  | Рабочая директория для Claude                                       |
| `session_id`      | string  | Продолжить существующую сессию Claude Code (`--resume`)             |
| `allow_tools`     | boolean | Разрешить Bash/файлы и т.д. без подтверждения (`--dangerously-skip-permissions`) |
| `permission_mode` | string  | `acceptEdits` \| `auto` \| `bypassPermissions` \| `manual`          |
| `effort`          | string  | `low` \| `medium` \| `high` \| `xhigh` \| `max` — прокидывается как `--effort`. Ниже effort = меньше "думания" перед ответом, заметно быстрее на сложных промптах (на генерации большого структурированного JSON — минуты против десятков секунд на `low`). |

### Мышление модели и `reasoning_tokens` в стриме

На сложных промптах (например, "сгенерируй большой структурированный JSON")
Sonnet/Opus обычно тратит от десятков секунд до нескольких **минут** на
extended thinking, прежде чем появится первый видимый текст. Claude Code CLI
не отдаёт сам текст размышлений через `--include-partial-messages` (он
редактируется), только грубую оценку размера очередного блока —
`estimated_tokens`. Чтобы стриминг не выглядел как зависание, каждый такой
чанк сервер пробрасывает клиенту как нестандартное поле в SSE-чанке:

```
data: {"choices":[{"delta":{"reasoning_tokens": 684}, "finish_reason": null}]}
```

`reasoning_tokens` — это накопленная оценка количества токенов размышления
на текущий момент (растёт, пока не появится обычный `delta.content`).
Клиенты, не знающие про это поле, могут его просто игнорировать — оно
всегда в отдельном чанке, не смешивается с `content`.

### Изображения

Сообщение пользователя может содержать картинки в формате OpenAI — части `image_url` с data-URL
(png, jpeg, webp, gif; до 4 последних картинок на запрос; удалённые ссылки не скачиваются — ответ 400):

```json
{
  "model": "sonnet",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "Что на картинке?"},
      {"type": "image_url", "image_url": {"url": "data:image/png;base64,iVBORw0KGgo..."}}
    ]
  }]
}
```

В этом случае запрос передаётся в CLI через stdin (`--input-format stream-json`), а не аргументом `-p`,
поэтому ограничение длины командной строки на него не действует. Работает и со `stream: true`, и без.
`json_schema` вместе с картинками не поддерживается. `GET /health` отвечает `{"ok": true, "images": true}` —
по полю `images` клиент узнаёт, что запущена версия с поддержкой картинок.

## Ограничения

- `temperature`, `top_p`, `max_tokens`, `n`, `stop` принимаются в теле
  запроса ради совместимости формата, но CLI `claude -p` их не поддерживает
  — реально не влияют на генерацию.
- `function_call` / `tool_calls` (вызовы функций в стиле OpenAI) не
  эмулируются.
- Каждый запрос — новый процесс `claude`. Для настоящего сохранения сессии
  между запросами используй `session_id` + `--resume` (см. таблицу выше).
- Если клиент отключается до завершения ответа (fetch abort/timeout,
  закрытая вкладка), сервер убивает дочерний процесс `claude` вместо того,
  чтобы оставлять его работать вхолостую до истечения таймаута.

## Безопасность

Любая веб-страница, открытая в браузере, может отправить запрос на порт
`127.0.0.1`, поэтому сервер по умолчанию защищён так:

- **Только текстовые ответы.** Каждый запуск `claude` получает
  `--tools "" --strict-mcp-config`: ни встроенных инструментов (Bash, чтение и
  правка файлов, веб), ни MCP-серверов из вашей конфигурации. Поля
  `allow_tools`, `permission_mode`, `cwd`, `session_id` отклоняются (403).
  Включить их можно только переменной окружения `CLAUDE_SERVER_ALLOW_TOOLS=1`
  — делайте это, лишь когда к серверу не обращаются браузерные страницы
  (и лучше вместе с `CLAUDE_SERVER_TOKEN`).
- **Проверка Origin.** Без заголовка `Origin` (curl, SDK) запросы принимаются;
  из браузера — только со страниц `http://localhost:*`, `http://127.0.0.1:*`,
  `http://[::1]:*`, с диска (`file://`, Origin `null`) и из
  `CLAUDE_SERVER_ALLOWED_ORIGINS`. Остальным — 403 (а не просто ошибка CORS).
- **Только `Content-Type: application/json`** для POST (иначе 415): чужой сайт
  не может отправить «простой» запрос без CORS-preflight.
- **Проверка Host** (защита от DNS rebinding): при bind на loopback принимаются
  только `Host: localhost / 127.0.0.1 / [::1]`.
- По умолчанию сервер слушает только `127.0.0.1` — не открывайте его наружу
  без `CLAUDE_SERVER_TOKEN` и понимания рисков: эндпоинт расходует лимиты
  вашей подписки Claude.

## Использование из браузера (CORS)

Разрешённым origin (см. выше) сервер отдаёт заголовки `Access-Control-Allow-*`
и отвечает на preflight `OPTIONS`, поэтому его можно вызывать через `fetch`
со страницы курса, открытой с `http://127.0.0.1:*` или с диска (`file://`).
Так работает ИИ-ассистент уроков (`shared/web/js/ui/assistant.js`).
