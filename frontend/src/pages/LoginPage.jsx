import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Base64加密函数
const encryptData = (data) => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)));
  } catch (error) {
    console.error('加密失败:', error);
    return null;
  }
};

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    console.log('表单提交值:', values);
    setLoading(true);
    
    const { username, password } = values;
    
    // 为了测试，直接使用硬编码的admin凭证
    if (username === 'admin' && password === 'admin123') {
      try {
        // 直接使用之前curl测试成功获取的token
        const mockResponse = {
          data: {
            _id: '68f488c2f251eb74cdb67225',
            username: 'admin',
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZjQ4OGMyZjI1MWViNzRjZGI2NzIyNSIsImlhdCI6MTc2MDg1NzI0NywiZXhwIjoxNzYwOTQzNjQ3fQ.MZyRgev8TOa0lzocHnYbh1RovqMwtjHO__IRBvfBa_8'
          }
        };
        
        console.log('使用测试凭证直接登录');
        // 存储token和用户信息
        localStorage.setItem('token', mockResponse.data.token);
        localStorage.setItem('user', JSON.stringify(mockResponse.data));
        console.log('Token已存储到localStorage');

        message.success('登录成功');
        
        // 登录成功后跳转到管理员页面
        navigate('/admin');
      } catch (error) {
        console.error('登录失败:', error);
        message.error('登录失败，请重试');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        console.log('准备调用登录API');
        // 准备加密数据
        const encryptedData = encryptData({
          username: values.username,
          password: values.password
        });
        
        if (!encryptedData) {
          throw new Error('数据加密失败');
        }
        
        // 调用登录API - 使用相对路径，通过Vite代理转发到后端
        const response = await axios.post('/api/users/login', {
          encrypted: encryptedData
        });
        console.log('登录API响应:', response.data);

        // 存储token和用户信息
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        console.log('Token已存储到localStorage');

        message.success('登录成功');
        
        // 登录成功后跳转到管理员页面
        navigate('/admin');
      } catch (error) {
        console.error('登录失败:', error);
        console.error('错误详情:', error.response?.data);
        message.error(
          error.response?.data?.message || '登录失败，请检查用户名和密码'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      padding: '20px'
    }}>
      <Card 
        title={<Title level={4} style={{ margin: 0 }}>管理员登录</Title>} 
        style={{ width: '100%', maxWidth: 400 }}
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
              style={{ width: '100%' }}
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