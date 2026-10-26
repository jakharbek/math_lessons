#!/usr/bin/env python
"""Локальный сервер курса: python tools/serve.py [--port 8000] [--no-open] [--no-assistant]

Страницы курса открываются и напрямую с диска (file://), но через сервер
надёжнее работают браузерные API (снимок экрана для ИИ-наставника).
Сервер отдаёт файлы с правильными MIME-типами (в Windows реестр иногда
подменяет тип .js) и отключает кэширование, чтобы правки были видны сразу.

Вместе с курсом запускается локальный сервер ИИ-ассистента (claude-server, порт 8137):
он нужен кнопке «Спросить ИИ» в уроках (тот же сервер обслуживает и курс по бустингу).
Для него требуются Node.js 18+ и выполненный вход `claude login`; без них курс работает как обычно, просто без ассистента.
"""

from __future__ import annotations

import argparse
import functools
import http.server
import os
import shutil
import socket
import socketserver
import subprocess
import tempfile
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ASSISTANT_SERVER = ROOT / "claude-server" / "server.js"
ASSISTANT_PORT = int(os.environ.get("CLAUDE_SERVER_PORT", "8137"))

TYPES = {
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".md": "text/plain; charset=utf-8",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, **TYPES}

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:
        if len(args) > 1 and str(args[1]).startswith(("4", "5")):
            super().log_message(fmt, *args)


def start_assistant() -> subprocess.Popen | None:
    """Запустить claude-server, если он есть и ещё не запущен. Возвращает процесс (или None)."""
    if not ASSISTANT_SERVER.exists():
        return None
    with socket.socket() as sock:
        sock.settimeout(0.5)
        if sock.connect_ex(("127.0.0.1", ASSISTANT_PORT)) == 0:
            print(f"ИИ-ассистент: сервер уже работает на порту {ASSISTANT_PORT}")
            return None
    node = shutil.which("node")
    if not node:
        print("ИИ-ассистент выключен: не найден Node.js (нужен 18+). Курс работает и без него.")
        return None
    if not shutil.which(os.environ.get("CLAUDE_BIN", "claude")):
        print("ИИ-ассистент выключен: не найден Claude Code CLI "
              "(npm install -g @anthropic-ai/claude-code, затем claude login).")
        return None
    # Рабочая папка — пустая временная: Claude Code не подхватывает инструкции проекта (AGENTS.md),
    # и рядом с моделью нет файлов курса — она отвечает только по контексту, который прислала страница.
    workdir = Path(tempfile.gettempdir()) / "mathcourse-assistant"
    workdir.mkdir(exist_ok=True)
    proc = subprocess.Popen([node, str(ASSISTANT_SERVER)], cwd=workdir,
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"ИИ-ассистент: claude-server запущен на http://127.0.0.1:{ASSISTANT_PORT} "
          "(кнопка «Спросить ИИ» в уроках)")
    return proc


def main() -> None:
    import sys

    for stream in (sys.stdout, sys.stderr):  # кириллица в консоли Windows
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description="Локальный сервер курса")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--no-open", action="store_true", help="не открывать браузер")
    ap.add_argument("--no-assistant", action="store_true", help="не запускать сервер ИИ-ассистента (claude-server)")
    args = ap.parse_args()
    handler = functools.partial(Handler, directory=str(ROOT))
    socketserver.TCPServer.allow_reuse_address = True
    assistant = None
    try:
        with socketserver.ThreadingTCPServer(("127.0.0.1", args.port), handler) as httpd:
            url = f"http://127.0.0.1:{args.port}/index.html"
            print(f"Курс доступен по адресу {url}\nОстановить: Ctrl+C")
            if not args.no_assistant:
                assistant = start_assistant()
            if not args.no_open:
                webbrowser.open(url)
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nСервер остановлен.")
    finally:
        if assistant and assistant.poll() is None:
            assistant.terminate()


if __name__ == "__main__":
    main()
