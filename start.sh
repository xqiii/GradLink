#!/bin/bash

# GradLink 统一启动脚本
# 用于同时启动前后端服务

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GradLink 应用启动脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}错误: 未检测到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi

# 检查依赖是否已安装
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}后端依赖未安装，正在安装...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}前端依赖未安装，正在安装...${NC}"
    cd frontend && npm install && cd ..
fi

# 检查 MongoDB 是否运行（可选）
if ! command -v mongosh &> /dev/null && ! docker ps | grep -q mongodb; then
    echo -e "${YELLOW}警告: 未检测到 MongoDB 服务，请确保 MongoDB 已启动${NC}"
fi

echo -e "${GREEN}正在启动服务...${NC}"
echo ""

# 启动后端和前端
cd "$(dirname "$0")"

# 使用 concurrently 启动
if command -v npx &> /dev/null; then
    # 确保 concurrently 已安装
    if [ ! -d "node_modules/concurrently" ]; then
        echo -e "${YELLOW}正在安装 concurrently...${NC}"
        npm install concurrently --save-dev
    fi
    
    npx concurrently \
        --names "后端,前端" \
        --prefix-colors "blue,green" \
        "cd backend && npm start" \
        "cd frontend && npm run dev"
else
    # 如果没有 concurrently，使用后台进程
    echo -e "${BLUE}启动后端服务...${NC}"
    cd backend && npm start &
    BACKEND_PID=$!
    
    echo -e "${GREEN}启动前端服务...${NC}"
    cd ../frontend && npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo -e "${GREEN}服务已启动！${NC}"
    echo -e "${BLUE}后端: http://localhost:5050${NC}"
    echo -e "${GREEN}前端: http://localhost:5173${NC}"
    echo ""
    echo "按 Ctrl+C 停止所有服务"
    
    # 等待用户中断
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
fi

