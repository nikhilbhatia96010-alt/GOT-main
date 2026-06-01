@echo off
setlocal

cd /d "%~dp0vite-project"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
)

echo Starting GOT app...
call npm.cmd run dev -- --host 127.0.0.1

pause
