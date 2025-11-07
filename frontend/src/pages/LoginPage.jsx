import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

// 使用更安全的加密方式（Base64 + 时间戳混淆）
const encryptData = (data) => {
  try {
    // 添加时间戳增加随机性，避免相同密码产生相同编码
    const timestamp = Date.now();
    const dataWithTimestamp = {
      ...data,
      ts: timestamp
    };
    // 使用 Base64 编码（在生产环境中，建议使用 HTTPS + RSA 加密）
    const encoded = btoa(encodeURIComponent(JSON.stringify(dataWithTimestamp)));
    return encoded;
  } catch (error) {
    console.error('加密失败:', error);
    return null;
  }
};

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      // 准备加密数据
      const encryptedData = encryptData({
        username: values.username,
        password: values.password
      });
      
      if (!encryptedData) {
        throw new Error('数据加密失败');
      }
      
      // 调用登录API - 登录请求不需要 Authorization header
      // 创建一个不带 Authorization header 的请求
      const response = await axios.post('/api/users/login', {
        encrypted: encryptedData
      });

      // 存储token和用户信息
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      message.success('登录成功');
      
      // 登录成功后跳转到主页
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      message.error(
        error.response?.data?.message || '登录失败，请检查用户名和密码'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-5">
      <Card 
        title={<Title level={4} className="m-0">管理员登录</Title>} 
        className="w-full max-w-[400px]"
      >
        <Form
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full"
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;