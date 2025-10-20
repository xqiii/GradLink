const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require(`../../../config/${env}/config`);

const auth = (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未提供身份验证令牌' });
    }
    
    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 将用户信息存储在请求对象中
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的身份验证令牌' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '身份验证令牌已过期' });
    }
    
    console.error('身份验证错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = auth;