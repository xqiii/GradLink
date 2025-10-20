import { Navigate, Outlet } from 'react-router-dom';

// 检查用户是否已登录
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // 如果未登录，重定向到登录页面
    return <Navigate to="/login" replace />;
  }

  // 如果已登录，渲染子组件或Outlet
  return children || <Outlet />;
};

export default PrivateRoute;