@echo off
cd /d "%~dp0.."
set PORT=3000
call npx --no-install next dev -p 3000
