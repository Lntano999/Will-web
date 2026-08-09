@echo off
setlocal
cd /d "%~dp0"
node scripts\manual-preview.mjs
if errorlevel 1 (
  echo.
  echo Will-web preview failed. Review the error above.
  pause
)
