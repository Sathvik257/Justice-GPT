@echo off
REM ============================================================
REM  Justice GPT - one-click launcher (Windows)
REM  Double-click this file to run the real interactive app.
REM ============================================================
title Justice GPT
cd /d "%~dp0"

echo.
echo   Starting Justice GPT...
echo   -------------------------------------------
echo.

if not exist "node_modules" (
  echo   First run: installing dependencies. This can take a minute...
  call npm install
  echo.
)

echo   Launching the app. A browser tab will open at:
echo       http://localhost:5173
echo.
echo   Keep THIS window open while you use the app.
echo   To stop the app: close this window, or press Ctrl+C.
echo.

REM Open the browser a few seconds after the server starts.
start "" /b cmd /c "timeout /t 4 /nobreak >nul & start "" http://localhost:5173"

call npm run dev

echo.
echo   The app has stopped. You can close this window.
pause
