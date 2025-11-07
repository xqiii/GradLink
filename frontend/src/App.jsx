import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';

// 导入页面组件（稍后实现）
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import MapPage from './pages/MapPage';
import PrivateRoute from './components/PrivateRoute';

const { Header, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className="app-layout">
        <Header className="app-header">
          <div className="logo">
            <h1 className="text-white m-0">中国地区同学分布</h1>
          </div>
        </Header>
        <Content className="app-content">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            } />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
