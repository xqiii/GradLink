import { useState, useEffect, useRef } from 'react';
import { Spin, Card, List, Modal, message, Button } from 'antd';
import * as echarts from 'echarts';
import axios from 'axios';

const { Meta } = Card;

const MapPage = () => {
  const mapRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapData, setMapData] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [provincePersons, setProvincePersons] = useState([]);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);

  // 初始化地图
  useEffect(() => {
    fetchMapData();
  }, []);

  // 初始化图表
  useEffect(() => {
    if (mapData.length > 0 && mapRef.current && !chartInstance.current) {
      initChart();
    }
  }, [mapData]);
  
  // 清理图表实例和事件监听器
  useEffect(() => {
    return () => {
      if (chartInstance.current && chartInstance.current._resizeHandler) {
        window.removeEventListener('resize', chartInstance.current._resizeHandler);
      }
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  // 获取地图数据
  const fetchMapData = async () => {
    try {
      const token = localStorage.getItem('token');
      // 从后端API获取按省份统计的数据
      const response = await axios.get('/api/persons/stats/province', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMapData(response.data);
    } catch (error) {
      console.error('获取地图数据失败:', error);
      message.error('获取地图数据失败');
      // 处理401错误，跳转到登录页
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化图表实例
  const initChart = async () => {
    chartInstance.current = echarts.init(mapRef.current);
    
    try {
      // 使用ECharts内置方法加载中国地图数据
      const chinaMapUrl = 'https://cdn.jsdelivr.net/npm/echarts/map/json/china.json';
      const response = await fetch(chinaMapUrl);
      const chinaGeoJSON = await response.json();
      
      // 注册地图数据
      echarts.registerMap('china', chinaGeoJSON);
      
      setLoading(false);
    } catch (error) {
      console.error('加载地图数据失败:', error);
      message.error('加载地图数据失败，请稍后重试');
    }

    const option = {
      // 不显示标题
      title: {
        show: false
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ccc',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        },
        formatter: function(params) {
          return `<div style="padding: 8px;"><strong>${params.name}</strong><br/>人数：${params.value || 0}人</div>`;
        }
      },
      visualMap: {
        min: 0,
        max: 50,
        text: ['高', '低'],
        calculable: true,
        left: 'left',
        top: 'bottom',
        inRange: {
          // 使用更美观的颜色渐变
          color: ['#f7fbff', '#abd0e6', '#57a0ce', '#1d69b3', '#08306b']
        }
      },
      series: [
        {
          name: '人员数量',
          type: 'map',
          map: 'china',
          // 调整地图宽高
          aspectScale: 0.75,
          // 默认显示省份名称
          label: {
            show: true,
            fontSize: 12,
            color: '#333'
          },
          // 添加地图边框样式
          itemStyle: {
            areaColor: '#f5f5f5',
            borderColor: '#999',
            borderWidth: 0.8,
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          },
          // 鼠标悬停效果
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#333'
            },
            itemStyle: {
              areaColor: '#fbbf24',
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          // 添加高亮区域的动画效果
          animationDuration: 1000,
          animationEasing: 'cubicOut',
          data: mapData.map(item => ({
            name: item._id,
            value: item.count
          }))
        }
      ]
    };

    // 添加点击事件
    chartInstance.current.on('click', handleProvinceClick);

    // 设置图表选项
    chartInstance.current.setOption(option);

    // 响应式处理
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    // 存储resize函数引用以便清理
    chartInstance.current._resizeHandler = handleResize;
  };

  // 处理省份点击事件
  const handleProvinceClick = async (params) => {
    setSelectedProvince(params.name);
    setLoading(true);
    
    try {
      // 从后端API获取指定省份的人员数据
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/persons', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          province: params.name
        }
      });
      setProvincePersons(response.data);
    } catch (error) {
      console.error('获取省份人员数据失败:', error);
      message.error('获取人员数据失败');
      // 处理认证错误，跳转到登录页
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
      setProvinceModalVisible(true);
    }
  };

  return (
    <div style={{ padding: '10px', minHeight: '600px' }}>
      {/* 地图容器，恢复为更协调的布局 */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Card style={{ width: '100%', border: 'none', boxShadow: 'none' }}>
          <Spin spinning={loading} tip="加载地图中...">
            <div 
              ref={mapRef} 
              style={{ width: '100%', height: '70vh', minHeight: 500 }}
            />
          </Spin>
        </Card>
      </div>

      {/* 省份人员信息弹窗 */}
      <Modal
        title={`${selectedProvince || ''} 人员信息`}
        open={provinceModalVisible}
        onCancel={() => setProvinceModalVisible(false)}
        width={600}
        footer={[
          <Button key="close" onClick={() => setProvinceModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          <List
            bordered
            dataSource={provincePersons}
            renderItem={person => (
              <List.Item key={person._id}>
                <Meta
                  title={person.name}
                  description={
                    <div>
                      <p>微信：{person.wechat}</p>
                      <p>城市：{person.city || '未知'}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{ emptyText: '暂无人员数据' }}
          />
        </Spin>
      </Modal>
    </div>
  );
};

export default MapPage;