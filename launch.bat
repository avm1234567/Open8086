@echo off
title EMU8086 PRO Launcher
echo Starting EMU8086 PRO...

:: Try launching in Edge App Mode (looks like a native desktop window)
start "" msedge.exe --app="file:///%~dp0index.html" 2>nul
if %ERRORLEVEL% EQU 0 exit /b

:: Try Google Chrome App Mode
start "" chrome.exe --app="file:///%~dp0index.html" 2>nul
if %ERRORLEVEL% EQU 0 exit /b

:: Fallback to default browser
start "" "%~dp0index.html"
exit /b
