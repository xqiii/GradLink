# 🐳 Docker 部署文档

本文档介绍如何使用 Docker 和 Docker Compose 部署 GradLink 应用。

---

## 📋 目录

- [前置要求](#前置要求)
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [部署步骤](#部署步骤)
- [服务说明](#服务说明)
- [常见问题](#常见问题)
- [生产环境优化](#生产环境优化)

---

## 🔧 前置要求

在开始部署之前，请确保你的系统已安装以下软件：

- **Docker** (版本 20.10 或更高)
- **Docker Compose** (版本 2.0 或更高)

### 安装 Docker

**macOS:**
```bash
# 使用 Homebrew
brew install --cask docker

# 或下载 Docker Desktop
# https://www.docker.com/products/docker-desktop
```

**Linux (Ubuntu/Debian):**
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**验证安装:**
```bash
docker --version
docker-compose --version
```

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <项目仓库地址>
cd link-map
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
# MongoDB 配置
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
MONGO_DATABASE=link-map
MONGO_PORT=27017

# 后端配置
BACKEND_PORT=5050
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:80

# 前端配置
FRONTEND_PORT=80
VITE_API_URL=http://localhost:5050
```

> ⚠️ **重要**: 生产环境请务必修改 `JWT_SECRET` 和 `MONGO_ROOT_PASSWORD` 为强密码！

### 3. 构建并启动服务

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 访问应用

- **前端应用**: http://localhost:80
- **后端 API**: http://localhost:5050
- **MongoDB**: localhost:27017

---

## ⚙️ 环境配置

### 环境变量说明

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `MONGO_ROOT_USERNAME` | MongoDB 管理员用户名 | `admin` | 否 |
| `MONGO_ROOT_PASSWORD` | MongoDB 管理员密码 | `password` | 是（生产环境） |
| `MONGO_DATABASE` | 数据库名称 | `link-map` | 否 |
| `MONGO_PORT` | MongoDB 端口 | `27017` | 否 |
| `BACKEND_PORT` | 后端服务端口 | `5050` | 否 |
| `JWT_SECRET` | JWT 密钥 | - | 是 |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `24h` | 否 |
| `FRONTEND_URL` | 前端访问地址 | `http://localhost:80` | 否 |
| `FRONTEND_PORT` | 前端服务端口 | `80` | 否 |
| `VITE_API_URL` | 前端 API 地址 | `http://localhost:5050` | 否 |

### 生产环境配置示例

```env
# 生产环境 .env 文件
NODE_ENV=production

# MongoDB - 使用强密码
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=YourVerySecurePassword123!
MONGO_DATABASE=link-map-prod
MONGO_PORT=27017

# 后端 - 使用强 JWT 密钥
BACKEND_PORT=5050
JWT_SECRET=YourSuperSecretJWTKeyForProduction123456789
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com

# 前端
FRONTEND_PORT=80
VITE_API_URL=https://api.yourdomain.com
```

---

## 📦 部署步骤

### 方式一：使用 Docker Compose（推荐）

#### 1. 构建镜像

```bash
# 构建所有服务镜像
docker-compose build

# 或只构建特定服务
docker-compose build backend
docker-compose build frontend
```

#### 2. 启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 启动并查看日志
docker-compose up

# 启动特定服务
docker-compose up -d mongodb backend
```

#### 3. 查看服务状态

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 4. 停止服务

```bash
# 停止所有服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v
```

### 方式二：单独部署服务

#### 部署 MongoDB

```bash
docker run -d \
  --name link-map-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:7
```

#### 部署后端

```bash
# 构建镜像
cd backend
docker build -t link-map-backend .

# 运行容器
docker run -d \
  --name link-map-backend \
  -p 5050:5050 \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb://admin:password@host.docker.internal:27017/link-map?authSource=admin \
  -e JWT_SECRET=your_jwt_secret \
  --link link-map-mongodb:mongodb \
  link-map-backend
```

#### 部署前端

```bash
# 构建镜像
cd frontend
docker build -t link-map-frontend .

# 运行容器
docker run -d \
  --name link-map-frontend \
  -p 80:80 \
  --link link-map-backend:backend \
  link-map-frontend
```

---

## 🏗️ 服务说明

### 服务架构

```
┌─────────────┐
│   Frontend  │ (Nginx + React)
│   Port: 80  │
└──────┬──────┘
       │ HTTP
       │ /api/*
       ▼
┌─────────────┐
│   Backend   │ (Node.js + Express)
│  Port: 5050 │
└──────┬──────┘
       │ MongoDB
       ▼
┌─────────────┐
│   MongoDB   │
│ Port: 27017 │
└─────────────┘
```

### 服务详情

#### 1. MongoDB 服务

- **镜像**: `mongo:7`
- **端口**: `27017`
- **数据持久化**: Docker Volume `mongodb_data`
- **健康检查**: 自动检测 MongoDB 连接状态

#### 2. 后端服务

- **基础镜像**: `node:18-alpine`
- **端口**: `5050`
- **依赖**: MongoDB 服务
- **健康检查**: HTTP 健康检查端点

#### 3. 前端服务

- **构建阶段**: `node:18-alpine` (构建 React 应用)
- **运行阶段**: `nginx:alpine` (提供静态文件服务)
- **端口**: `80`
- **特性**: 
  - SPA 路由支持
  - API 代理
  - Gzip 压缩
  - 静态资源缓存

---

## 🔍 常见问题

### 1. 端口冲突

如果端口已被占用，修改 `.env` 文件中的端口配置：

```env
MONGO_PORT=27018
BACKEND_PORT=5051
FRONTEND_PORT=8080
```

### 2. MongoDB 连接失败

检查 MongoDB 服务是否正常运行：

```bash
# 查看 MongoDB 日志
docker-compose logs mongodb

# 测试 MongoDB 连接
docker-compose exec mongodb mongosh -u admin -p password
```

### 3. 前端无法访问后端 API

检查以下几点：

1. **nginx 配置**: 确保 `nginx.conf` 中的代理配置正确
2. **CORS 配置**: 检查后端的 `FRONTEND_URL` 环境变量
3. **网络连接**: 确保前端和后端在同一 Docker 网络中

### 4. 数据持久化

MongoDB 数据存储在 Docker Volume 中，即使删除容器数据也不会丢失：

```bash
# 查看卷
docker volume ls

# 备份数据
docker run --rm -v link-map_mongodb_data:/data -v $(pwd):/backup \
  mongo:7 tar czf /backup/mongodb-backup.tar.gz /data

# 恢复数据
docker run --rm -v link-map_mongodb_data:/data -v $(pwd):/backup \
  mongo:7 tar xzf /backup/mongodb-backup.tar.gz -C /
```

### 5. 查看容器日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```

### 6. 重启服务

```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

---

## 🚀 生产环境优化

### 1. 使用 HTTPS

在生产环境中，建议使用反向代理（如 Nginx 或 Traefik）处理 HTTPS：

```nginx
# nginx 配置示例
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 资源限制

在 `docker-compose.yml` 中添加资源限制：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 3. 日志管理

配置日志轮转：

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. 健康检查

所有服务都已配置健康检查，可以使用监控工具（如 Prometheus）监控服务状态。

### 5. 备份策略

定期备份 MongoDB 数据：

```bash
# 创建备份脚本
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

docker-compose exec -T mongodb mongodump \
  --username admin \
  --password password \
  --authenticationDatabase admin \
  --archive > "$BACKUP_DIR/backup_$DATE.archive"

# 保留最近 7 天的备份
find $BACKUP_DIR -name "backup_*.archive" -mtime +7 -delete
```

---

## 📚 相关文档

- [启动说明](START.md) - 本地开发环境启动指南
- [开发计划](LIST.md) - 项目开发计划
- [README](README.md) - 项目说明文档

---

## 🆘 获取帮助

如果遇到问题，请：

1. 查看 [常见问题](#常见问题) 部分
2. 检查服务日志：`docker-compose logs -f`
3. 提交 Issue 到项目仓库

---

<div align="center">

**Happy Deploying! 🚀**

</div>

