const express = require('express');
const router = express.Router();
const { login, register, getMe } = require('../controllers/userController');
const auth = require('../middleware/auth');

// 公开路由
router.post('/login', login);
router.post('/register', register);  // 仅用于初始化管理员账户

// 需要认证的路由
router.get('/me', auth, getMe);

module.exports = router;