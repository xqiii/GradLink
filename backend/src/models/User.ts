import { Schema, model, Model, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface User {
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<User, UserMethods>;
export type UserModel = Model<User, {}, UserMethods>;

const UserSchema = new Schema<User, UserModel, UserMethods>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
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

// 密码加密中间件
UserSchema.pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error : any) {
    next(error as Error);
  }
});

// 验证密码方法
UserSchema.methods.matchPassword = async function(this: UserDocument, enteredPassword: string): Promise<boolean> {
  return bcrypt.compare(enteredPassword, this.password);
};

// 更新updatedAt字段
UserSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const UserModelImpl = model<User, UserModel>('User', UserSchema);

export default UserModelImpl;
// 兼容 CommonJS 导入
(module as any).exports = UserModelImpl;