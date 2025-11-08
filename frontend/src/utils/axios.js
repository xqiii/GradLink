import axios from 'axios';
import { message } from 'antd';

// 获取 API 基础 URL
// 开发环境使用代理（相对路径），生产环境使用环境变量配置的完整 URL
const getBaseURL = () => {
  // 如果设置了 VITE_API_BASE_URL 且不在开发环境，使用环境变量
  if (import.meta.env.VITE_API_BASE_URL && import.meta.env.MODE === 'production') {
    return import.meta.env.VITE_API_BASE_URL + '/api';
  }
  // 开发环境使用代理
  return '/api';
};

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 自动添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      // 清除本地存储的 token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 如果不在登录页面，则跳转到登录页
      if (window.location.pathname !== '/login') {
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

