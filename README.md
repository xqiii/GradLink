# 🗺️ GradLink - 中国地区毕业同学去向应用

<div align="center">

<img src="frontend/public/logo.svg" alt="GradLink Logo" width="120" height="120" />

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.0-blue.svg)

一个专门用于展示中国地区毕业同学去向的可视化应用平台

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [Docker 部署](#-docker-部署) • [项目结构](#-项目结构) • [技术栈](#-技术栈) • [许可证](#-许可证)

</div>

---

## 📖 项目简介

**GradLink** 是一个基于 React 和 Node.js 开发的中国地区毕业同学去向可视化应用。该项目旨在帮助同学更好地了解同学的就业趋势、行业分布和地理流向。

> ⚠️ **注意**：该项目完全使用 AI 开发，不涉及任何商业用途。

---

## 📸 项目预览

<div align="center">

![项目预览](assets/map-preview.png)
![](assets/detail.png)
![](assets/login.png)
![](assets/admin.png)

*中国地区毕业同学分布地图可视化界面*

</div>

---

## ✨ 功能特性

- 🗺️ **交互式地图可视化** - 基于 ECharts 的中国地图，支持缩放、平移和省份点击
- 📊 **数据统计展示** - 按省份统计人员分布，直观展示数据
- 🎨 **现代化界面设计** - 美观的渐变背景和流畅的动画效果
- 🔐 **用户认证系统** - 基于 JWT 的安全认证机制
- 👥 **人员信息管理** - 支持查看和管理各省份的人员详细信息
- 📱 **响应式设计** - 适配不同屏幕尺寸的设备

---

## 🚀 快速开始

### 前提条件

确保你的开发环境已安装以下软件：

- **Node.js** (v16.x 或更高版本)
- **npm** 或 **yarn**
- **MongoDB** (推荐使用 Docker 运行)
- **Docker** (可选，推荐用于运行 MongoDB)

### 安装步骤

#### 1. 克隆项目

```bash
git clone <项目仓库地址>
cd link-map
```

#### 2. 安装依赖

**方式一：使用统一安装脚本（推荐）**

```bash
# 在项目根目录执行
npm run install:all
```

**方式二：分别安装**

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

#### 3. 配置环境变量

在**项目根目录**创建 `.env` 文件：

```env
# 开发环境配置
NODE_ENV=development

# 数据库连接信息
MONGO_URI=mongodb://admin:password@localhost:27017/link-map-dev?authSource=admin

# JWT密钥（建议使用复杂随机字符串）
JWT_SECRET=your_jwt_secret_key_for_development

# JWT过期时间（可选）
JWT_EXPIRES_IN=7d
```

#### 4. 启动 MongoDB

**使用 Docker（推荐）：**

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest
```

**或使用本地 MongoDB：**

确保 MongoDB 服务正在运行。

#### 5. 启动应用

**方式一：统一启动（推荐）**

```bash
# 在项目根目录执行，同时启动前后端
npm start

# 或使用开发模式（支持热重载）
npm run dev

# 或使用启动脚本（Linux/macOS）
./start.sh

# Windows 用户
start.bat
```

**方式二：分别启动**

```bash
# 启动后端服务
npm run start:backend
# 或
cd backend && npm start

# 启动前端应用（新终端窗口）
npm run start:frontend
# 或
cd frontend && npm run dev
```

**服务地址：**
- 后端服务：`http://localhost:5050`
- 前端应用：`http://localhost:5173`

### 📝 详细启动说明

更多详细的启动说明和配置选项，请参考 [START.md](START.md) 文件。

---

## 🐳 Docker 部署

使用 Docker 可以快速部署整个应用，包括前端、后端和数据库。

### 快速部署

```bash
# 1. 配置环境变量
cp env.example .env
# 编辑 .env 文件，设置必要的环境变量

# 2. 启动所有服务
docker-compose up -d

# 3. 查看服务状态
docker-compose ps
```

### 详细文档

完整的 Docker 部署文档，包括配置说明、常见问题和生产环境优化，请参考 [DOCKER.md](DOCKER.md) 文件。

---

## 📁 项目结构

```
link-map/
├── backend/                 # 后端服务代码
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由定义
│   │   ├── utils/         # 工具函数
│   │   └── server.js      # 服务器入口
│   └── package.json
│
├── frontend/               # 前端应用代码
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   ├── redux/         # 状态管理
│   │   ├── services/      # API 服务
│   │   └── utils/         # 工具函数
│   └── package.json
│
├── config/                 # 配置文件目录
│   ├── development/       # 开发环境配置
│   └── production/       # 生产环境配置
│
├── assets/                # 项目资源文件（图片等）
├── docs/                  # 项目文档
├── LICENSE                # MIT 许可证
├── README.md              # 项目说明文档
├── START.md               # 启动说明文档
└── LIST.md                # 开发计划文档
```

---

## 🛠️ 技术栈

### 前端技术

- **React 18** - 用户界面框架
- **Vite** - 现代化构建工具
- **Ant Design** - UI 组件库
- **ECharts** - 数据可视化图表库
- **Axios** - HTTP 客户端

### 后端技术

- **Node.js** - 运行时环境
- **Express** - Web 框架
- **MongoDB** - 数据库
- **Mongoose** - MongoDB 对象建模工具
- **JWT** - 身份验证

---

## 📋 开发计划

详细的开发计划和任务列表，请参考 [LIST.md](LIST.md) 文件。

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

```
MIT License

Copyright (c) 2024 GradLink Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📧 联系方式

如有问题或建议，请通过 Issue 联系我们。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！**

Made with ❤️ by GradLink Team

</div>
