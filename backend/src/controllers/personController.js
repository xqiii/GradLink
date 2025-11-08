const Person = require('../models/Person');
const mongoose = require('mongoose');

// 检查数据库连接状态
const checkDbConnection = () => {
  return mongoose.connection.readyState === 1; // 1表示已连接
};

// @desc    获取所有人员数据
// @route   GET /api/persons
// @access  Private
const getPersons = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = req.query;
    
    // 构建查询条件
    const query = {};
    
    // 添加省份过滤条件
    if (req.query.province) {
      query.province = req.query.province;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { province: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { wechat: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 计算分页
    const skip = (page - 1) * limit;
    const total = await Person.countDocuments(query);
    
    // 执行查询
    const persons = await Person.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // 如果是按省份查询，直接返回人员数据数组
    if (req.query.province) {
      res.json(persons);
    } else {
      // 否则返回分页数据
      res.json({
        persons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    }
  } catch (error) {
    console.error('获取人员数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    根据ID获取单个人员数据
// @route   GET /api/persons/:id
// @access  Private
const getPersonById = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: '人员数据不存在' });
    }
    
    res.json(person);
  } catch (error) {
    console.error('获取单个人员数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    创建人员数据
// @route   POST /api/persons
// @access  Private
const createPerson = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const { name, province, city, wechat, location, phone } = req.body;
    
    // 验证必填字段
    if (!name || !province || !wechat) {
      return res.status(400).json({ message: '姓名、省份和微信号为必填字段' });
    }
    
    // 创建新的人员数据
    const person = await Person.create({
      name,
      phone,
      province,
      city,
      wechat,
      location
    });
    
    res.status(201).json(person);
  } catch (error) {
    console.error('创建人员数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    更新人员数据
// @route   PUT /api/persons/:id
// @access  Private
const updatePerson = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const { name, province, city, wechat, location, phone } = req.body;
    
    // 验证必填字段
    if (!name || !province || !wechat) {
      return res.status(400).json({ message: '姓名、省份和微信号为必填字段' });
    }
    
    // 查找并更新
    const person = await Person.findByIdAndUpdate(
      req.params.id,
      { name, province, city, wechat, location, phone },
      { new: true, runValidators: true }
    );
    
    if (!person) {
      return res.status(404).json({ message: '人员数据不存在' });
    }
    
    res.json(person);
  } catch (error) {
    console.error('更新人员数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    删除人员数据
// @route   DELETE /api/persons/:id
// @access  Private
const deletePerson = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const person = await Person.findByIdAndDelete(req.params.id);
    
    if (!person) {
      return res.status(404).json({ message: '人员数据不存在' });
    }
    
    res.json({ message: '人员数据已删除' });
  } catch (error) {
    console.error('删除人员数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    批量删除人员数据
// @route   POST /api/persons/batch-delete
// @access  Private
const batchDeletePersons = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: '请提供要删除的ID列表' });
    }
    
    const result = await Person.deleteMany({ _id: { $in: ids } });
    
    res.json({ 
      message: `已成功删除 ${result.deletedCount} 条数据` 
    });
  } catch (error) {
    console.error('批量删除人员数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

// @desc    按省份统计人员数量
// @route   GET /api/persons/stats/province
// @access  Private
const getStatsByProvince = async (req, res) => {
  try {
    // 检查数据库连接
    if (!checkDbConnection()) {
      return res.status(503).json({ message: '数据库服务暂时不可用，请稍后再试' });
    }
    
    const stats = await Person.aggregate([
      { $group: { _id: '$province', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(stats);
  } catch (error) {
    console.error('获取统计数据错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

module.exports = {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  batchDeletePersons,
  getStatsByProvince
};