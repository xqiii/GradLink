import { useState, useEffect, useRef } from 'react';
import { Spin, Card, List, Modal, message, Button, Avatar, Tag, Empty } from 'antd';
import { UserOutlined, WechatOutlined, EnvironmentOutlined, CloseOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import apiClient from '../utils/axios';

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
      // 使用 setTimeout 确保 DOM 完全渲染后再初始化
      const timer = setTimeout(() => {
        initChart();
      }, 100);
      return () => clearTimeout(timer);
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
      // 从后端API获取按省份统计的数据
      const response = await apiClient.get('/persons/stats/province');
      setMapData(response.data);
    } catch (error) {
      console.error('获取地图数据失败:', error);
      // 401 错误会在 axios 拦截器中处理
      if (error.response && error.response.status !== 401) {
        message.error('获取地图数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化图表实例
  const initChart = async () => {
    // 确保容器有尺寸后再初始化
    if (!mapRef.current) return;
    
    // 等待下一个事件循环，确保 DOM 完全渲染
    await new Promise(resolve => setTimeout(resolve, 100));
    
    chartInstance.current = echarts.init(mapRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    
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
      // 配置绘图区域，确保地图占满整个容器
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        containLabel: false
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#d9d9d9', // 浅灰色边框
        borderWidth: 2,
        borderRadius: 8,
        padding: [12, 16],
        textStyle: {
          color: '#333',
          fontSize: 14,
          fontWeight: 500
        },
        formatter: function(params) {
          const value = params.value || 0;
          const color = value > 30 ? '#ff4d4f' : value > 15 ? '#fa8c16' : value > 5 ? '#1890ff' : '#52c41a';
          return `
            <div style="padding: 4px 0;">
              <div style="font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">
                ${params.name}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${color};"></span>
                <span style="font-size: 18px; font-weight: bold; color: ${color};">
                  ${value} 人
                </span>
              </div>
            </div>
          `;
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);'
      },
      visualMap: {
        min: 0,
        max: 50,
        text: ['高', '低'],
        calculable: true,
        left: 'left',
        bottom: 'bottom',
        itemWidth: 14,
        itemHeight: 150,
        inRange: {
          // 使用更生动的渐变色：从浅蓝到深蓝，再到橙色和红色
          color: [
            '#e6f7ff',  // 极浅蓝
            '#91d5ff',  // 浅蓝
            '#40a9ff',  // 中蓝
            '#1890ff',  // 标准蓝
            '#096dd9',  // 深蓝
            '#0050b3',  // 更深蓝
            '#fa8c16',  // 橙色
            '#ff4d4f'   // 红色
          ]
        },
        textStyle: {
          fontSize: 11,
          fontWeight: 500,
          color: '#666'
        },
        borderColor: '#d9d9d9', // 浅灰色边框
        borderWidth: 1,
        itemGap: 5,
        padding: [10, 5]
      },
      series: [
        {
          name: '人员数量',
          type: 'map',
          map: 'china',
          // 明确设置地图在容器中的位置和大小，使其充分利用容器但不超出
          layoutCenter: ['50%', '50%'], // 地图中心点
          // 使用 auto 让地图自动适应容器大小，或者使用更大的百分比
          layoutSize: 'auto', // 自动适应容器大小，充分利用空间
          // aspectScale 控制地图的宽高比，根据容器调整
          aspectScale: 0.75, // 保持中国地图的宽高比
          roam: true, // 允许缩放和平移
          // 默认显示省份名称
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 500,
            color: '#1f2937',
            textBorderColor: '#fff',
            textBorderWidth: 2
          },
          // 添加地图边框样式 - 更生动的视觉效果
          itemStyle: {
            areaColor: '#e6f7ff',
            borderColor: '#8c8c8c', // 更明显的灰色边框，便于区分各个地区
            borderWidth: 2, // 增加边框宽度，使边界更清晰
            shadowBlur: 8,
            shadowColor: 'rgba(140, 140, 140, 0.4)', // 对应的灰色阴影
            shadowOffsetX: 1,
            shadowOffsetY: 1
          },
          // 鼠标悬停效果 - 更醒目的高亮
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#fff',
              textBorderColor: '#595959', // 更深的灰色，增强对比
              textBorderWidth: 3
            },
            itemStyle: {
              areaColor: '#4A71C0',
              borderColor: '#595959', // 更明显的灰色边框
              borderWidth: 2.5, // 悬停时边框更粗
              shadowBlur: 30,
              shadowColor: 'rgba(89, 89, 89, 0.6)', // 对应的灰色阴影
              shadowOffsetX: 0,
              shadowOffsetY: 0
            }
          },
          // 添加高亮区域的动画效果
          animationDuration: 800,
          animationEasing: 'cubicOut',
          // 添加选中状态样式
          select: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'normal', // 不使用加粗，保持清晰可读
              color: '#fff'
            },
            itemStyle: {
              areaColor: '#2563eb',
              borderColor: '#595959', // 更明显的灰色边框
              borderWidth: 2.5 // 选中时边框更粗
            }
          },
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

    // 强制调整大小，确保地图占满容器
    setTimeout(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    }, 200);

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
    // 先取消之前选中的省份
    if (chartInstance.current && selectedProvince) {
      chartInstance.current.dispatchAction({
        type: 'unselect',
        name: selectedProvince
      });
    }
    
    // 选中当前点击的省份
    if (chartInstance.current) {
      chartInstance.current.dispatchAction({
        type: 'select',
        name: params.name
      });
    }
    
    setSelectedProvince(params.name);
    setLoading(true);
    
    try {
      // 从后端API获取指定省份的人员数据
      const response = await apiClient.get('/persons', {
        params: {
          province: params.name
        }
      });
      setProvincePersons(response.data);
    } catch (error) {
      console.error('获取省份人员数据失败:', error);
      // 401 错误会在 axios 拦截器中处理
      if (error.response && error.response.status !== 401) {
        message.error('获取人员数据失败');
      }
    } finally {
      setLoading(false);
      setProvinceModalVisible(true);
    }
  };

  return (
    <div className="p-0 m-0 w-full h-full flex-1 relative overflow-hidden flex flex-col bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2]">
      {/* 地图容器，占满整个空间 */}
      <Card 
        className="w-full h-full border-0 shadow-none rounded-none p-0 m-0 flex flex-col bg-transparent overflow-hidden"
        bodyStyle={{
          padding: 0,
          margin: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        <Spin 
          spinning={loading} 
          tip="加载地图中..." 
          className="w-full h-full flex-1 flex flex-col"
          wrapperClassName="map-spin-wrapper"
        >
          <div 
            ref={mapRef} 
            className="w-full h-full flex-1 p-0 m-0 box-border"
          />
        </Spin>
      </Card>

      {/* 省份人员信息弹窗 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EnvironmentOutlined className="text-[#4A71C0]" />
            <span className="text-lg font-semibold">{selectedProvince || ''} 人员信息</span>
            <Tag color="blue" className="ml-2">
              共 {provincePersons.length} 人
            </Tag>
          </div>
        }
        open={provinceModalVisible}
        onCancel={() => {
          setProvinceModalVisible(false);
          // 关闭弹窗时取消地图选中状态
          if (chartInstance.current && selectedProvince) {
            chartInstance.current.dispatchAction({
              type: 'unselect',
              name: selectedProvince
            });
          }
        }}
        width={700}
        className="person-modal"
        footer={[
          <Button 
            key="close" 
            type="primary"
            icon={<CloseOutlined />}
            onClick={() => {
              setProvinceModalVisible(false);
              // 关闭弹窗时取消地图选中状态
              if (chartInstance.current && selectedProvince) {
                chartInstance.current.dispatchAction({
                  type: 'unselect',
                  name: selectedProvince
                });
              }
            }}
            className="px-6"
          >
            关闭
          </Button>
        ]}
      >
        <Spin spinning={loading}>
          {provincePersons.length === 0 && !loading ? (
            <Empty
              description="暂无人员数据"
              className="py-12"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={provincePersons}
              className="person-list"
              renderItem={(person, index) => (
                <List.Item 
                  key={person._id}
                  className="!px-4 !py-3 hover:bg-gray-50 transition-colors duration-200 rounded-lg mb-2 border border-gray-100 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start w-full gap-4">
                    {/* 头像 */}
                    <Avatar 
                      size={56}
                      src={`https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=${person.name}`}
                      icon={<UserOutlined />}
                      className="flex-shrink-0 border-2 border-[#4A71C0]/20"
                    />
                    
                    {/* 信息区域 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 m-0">
                          {person.name}
                        </h3>
                        <Tag color="blue" className="text-xs">
                          #{index + 1}
                        </Tag>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <WechatOutlined className="text-green-500" />
                          <span className="text-sm font-medium">微信：</span>
                          <span className="text-sm">{person.wechat}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <EnvironmentOutlined className="text-blue-500" />
                          <span className="text-sm font-medium">城市：</span>
                          <Tag color="geekblue" className="m-0">
                            {person.city || '未知'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default MapPage;