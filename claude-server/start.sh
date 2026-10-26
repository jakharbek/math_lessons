#!/usr/bin/env sh
# Запуск claude-server для курса «Математика по косточкам».
# Нужны Node.js 18+ и выполненный вход: claude login
cd "$(dirname "$0")"
echo "claude-server: http://127.0.0.1:8137  (сайт курса, localhost и file:// разрешены по умолчанию)"
exec node server.js
