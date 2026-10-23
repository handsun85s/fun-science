@echo off
chcp 65001 >nul
title 趣味科学乐园 - 手机平板访问（用的时候不要关）
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   没有找到 Node.js，请先到 https://nodejs.org 下载安装，然后再双击我。
  echo.
  pause
  exit /b 1
)
node "tools\serve.js"
echo.
pause
