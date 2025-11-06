@echo off
REM GradLink 统一启动脚本 (Windows)
REM 用于同时启动前后端服务

echo ========================================
echo   GradLink 应用启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查依赖是否已安装
if not exist "backend\node_modules" (
    echo 后端依赖未安装，正在安装...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 前端依赖未安装，正在安装...
    cd frontend
    call npm install
    cd ..
)

echo 正在启动服务...
echo.

REM 使用 concurrently 启动
if exist "node_modules\concurrently" (
    call npx concurrently --names "后端,前端" --prefix-colors "blue,green" "cd backend && npm start" "cd frontend && npm run dev"
) else (
    echo 正在安装 concurrently...
    call npm install concurrently --save-dev
    call npx concurrently --names "后端,前端" --prefix-colors "blue,green" "cd backend && npm start" "cd frontend && npm run dev"
)

pause

