@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install Node.js 22.14 or Node.js 24, then try again.
  pause
  exit /b 1
)
node scripts\run-local.js %*
if errorlevel 1 (
  echo.
  echo Startup failed. See the message above.
  pause
  exit /b 1
)
