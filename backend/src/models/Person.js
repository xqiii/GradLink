const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  province: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: false,
    trim: true
  },
  wechat: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^1[3-9]\d{9}$/
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      index: '2dsphere'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新updatedAt字段
PersonSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 创建索引以优化查询
PersonSchema.index({ province: 1 });
PersonSchema.index({ name: 1 });

const Person = mongoose.model('Person', PersonSchema);

module.exports = Person;