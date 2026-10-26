#!/usr/bin/env node
"use strict";

/**
 * Local HTTP wrapper around the Claude Code CLI (headless / -p mode) that
 * exposes an OpenAI-compatible Chat Completions API.
 *
 * Auth: uses whatever `claude` is already logged into on this machine
 * (Max subscription via `claude login`, no ANTHROPIC_API_KEY needed).
 * The CLI is spawned as a child process for every request - nothing here
 * touches the Claude API/SDK or any API key.
 *
 * Point any OpenAI-SDK-compatible client at this server:
 *   base_url = http://127.0.0.1:8137/v1
 *   api_key  = anything (ignored unless CLAUDE_SERVER_TOKEN is set)
 *
 * Endpoints:
 *   GET  /v1/models
 *   POST /v1/chat/completions   (OpenAI-compatible; supports "stream": true)
 *   POST /ask                   (legacy simple endpoint, still available)
 *   GET  /health
 */

const http = require("http");
const readline = require("readline");
const { spawn } = require("child_process");
const crypto = require("crypto");

// Uncommon high port, unlikely to collide with common dev servers
// (3000/5000/8000/8080/5173/4200/...).
const PORT = process.env.CLAUDE_SERVER_PORT
  ? Number(process.env.CLAUDE_SERVER_PORT)
  : 8137;

// Bind to localhost only by default - this endpoint runs arbitrary
// prompts through Claude Code, do not expose it beyond this machine
// unless you add real authentication in front of it.
const HOST = process.env.CLAUDE_SERVER_HOST || "127.0.0.1";

// Optional shared-secret token. If set, callers must send it as
// `Authorization: Bearer <token>`. OpenAI SDKs already send whatever you
// configure as `apiKey` in that header, so this lines up naturally.
const AUTH_TOKEN = process.env.CLAUDE_SERVER_TOKEN || null;

// Tool use is OFF unless the operator opts in with CLAUDE_SERVER_ALLOW_TOOLS=1.
// Any web page open in the browser can reach a localhost port, so a request
// body must never be able to turn on Bash/file edits, pick a working
// directory or resume another conversation. Without the opt-in every run gets
// `--tools "" --strict-mcp-config` (no built-in tools, no MCP servers) and
// requests carrying allow_tools / permission_mode / cwd / session_id are
// rejected with 403.
const ALLOW_TOOLS = process.env.CLAUDE_SERVER_ALLOW_TOOLS === "1";

// Browser origins allowed to call the API. Requests without an Origin header
// (curl, SDKs) are always allowed; so are loopback pages (http://localhost:*,
// http://127.0.0.1:*, http://[::1]:*) and "null" (pages opened from disk via
// file://). Add more as a comma-separated list in CLAUDE_SERVER_ALLOWED_ORIGINS.
const EXTRA_ORIGINS = new Set(
  (process.env.CLAUDE_SERVER_ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
// The course's own published site: readers on GitHub Pages run this server
// locally, so its origin is allowed out of the box (no env needed).
const SITE_ORIGINS = ["https://jakharbek.github.io"];
for (const o of SITE_ORIGINS) EXTRA_ORIGINS.add(o);
const LOOPBACK_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

// How long a single Claude invocation may run before we kill it. Sonnet/Opus
// routinely spend several minutes in extended thinking before emitting any
// visible text on complex prompts (structured-generation tasks especially),
// so the default here is generous - lower it via env if you want faster
// failure instead.
const REQUEST_TIMEOUT_MS = Number(process.env.CLAUDE_SERVER_TIMEOUT_MS) || 150 * 60 * 1000;

const EFFORT_LEVELS = new Set(["low", "medium", "high", "xhigh", "max"]);

const MAX_BODY_BYTES = 40 * 1024 * 1024; // 40 MB

const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";

const DEFAULT_SYSTEM_PROMPT = "You are Claude, a helpful assistant.";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, "Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpError(400, "Body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function checkAuth(req) {
  if (!AUTH_TOKEN) return;
  const header = req.headers["authorization"] || "";
  const expected = `Bearer ${AUTH_TOKEN}`;
  const ok =
    header.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  if (!ok) throw new HttpError(401, "Missing or invalid Authorization header");
}

function isAllowedOrigin(origin) {
  if (origin === undefined) return true; // not a browser (curl, SDK)
  return origin === "null" || LOOPBACK_ORIGIN.test(origin) || EXTRA_ORIGINS.has(origin);
}

/**
 * Browser-facing guards, applied to every request before any work is done:
 * - Origin must be allowed (a foreign site gets 403, not just a CORS error -
 *   CORS alone does not stop the request from running);
 * - while bound to loopback, Host must be a loopback name (DNS rebinding);
 * - POST bodies must be application/json, so a cross-site "simple" request
 *   (text/plain form post, no CORS preflight) cannot reach the handlers.
 */
function checkRequestOrigin(req) {
  if (!isAllowedOrigin(req.headers["origin"])) throw new HttpError(403, "Origin not allowed");
  if (LOOPBACK_HOSTS.has(HOST) || HOST === "::1") {
    const host = String(req.headers["host"] || "").replace(/:\d+$/, "").toLowerCase();
    if (!LOOPBACK_HOSTS.has(host)) throw new HttpError(403, "Host not allowed");
  }
  if (req.method === "POST") {
    const type = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if (type !== "application/json") throw new HttpError(415, "Content-Type must be application/json");
  }
}

/** Reject tool-related options unless CLAUDE_SERVER_ALLOW_TOOLS=1. */
function checkToolOptions(opts) {
  if (ALLOW_TOOLS) return;
  if (opts.allowTools || opts.permissionMode || opts.cwd || opts.sessionId) {
    throw new HttpError(
      403,
      "allow_tools, permission_mode, cwd and session_id are disabled (start the server with CLAUDE_SERVER_ALLOW_TOOLS=1)"
    );
  }
}

function genId(prefix) {
  return `${prefix}-${crypto.randomBytes(12).toString("hex")}`;
}

/**
 * On a non-zero exit, `claude -p --output-format json` still writes a full
 * JSON result envelope to STDOUT even for a failure it can attribute to a
 * specific cause (e.g. `{"is_error":true,"result":"API Error: 400 ..."}`
 * for a rejected request, such as an invalid --json-schema) - stderr is
 * typically empty in that case. Falling back to a bare "claude exited with
 * code 1" whenever stderr happened to be empty (the previous behaviour)
 * threw away that far more actionable message. Tries stdout's `result`
 * field first, then stderr, then the exit code as a last resort.
 */
function describeClaudeFailure(stdout, stderr, code) {
  try {
    const parsed = JSON.parse(stdout);
    if (parsed && parsed.is_error && typeof parsed.result === "string" && parsed.result.trim()) {
      return parsed.result.trim();
    }
  } catch {
    // stdout wasn't JSON (or wasn't present) - fall through to stderr/code.
  }
  return stderr.trim() || `claude exited with code ${code}`;
}

/** OpenAI "finish_reason" values: stop | length | tool_calls | content_filter */
function mapFinishReason(stopReason) {
  switch (stopReason) {
    case "max_tokens":
      return "length";
    case "tool_use":
      return "tool_calls";
    case "refusal":
      return "content_filter";
    default:
      return "stop";
  }
}

/** OpenAI message.content can be a string or an array of content parts. */
function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p) => p && (p.type === "text" || typeof p.text === "string"))
      .map((p) => p.text || "")
      .join("");
  }
  return "";
}

/**
 * Claude Code's -p mode takes one prompt string, not a role-tagged message
 * array. We pull system messages out (passed via --system-prompt) and
 * flatten the remaining user/assistant turns into a plain transcript, the
 * same way the client would have to reconstruct history on a stateless
 * completions API anyway.
 */
const IMAGE_DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/;
const MAX_IMAGES = 4;

/**
 * OpenAI-style image parts of a user message:
 *   {type: "image_url", image_url: {url: "data:image/png;base64,..."}}
 * Only inline base64 data URLs are accepted (no remote fetching). Returned
 * as Anthropic image content blocks, ready for `--input-format stream-json`.
 */
function extractImages(content) {
  if (!Array.isArray(content)) return [];
  const out = [];
  for (const p of content) {
    if (!p || p.type !== "image_url") continue;
    const url = typeof p.image_url === "string" ? p.image_url : p.image_url && p.image_url.url;
    const m = typeof url === "string" ? IMAGE_DATA_URL.exec(url) : null;
    if (!m) throw new HttpError(400, "image_url must be a base64 data URL (png, jpeg, webp or gif)");
    out.push({ type: "image", source: { type: "base64", media_type: m[1], data: m[2].replace(/\s+/g, "") } });
  }
  return out;
}

function buildPromptFromMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpError(400, '"messages" must be a non-empty array');
  }

  const systemParts = [];
  const turns = [];
  let images = [];

  for (const m of messages) {
    if (!m || typeof m.role !== "string") continue;
    const text = extractText(m.content);
    if (m.role === "system" || m.role === "developer") {
      if (text) systemParts.push(text);
    } else if (m.role === "user") {
      turns.push({ label: "Human", text });
      images = images.concat(extractImages(m.content));
    } else if (m.role === "assistant") {
      turns.push({ label: "Assistant", text });
    }
    // "tool" / "function" role messages aren't supported - skipped.
  }

  if (turns.length === 0) {
    throw new HttpError(400, "No user/assistant messages found in \"messages\"");
  }

  const prompt =
    turns.length === 1 && turns[0].label === "Human"
      ? turns[0].text
      : turns.map((t) => `${t.label}: ${t.text}`).join("\n\n");

  return {
    systemPrompt: systemParts.length ? systemParts.join("\n\n") : DEFAULT_SYSTEM_PROMPT,
    prompt,
    // Most recent images win if the conversation carries more than we forward.
    images: images.slice(-MAX_IMAGES),
  };
}

function buildClaudeArgs({ prompt, systemPrompt, model, sessionId, allowTools, permissionMode, effort, jsonSchema, extra, stdinInput }) {
  // With images the user turn (text + image blocks) is written to stdin as a
  // stream-json message instead of being passed as the -p argument.
  const args = stdinInput ? ["-p", "--input-format", "stream-json", ...extra] : ["-p", prompt, ...extra];
  if (systemPrompt) args.push("--system-prompt", systemPrompt);
  if (model) args.push("--model", model);
  if (!ALLOW_TOOLS) {
    // Text-only answers: no built-in tools and no MCP servers from the
    // user's config, whatever the prompt asks for.
    args.push("--tools", "", "--strict-mcp-config");
  } else {
    if (sessionId) args.push("--resume", sessionId);
    // Deny-by-default: headless mode has no interactive confirmation, so
    // tool use (Bash, file edits, ...) is only allowed if explicitly opted in.
    if (permissionMode) args.push("--permission-mode", permissionMode);
    if (allowTools === true) args.push("--dangerously-skip-permissions");
  }
  if (effort && EFFORT_LEVELS.has(effort)) args.push("--effort", effort);
  // Native structured output: the CLI itself constrains generation to this
  // schema and hands back an already-parsed, already-validated
  // `structured_output` field in the --output-format json result - callers
  // that ask for this get that field instead of freeform text, which is
  // categorically more reliable than "please reply with only raw JSON
  // matching this schema" plus a client-side best-effort text parser (the
  // old approach every caller used, and the direct cause of the
  // "Could not parse the model's structured output as JSON" failures the
  // callers used to hit on partial/malformed text).
  if (jsonSchema) args.push("--json-schema", JSON.stringify(jsonSchema));
  return args;
}

function spawnClaude(args, cwd, stdinText) {
  const child = spawn(CLAUDE_BIN, args, {
    cwd: (ALLOW_TOOLS && cwd) || process.cwd(),
    windowsHide: true,
    stdio: [stdinText ? "pipe" : "ignore", "pipe", "pipe"],
  });
  if (stdinText) {
    child.stdin.on("error", () => {}); // child may exit before reading everything
    child.stdin.end(stdinText);
  }
  return child;
}

/** One stream-json user message: the prompt text followed by image blocks. */
function stdinMessage(prompt, images) {
  return (
    JSON.stringify({
      type: "user",
      message: { role: "user", content: [{ type: "text", text: prompt }, ...images] },
    }) + "\n"
  );
}

/**
 * Shared child-process lifecycle for both run modes below: a hard timeout,
 * and - critically - killing the child if the HTTP client disconnects
 * before we're done (browser-side fetch abort/timeout, tab closed, etc).
 * Without this a client giving up just orphans a `claude` process that
 * keeps burning CPU/tokens for up to REQUEST_TIMEOUT_MS with nothing left
 * to deliver its output to.
 *
 * `run(settle)` does the actual work and must call settle(fn) itself
 * exactly once when the child process naturally finishes or errors;
 * `fn` receives no arguments and should resolve/reject the outer promise.
 */
function withChildLifecycle(child, req, res, run) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = () => {
      clearTimeout(timer);
      if (req) req.removeListener("close", onClientClose);
      if (res) res.removeListener("close", onClientClose);
    };
    const settle = (fn) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };
    const timer = setTimeout(() => {
      settle(() => {
        child.kill("SIGKILL");
        reject(new HttpError(504, `claude did not finish within ${REQUEST_TIMEOUT_MS}ms`));
      });
    }, REQUEST_TIMEOUT_MS);
    const onClientClose = () => {
      settle(() => {
        child.kill("SIGKILL");
        reject(new HttpError(499, "Client disconnected"));
      });
    };
    if (req) req.on("close", onClientClose);
    if (res) res.on("close", onClientClose);

    run({ resolve: (v) => settle(() => resolve(v)), reject: (e) => settle(() => reject(e)) });
  });
}

// ---------------------------------------------------------------------
// Non-streaming: claude -p ... --output-format json
// ---------------------------------------------------------------------

function runClaudeJson(opts) {
  const args = buildClaudeArgs({ ...opts, extra: ["--output-format", "json"] });
  const child = spawnClaude(args, opts.cwd);

  return withChildLifecycle(child, opts.req, opts.res, (settle) => {
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));

    child.on("error", (err) => {
      settle.reject(new HttpError(500, `Failed to launch "${CLAUDE_BIN}": ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        settle.reject(new HttpError(502, describeClaudeFailure(stdout, stderr, code)));
        return;
      }
      try {
        settle.resolve(JSON.parse(stdout));
      } catch {
        settle.resolve({ raw: stdout, stderr: stderr || undefined });
      }
    });
  });
}

// ---------------------------------------------------------------------
// Streaming: claude -p ... --output-format stream-json --include-partial-messages --verbose
// ---------------------------------------------------------------------

/**
 * Runs claude in streaming mode and invokes onDelta(text) for each visible
 * text chunk as it arrives, then resolves with the final
 * { stopReason, usage }.
 *
 * Complex prompts (e.g. "generate this whole structured JSON document")
 * routinely make the model spend minutes in extended thinking before the
 * first visible text token - that phase produces `thinking_delta` events
 * with no reusable text (Claude Code redacts the actual reasoning content
 * here, only a rough `estimated_tokens` size per chunk survives), so
 * without surfacing *something* for that phase a caller streaming this to
 * a UI sees total silence and reasonably assumes it hung. onReasoning(n),
 * if provided, is called with the cumulative estimated thinking-token count
 * so callers can show live "thinking..." progress instead.
 */
function runClaudeStream(opts, onDelta, onReasoning) {
  const hasImages = Array.isArray(opts.images) && opts.images.length > 0;
  const args = buildClaudeArgs({
    ...opts,
    stdinInput: hasImages,
    extra: ["--output-format", "stream-json", "--include-partial-messages", "--verbose"],
  });
  const child = spawnClaude(args, opts.cwd, hasImages ? stdinMessage(opts.prompt, opts.images) : null);

  return withChildLifecycle(child, opts.req, opts.res, (settle) => {
    let stderr = "";
    let reasoningTokens = 0;
    let finalInfo = { stopReason: "end_turn", usage: null };
    // See describeClaudeFailure() above - the stream-json equivalent of its
    // stdout `result` field: a final `type:"result"` line can itself carry
    // `is_error:true` with a human-readable `result` message (e.g. a
    // rejected request), which is far more useful than the bare exit code.
    let resultErrorText = null;

    const rl = readline.createInterface({ input: child.stdout });

    rl.on("line", (line) => {
      if (!line.trim()) return;
      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        return; // ignore malformed line
      }

      if (obj.type === "stream_event" && obj.event) {
        const ev = obj.event;
        if (ev.type === "content_block_delta" && ev.delta) {
          if (ev.delta.type === "text_delta") {
            onDelta(ev.delta.text || "");
          } else if (ev.delta.type === "thinking_delta" && onReasoning) {
            reasoningTokens += Number(ev.delta.estimated_tokens) || 0;
            onReasoning(reasoningTokens);
          }
        } else if (ev.type === "message_delta" && ev.delta && ev.delta.stop_reason) {
          finalInfo.stopReason = ev.delta.stop_reason;
        }
      } else if (obj.type === "result") {
        finalInfo.usage = obj.usage || null;
        if (obj.stop_reason) finalInfo.stopReason = obj.stop_reason;
        if (obj.is_error && typeof obj.result === "string" && obj.result.trim()) resultErrorText = obj.result.trim();
      }
    });

    child.stderr.on("data", (d) => (stderr += d));

    child.on("error", (err) => {
      settle.reject(new HttpError(500, `Failed to launch "${CLAUDE_BIN}": ${err.message}`));
    });

    child.on("close", (code) => {
      if (code !== 0) {
        settle.reject(new HttpError(502, resultErrorText || stderr.trim() || `claude exited with code ${code}`));
        return;
      }
      settle.resolve(finalInfo);
    });
  });
}

// ---------------------------------------------------------------------
// OpenAI-compatible route handlers
// ---------------------------------------------------------------------

const MODEL_CATALOG = [
  { id: "opus", owned_by: "anthropic" },
  { id: "sonnet", owned_by: "anthropic" },
  { id: "haiku", owned_by: "anthropic" },
];

function handleModels(req, res) {
  checkAuth(req);
  const now = Math.floor(Date.now() / 1000);
  sendJson(res, 200, {
    object: "list",
    data: MODEL_CATALOG.map((m) => ({
      id: m.id,
      object: "model",
      created: now,
      owned_by: m.owned_by,
    })),
  });
}

/**
 * Prefer the CLI's own validated `structured_output` (only present when a
 * `--json-schema` was passed and generation succeeded) over the raw text
 * result - re-stringifying an already-parsed object can never be "cut off
 * mid-object" or contain stray prose around it the way free text can.
 */
function resultText(result) {
  if (result.structured_output !== undefined) return JSON.stringify(result.structured_output);
  return typeof result.result === "string" ? result.result : result.raw || "";
}

async function handleChatCompletions(req, res) {
  checkAuth(req);
  const body = await readJsonBody(req);

  if (!body || !Array.isArray(body.messages)) {
    throw new HttpError(400, '"messages" (array) is required');
  }

  const { systemPrompt, prompt, images } = buildPromptFromMessages(body.messages);
  const model = typeof body.model === "string" ? body.model : undefined;
  const stream = body.stream === true;
  const cwd = typeof body.cwd === "string" ? body.cwd : undefined;
  const sessionId = typeof body.session_id === "string" ? body.session_id : undefined;
  const allowTools = body.allow_tools === true;
  const permissionMode = typeof body.permission_mode === "string" ? body.permission_mode : undefined;
  const effort = typeof body.effort === "string" ? body.effort : undefined;
  const jsonSchema =
    body.json_schema && typeof body.json_schema === "object" ? body.json_schema : undefined;

  if (images.length && jsonSchema) throw new HttpError(400, "json_schema cannot be combined with images");
  const runOpts = { prompt, systemPrompt, model, cwd, sessionId, allowTools, permissionMode, effort, jsonSchema, images, req, res };
  checkToolOptions(runOpts);
  const id = genId("chatcmpl");
  const created = Math.floor(Date.now() / 1000);
  const responseModel = model || "claude";

  if (!stream) {
    let result;
    if (images.length) {
      // Image input needs stream-json on both sides; collect the stream into
      // the same shape runClaudeJson() returns.
      let text = "";
      const info = await runClaudeStream(runOpts, (t) => (text += t));
      result = { result: text, usage: info.usage, stop_reason: info.stopReason };
    } else {
      result = await runClaudeJson(runOpts);
    }
    const text = resultText(result);
    const usage = result.usage || {};
    const promptTokens =
      (usage.input_tokens || 0) +
      (usage.cache_read_input_tokens || 0) +
      (usage.cache_creation_input_tokens || 0);
    const completionTokens = usage.output_tokens || 0;

    sendJson(res, 200, {
      id,
      object: "chat.completion",
      created,
      model: responseModel,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: text },
          finish_reason: mapFinishReason(result.stop_reason),
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
    });
    return;
  }

  // --- Streaming (SSE), OpenAI chat.completion.chunk format ---
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  const writeChunk = (delta, finishReason) => {
    const chunk = {
      id,
      object: "chat.completion.chunk",
      created,
      model: responseModel,
      choices: [{ index: 0, delta, finish_reason: finishReason }],
    };
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  };

  writeChunk({ role: "assistant", content: "" }, null);

  try {
    if (jsonSchema) {
      // Structured output is a single constrained-decoding result, not
      // something the CLI streams token-by-token the way free text is - so
      // there's nothing incremental to forward. Run it as one blocking call
      // and deliver the whole (already-validated) result as a single SSE
      // chunk, keeping the wire format identical to the streaming path so
      // callers built for stream:true don't need a separate code path.
      const result = await runClaudeJson(runOpts);
      const text = resultText(result);
      if (text) writeChunk({ content: text }, null);
      writeChunk({}, mapFinishReason(result.stop_reason));
    } else {
      const finalInfo = await runClaudeStream(
        runOpts,
        (text) => {
          if (text) writeChunk({ content: text }, null);
        },
        // Custom (non-OpenAI-standard) field: a running estimated-token count
        // for the model's extended-thinking phase, sent while there is no
        // visible text yet so a client can show live progress instead of
        // apparent silence. Safe to ignore for callers that don't expect it.
        (reasoningTokens) => writeChunk({ reasoning_tokens: reasoningTokens }, null)
      );
      writeChunk({}, mapFinishReason(finalInfo.stopReason));
    }
    res.write("data: [DONE]\n\n");
  } catch (err) {
    // Best-effort error surface inside the stream, then terminate it. If the
    // client already disconnected (the error path taken when it does), res
    // is closed and these writes are harmless no-ops.
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: { message: err.message || "Internal error" } })}\n\n`);
      res.write("data: [DONE]\n\n");
    }
  } finally {
    if (!res.writableEnded) res.end();
  }
}

// ---------------------------------------------------------------------
// Legacy simple endpoint (kept for direct/manual use)
// ---------------------------------------------------------------------

async function handleAsk(req, res) {
  checkAuth(req);
  const body = await readJsonBody(req);

  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    throw new HttpError(400, '"prompt" (non-empty string) is required');
  }

  const opts = {
    prompt: body.prompt,
    systemPrompt: typeof body.systemPrompt === "string" ? body.systemPrompt : null,
    cwd: typeof body.cwd === "string" ? body.cwd : undefined,
    model: typeof body.model === "string" ? body.model : undefined,
    sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
    allowTools: body.allowTools === true,
    permissionMode: typeof body.permissionMode === "string" ? body.permissionMode : undefined,
    effort: typeof body.effort === "string" ? body.effort : undefined,
    req,
    res,
  };
  checkToolOptions(opts);
  const result = await runClaudeJson(opts);

  sendJson(res, 200, result);
}

// ---------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------

// CORS: this server is meant to be called directly from local browser pages
// (e.g. the course opened from 127.0.0.1 or from disk), so allowed origins -
// and only those - get CORS headers, including on the preflight OPTIONS
// request browsers send before a JSON POST.
function applyCors(req, res) {
  const origin = req.headers["origin"];
  if (origin === undefined) return;
  // GET /health is harmless and is answered with CORS headers for any origin, so a
  // course page from a non-allowed site can *see* the 403 and explain it to the
  // reader instead of showing a generic "server not running".
  const isHealth = req.method === "GET" && req.url.split("?")[0] === "/health";
  if (!isAllowedOrigin(origin) && !isHealth) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
  // Private Network Access: a page served from the public web (e.g. GitHub Pages)
  // calling a loopback server - Chrome sends this preflight header and expects
  // the mirror. Harmless for local pages.
  if (req.headers["access-control-request-private-network"] === "true") {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
}

const server = http.createServer(async (req, res) => {
  applyCors(req, res);
  if (req.method === "OPTIONS") {
    res.writeHead(isAllowedOrigin(req.headers["origin"]) ? 204 : 403);
    res.end();
    return;
  }
  try {
    checkRequestOrigin(req);
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/health") {
      // `images` lets clients detect that this build accepts image_url parts.
      sendJson(res, 200, { ok: true, images: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/v1/models") {
      handleModels(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
      await handleChatCompletions(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/ask") {
      await handleAsk(req, res);
      return;
    }

    throw new HttpError(404, "Not found. See README for available endpoints.");
  } catch (err) {
    // The client may already be gone (e.g. a fetch abort surfaces here as
    // our own HttpError(499)) - writing to a destroyed/ended response can
    // throw and would otherwise crash the whole server on an unhandled
    // rejection, so guard it like any other best-effort error response.
    if (res.destroyed || res.writableEnded) return;
    if (res.headersSent) {
      res.end();
      return;
    }
    const status = err instanceof HttpError ? err.status : 500;
    try {
      sendJson(res, status, {
        error: { message: err.message || "Internal error", type: "server_error" },
      });
    } catch {
      // Response is unusable (socket gone) - nothing more we can do.
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`claude-server listening on http://${HOST}:${PORT}`);
  console.log(`  OpenAI-compatible:`);
  console.log(`    GET  /v1/models`);
  console.log(`    POST /v1/chat/completions   (supports "stream": true)`);
  console.log(`  Legacy:`);
  console.log(`    POST /ask`);
  console.log(`    GET  /health`);
  if (AUTH_TOKEN) console.log("  Auth: Bearer token required");
  console.log(ALLOW_TOOLS ? "  Tools: ENABLED by request (CLAUDE_SERVER_ALLOW_TOOLS=1)" : "  Tools: disabled (text-only answers)");
  console.log(`  Browser origins: localhost, file://, ${[...EXTRA_ORIGINS].join(", ")}`);
});
