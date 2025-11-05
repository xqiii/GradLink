import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Card, Table, Button, Modal, Form, Input, message, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined, TableOutlined } from '@ant-design/icons';
import apiClient from '../utils/axios';
import { useNavigate } from 'react-router-dom';

// 表格基本样式设置

const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const { Option } = Select;

// 省份城市数据
const provinceCityData = {
  '北京': ['北京'],
  '上海': ['上海'],
  '广东': ['广州', '深圳', '佛山', '东莞', '中山', '珠海', '惠州', '汕头', '湛江', '江门', '茂名', '肇庆', '梅州', '汕尾', '河源', '阳江', '清远', '潮州', '揭阳', '云浮'],
  '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
  '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
  '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝', '甘孜', '凉山'],
  '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施', '仙桃', '潜江', '天门', '神农架'],
  '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西'],
  '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '济源'],
  '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
  '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
  '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
  '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
  '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '亳州', '池州', '宣城'],
  '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
  '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
  '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '大兴安岭'],
  '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'],
  '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
  '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
  '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'],
  '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南', '黔东南', '黔南'],
  '重庆': ['重庆'],
  '天津': ['天津'],
  '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南'],
  '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安', '锡林郭勒', '阿拉善'],
  '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
  '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰', '石河子', '阿拉尔', '图木舒克', '五家渠', '北屯', '铁门关', '双河', '可克达拉', '昆玉', '胡杨河', '新星'],
  '青海': ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'],
  '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
  '香港': ['香港'],
  '澳门': ['澳门'],
  '台湾': ['台北', '新北', '桃园', '台中', '台南', '高雄', '基隆', '新竹', '嘉义', '苗栗', '彰化', '南投', '云林', '嘉义', '屏东', '台东', '花莲', '宜兰', '金门', '连江']
};

// 从省份城市数据中提取所有省份
const provinces = Object.keys(provinceCityData);

const AdminPage = () => {
  const [activeKey, setActiveKey] = useState('data');
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [currentEditingId, setCurrentEditingId] = useState(null);
  const [paginationConfig, setPaginationConfig] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: total => `共 ${total} 条数据`
  });
  const navigate = useNavigate();

  // 初始化时获取数据
  useEffect(() => {
    fetchPersons();
  }, []); // 只在组件挂载时执行一次
  
  // 获取人员数据
  const fetchPersons = async (page = paginationConfig.current, pageSize = paginationConfig.pageSize) => {
    setLoading(true);
    try {
      const response = await apiClient.get('/persons', {
        params: {
          page,
          pageSize
        }
      });
      
      setPersons(response.data.persons);
      setPaginationConfig(prev => ({
        ...prev,
        current: page,
        pageSize: pageSize,
        total: response.data.total
      }));
    } catch (error) {
      console.error('获取人员数据失败:', error);
      // 401 错误会在 axios 拦截器中处理，这里不需要重复处理
      if (error.response && error.response.status !== 401) {
        message.error('获取数据失败，请检查网络连接');
      }
    } finally {
      setLoading(false);
    }
  };

  // 分页处理函数
  const handlePageChange = (page, pageSize) => {
    // 调用fetchPersons获取新页面数据，传递正确的分页参数
    fetchPersons(page, pageSize);
  };

  // 打开添加/编辑模态框
  const showModal = (mode = 'add', record = null) => {
    setIsEditMode(mode === 'edit');
    if (mode === 'edit' && record) {
      form.setFieldsValue({
          name: record.name,
          province: record.province,
          city: record.city || '',
          wechat: record.wechat,
          phone: record.phone || ''
        });
      // 设置当前编辑的记录ID
      setCurrentEditingId(record.id);
      // 设置选中的省份，以便城市下拉框能正确显示
      setSelectedProvince(record.province);
    } else {
      form.resetFields();
      setCurrentEditingId(null);
      setSelectedProvince(null);
    }
    setIsModalVisible(true);
  };

  // 关闭模态框
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedProvince(null);
    setCurrentEditingId(null);
  };

  // 处理省份选择变化
  const handleProvinceChange = (value) => {
    setSelectedProvince(value);
    // 重置城市选择
    form.setFieldValue('city', undefined);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (isEditMode) {
        // 编辑模式：调用后端更新API
        await apiClient.put(`/persons/${currentEditingId}`, values);
        message.success('更新成功');
      } else {
        // 新增模式：调用后端创建API
        await apiClient.post('/persons', values);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setSelectedProvince(null);
      // 更新数据列表，使用当前分页配置
      fetchPersons(paginationConfig.current, paginationConfig.pageSize);
    } catch (error) {
      console.error('操作失败:', error);
      if (error.response && error.response.status !== 401) {
        message.error(isEditMode ? '更新失败' : '添加失败');
      }
      // 401 错误会在 axios 拦截器中处理
    }
  };

  // 删除单个人员
  const deletePerson = async (id) => {
    try {
      await apiClient.delete(`/persons/${id}`);
      message.success('删除成功');
      fetchPersons(paginationConfig.current, paginationConfig.pageSize);
    } catch (error) {
      console.error('删除失败:', error);
      if (error.response && error.response.status !== 401) {
        message.error('删除失败');
      }
      // 401 错误会在 axios 拦截器中处理
    }
  };

  // 批量删除
  const batchDelete = async () => {
    try {
      await apiClient.post('/persons/batch-delete', {
        ids: selectedRowKeys
      });

      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchPersons(paginationConfig.current, paginationConfig.pageSize);
    } catch (error) {
      console.error('批量删除失败:', error);
      if (error.response && error.response.status !== 401) {
        message.error('批量删除失败');
      }
      // 401 错误会在 axios 拦截器中处理
    }
  };

  // 处理登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 表格列定义
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: '微信',
      dataIndex: 'wechat',
      key: 'wechat',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => {
              setSelectedRowKeys([record._id]);
              showModal('edit', record);
            }}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: `确定要删除 ${record.name} 吗？`,
                onOk: () => deletePerson(record._id)
              });
            }}
          />
        </>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        height: '64px'
      }}>
        <div>
          <Title level={4} style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 600 }}>Link Map 管理系统</Title>
        </div>
        <Button 
          type="primary" 
          danger 
          icon={<LogoutOutlined />} 
          onClick={handleLogout}
          size="middle"
        >
          退出登录
        </Button>
      </Header>
      <Layout>
        <Sider 
          width={180} 
          theme="dark"
          style={{ boxShadow: '2px 0 6px rgba(0,21,41,0.3)' }}
          breakpoint="lg"
          collapsedWidth={0}
        >
            <Menu
              mode="inline"
              selectedKeys={[activeKey]}
              onClick={({ key }) => setActiveKey(key)}
              style={{ height: '100%', borderRight: 0, paddingTop: '16px' }}
              items={[
                { 
                  key: 'data', 
                  label: '数据管理',
                  icon: <TableOutlined />
                }
              ]}
            />
          {/* 注意：已将Menu.Item子组件替换为items属性数组 */}
        </Sider>
        <Layout style={{ padding: '15px 20px', minWidth: '900px' }}>
            <Content style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
              <Card style={{ borderRadius: '8px' }}>
              <div style={{ 
                  marginBottom: '20px', 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      onClick={() => showModal('add')}
                      size="middle"
                    >
                      添加人员
                    </Button>
                    {selectedRowKeys.length > 0 && (
                      <Button 
                        danger 
                        style={{ marginLeft: '12px' }} 
                        onClick={batchDelete}
                        size="middle"
                      >
                        批量删除 ({selectedRowKeys.length})
                      </Button>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    共 {paginationConfig.total} 条数据
                  </div>
                </div>
              <Table
                rowKey="_id"
                rowSelection={rowSelection}
                columns={columns.map(col => ({
                  ...col,
                  width: col.key === 'name' ? 150 : 
                         col.key === 'province' ? 100 : 
                         col.key === 'city' ? 150 : 
                         col.key === 'wechat' ? 180 : 
                         col.key === 'action' ? 120 : undefined,
                  ellipsis: col.key !== 'action' // 非操作列添加文本溢出省略
                }))}
                dataSource={persons}
                loading={loading}
                pagination={{
                  ...paginationConfig,
                  onChange: handlePageChange,
                  onShowSizeChange: handlePageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }}
                style={{ 
                  width: '100%', 
                  tableLayout: 'fixed'
                }}
                scroll={{ x: 'max-content' }}
                size="middle"
                rowClassName={(record, index) => index % 2 === 0 ? 'table-row-even' : ''}
                bordered
              />
            </Card>
          </Content>
        </Layout>
      </Layout>

      {/* 添加/编辑模态框 */}
      <Modal
        title={isEditMode ? '编辑人员' : '添加人员'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnHidden
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请选择省份' }]}
          >
            <Select 
              placeholder="请选择省份" 
              onChange={handleProvinceChange}
              onSelect={(value) => setSelectedProvince(value)}
            >
              {provinces.map(province => (
                <Option key={province} value={province}>{province}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请选择城市' }]}
          >
            <Select 
              placeholder="请选择城市" 
              disabled={!selectedProvince}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {selectedProvince && provinceCityData[selectedProvince]?.map(city => (
                <Option key={city} value={city}>{city}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="wechat"
            label="微信号"
            rules={[{ required: true, message: '请输入微信号' }]}
          >
            <Input placeholder="请输入微信号" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: false },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              {isEditMode ? '更新' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminPage;