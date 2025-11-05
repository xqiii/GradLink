module.exports = {
  server: {
    port: process.env.SERVER_PORT || 5050,
    host: process.env.SERVER_HOST || '0.0.0.0'
  },
  database: {
    url: process.env.MONGO_URI || process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET, // 生产环境必须设置
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  cors: {
    origin: process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : ['http://localhost:3030']
  }
};

