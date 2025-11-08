const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量 - 从项目根目录加载 .env 文件
// __dirname 是 backend/src，所以需要回到项目根目录（../../）
const envPath = path.resolve(__dirname, '../../.env');
const result = dotenv.config({ path: envPath });

// 调试信息：检查环境变量是否加载成功
if (result.error) {
  console.warn('警告：无法加载 .env 文件:', result.error.message);
  console.warn('尝试加载的路径:', envPath);
} else {
  console.log('✓ 环境变量加载成功');
  console.log('SERVER_PORT:', process.env.SERVER_PORT);
  console.log('NODE_ENV:', process.env.NODE_ENV);
}

// 加载配置
const env = process.env.NODE_ENV || 'development';
const config = require(`../../config/${env}/config`);

// 调试信息：显示最终使用的配置
console.log('最终配置 - 端口:', config.server.port);
console.log('最终配置 - 主机:', config.server.host);

// 初始化Express应用
const app = express();

// 中间件
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由导入（稍后实现）
const userRoutes = require('./routes/userRoutes');
const personRoutes = require('./routes/personRoutes');

// 路由配置
app.use('/api/users', userRoutes);
app.use('/api/persons', personRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.json({ message: '中国地图数据可视化应用后端API' });
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// 数据库连接
async function connectDatabase() {
  try {
    await mongoose.connect(config.database.url, {
      ...config.database.options,
      serverSelectionTimeoutMS: 5000, // 连接超时设置
    });
    console.log('数据库连接成功');
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.warn('服务器将在没有数据库连接的情况下启动。请确保MongoDB服务已运行。');
    return false;
  }
}

// 启动服务器
async function startServer() {
  // 尝试连接数据库，但不阻止服务器启动
  const dbConnected = await connectDatabase();
  
  // 启动服务器
  const server = app.listen(config.server.port, () => {
    console.log(`服务器运行在 http://${config.server.host}:${config.server.port}`);
    console.log(`数据库状态: ${dbConnected ? '已连接' : '未连接'}`);
  });
  
  // 处理服务器关闭
  process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    mongoose.connection.close(false, () => {
      console.log('数据库连接已关闭');
      server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
      });
    });
  });
}

// 启动服务器
startServer();

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器内部错误' });
});

module.exports = app;