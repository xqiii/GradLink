import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User';

const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require(`../../../config/${env}/config`);

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

// Base64 解密（Node 环境）- 与原 JS 逻辑一致：
// 先 Base64 解码 -> 得到百分号编码字符串 -> decodeURIComponent -> JSON.parse
function decryptData(encryptedString: string): any | null {
  try {
    const percentEncoded = Buffer.from(encryptedString, 'base64').toString('utf8');
    const jsonText = decodeURIComponent(percentEncoded);
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('解密失败:', (error as Error).message);
    return null;
  }
}

// 检查数据库连接状态
function checkDbConnection(): boolean {
  return mongoose.connection.readyState === 1; // 1 表示已连接
}

// 生成 JWT 令牌
function generateToken(id: string): string {
  return jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

// @desc    管理员登录
// @route   POST /api/users/login
// @access  Public
export async function login(req: Request, res: Response): Promise<void> {
  try {
    if (!checkDbConnection()) {
      res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
      return;
    }

    let username: string | undefined;
    let password: string | undefined;

    // 支持加密载荷
    if ((req.body as any).encrypted) {
      const decryptedData = decryptData((req.body as any).encrypted);
      if (!decryptedData) {
        res.status(400).json({ message: '数据解密失败，请重试' });
        return;
      }
      username = decryptedData.username;
      password = decryptedData.password;
    } else {
      // 向后兼容未加密请求
      username = (req.body as any).username;
      password = (req.body as any).password;
    }

    if (!username || !password) {
      res.status(400).json({ message: '请提供用户名和密码' });
      return;
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401).json({ message: '无效的用户名或密码' });
      return;
    }

    res.json({
      _id: user._id,
      username: user.username,
      token: generateToken(String(user._id))
    });
  } catch (error) {
    console.error('登录错误:', (error as Error).message);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

// @desc    注册管理员
// @route   POST /api/users/register
// @access  Public (仅用于初始化)
export async function register(req: Request, res: Response): Promise<void> {
  try {
    if (!checkDbConnection()) {
      res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
      return;
    }

    const { username, password } = (req.body ?? {}) as { username?: string; password?: string };
    if (!username || !password) {
      res.status(400).json({ message: '请提供用户名和密码' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: '密码长度至少为6个字符' });
      return;
    }

    const userExists = await User.findOne({ username });
    if (userExists) {
      res.status(400).json({ message: '用户名已存在' });
      return;
    }

    const user = await User.create({ username, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        token: generateToken(String(user._id))
      });
    } else {
      res.status(400).json({ message: '无法创建用户' });
    }
  } catch (error) {
    console.error('注册错误:', (error as Error).message);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

// @desc    获取当前用户信息
// @route   GET /api/users/me
// @access  Private
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!checkDbConnection()) {
      res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
      return;
    }

    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: '未授权' });
      return;
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('获取用户信息错误:', (error as Error).message);
    res.status(500).json({ message: '服务器内部错误' });
  }
}

// CommonJS 兼容导出（供仍采用 require 的路由使用）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(module as any).exports = { login, register, getMe };


