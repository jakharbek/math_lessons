@echo off
rem Запуск claude-server для курса «Математика по косточкам».
rem Нужны Node.js 18+ и выполненный вход: claude login
cd /d "%~dp0"
echo claude-server: http://127.0.0.1:8137  (сайт курса, localhost и file:// разрешены по умолчанию)
node server.js
pause
