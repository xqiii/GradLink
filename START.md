# 项目启动说明

## 前提条件

确保你已安装以下软件：
- Node.js (v16.x或更高版本)
- npm 或 yarn
- MongoDB (推荐使用Docker运行，详见下方说明)
- Docker (可选，推荐用于运行MongoDB)

## 安装步骤

### 1. 克隆项目（如果适用）

```bash
git clone <项目仓库地址>
cd link-map
```

### 2. 安装依赖

#### 后端依赖

```bash
cd backend
npm install
```

#### 前端依赖

```bash
cd ../frontend
npm install
```

### 3. 配置环境变量

确保在项目根目录有 `.env` 文件，内容如下：

```
# 开发环境配置
NODE_ENV=development

# 数据库连接信息 (使用认证)
MONGO_URI=mongodb://admin:password@localhost:27017/link-map-dev?authSource=admin
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DBNAME=link-map-dev

# JWT密钥
JWT_SECRET=your_jwt_secret_key_for_development

# 服务器配置
SERVER_PORT=5001
SERVER_HOST=localhost

# 前端配置
FRONTEND_URL=http://localhost:3000
```

### 4. 启动MongoDB服务

#### 方式1：使用Docker运行MongoDB（推荐）

```bash
# 拉取并运行MongoDB容器（带认证）
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:latest

# 查看容器状态
docker ps

# 如果需要停止容器
docker stop mongodb

# 如果需要重启容器
docker restart mongodb
```

#### 方式2：本地安装MongoDB

```bash
# 对于Mac用户
brew services start mongodb-community

# 或者直接运行mongod
mongod --auth
```

## 数据库连接故障排除

如果遇到数据库连接问题，请检查：

1. **MongoDB服务状态**：
   - 使用Docker: `docker ps` 确保容器正在运行
   - 本地安装: `brew services list` 或检查mongod进程

2. **连接配置**：
   - 确保.env文件中的MONGO_URI格式正确
   - 用户名和密码必须与MongoDB配置一致
   - 数据库名称是否正确

3. **端口访问**：
   - 确认27017端口未被占用
   - 检查防火墙设置

4. **特殊情况处理**：
   - 如果暂时无法连接MongoDB，后端服务仍然可以启动，但数据相关功能将不可用
   - 系统会提供友好的错误提示，不会崩溃

## 运行项目

### 启动后端服务

```bash
cd backend
npm run dev  # 使用nodemon启动开发服务器
# 或者
npm start    # 直接启动服务器
```

后端服务将运行在 `http://localhost:5000`

### 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将运行在 `http://localhost:3000`

## 初始化管理员账户

在首次运行时，你需要创建一个管理员账户。你可以通过API调用来完成：

```bash
curl -X POST http://localhost:5001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

或者直接通过前端的登录页面尝试注册功能。

## 访问应用

- **地图展示页面**：http://localhost:3000/
- **管理员登录页面**：http://localhost:3000/login
- **管理员后台**：http://localhost:3000/admin (登录后访问)

## 项目结构说明

### 后端
- `/backend/src/models` - 数据库模型
- `/backend/src/controllers` - 控制器逻辑
- `/backend/src/routes` - API路由
- `/backend/src/middleware` - 中间件
- `/backend/src/utils` - 工具函数

### 前端
- `/frontend/src/pages` - 页面组件
- `/frontend/src/components` - 通用组件
- `/frontend/src/services` - API服务
- `/frontend/src/redux` - Redux状态管理
- `/frontend/src/utils` - 工具函数

## 后续开发

1. 前后端集成测试
2. 添加完整的地图数据文件
3. 优化性能和用户体验
4. 安全性增强
5. 生产环境部署