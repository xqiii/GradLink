const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const env = process.env.NODE_ENV || 'development';
const config = require(`../../../config/${env}/config`);

// Base64解密函数
const decryptData = (encryptedString) => {
  try {
    const decoded = decodeURIComponent(atob(encryptedString));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('解密失败:', error);
    return null;
  }
};

// 检查数据库连接状态
const checkDbConnection = () => {
  return mongoose.connection.readyState === 1; // 1表示已连接
};

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

// @desc    管理员登录
// @route   POST /api/users/login
// @access  Public
const login = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    let username, password;
    
    // 检查是否为加密数据
    if (req.body.encrypted) {
      const decryptedData = decryptData(req.body.encrypted);
      if (!decryptedData) {
        return res.status(400).json({ message: '数据解密失败，请重试' });
      }
      
      username = decryptedData.username;
      password = decryptedData.password;
    } else {
      // 向后兼容，支持未加密的请求（用于调试或旧版本前端）
      username = req.body.username;
      password = req.body.password;
    }
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '请提供用户名和密码' });
    }
    
    // 查找用户
    const user = await User.findOne({ username });
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: '无效的用户名或密码' });
    }
    
    // 生成令牌并发送响应
    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    注册管理员
// @route   POST /api/users/register
// @access  Public (仅用于初始化)
const register = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '请提供用户名和密码' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: '密码长度至少为6个字符' });
    }
    
    // 检查用户名是否已存在
    const userExists = await User.findOne({ username });
    
    if (userExists) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 创建新用户
    const user = await User.create({ username, password });
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: '无法创建用户' });
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    获取当前用户信息
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  login,
  register,
  getMe
};