import axios from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: '/api', // 使用相对路径，通过 Vite 代理转发
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

