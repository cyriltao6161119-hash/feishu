@echo off
title 三德子 - 飞书消息服务
cd /d "%~dp0"
echo ===================================
echo  三德子 飞书消息接收服务
echo ===================================
echo.
echo 启动中...
node receiver.js
pause
