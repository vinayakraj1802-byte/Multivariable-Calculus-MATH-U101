@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 24 LTS, then run this file again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed. Check the connection and try again.
    pause
    exit /b 1
  )
)
echo Open http://localhost:3000 after the server is ready.
call npm run dev -- --host 127.0.0.1
pause
