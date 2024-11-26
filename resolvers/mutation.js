import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticationError, ForbiddenError } from "apollo-server-express";
import gravatar from "../util/gravatar.js";
import { checkAuth, checkNoteOwner } from "../util/auth.js";
import mongoose from "mongoose";

const Mutation = {
  /**
   * 用户注册
   * @param {Object} parent - GraphQL parent 对象
   * @param {Object} args - 包含用户注册信息
   * @param {string} args.username - 用户名
   * @param {string} args.email - 电子邮件
   * @param {string} args.password - 密码
   * @param {Object} context - GraphQL context 对象
   * @returns {string} JWT token
   */
  signUp: async (parent, { username, email, password }, { models }) => {
    // 处理邮箱格式：去除空格并转换为小写
    email = email.trim().toLowerCase();
    // 密码加密
    const hashed = await bcrypt.hash(password, 10);
    // 获取 Gravatar 头像
    const avatar = gravatar(email);
    try {
      // 创建新用户
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });
      // 返回 JWT token
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw new Error("Error creating account");
    }
  },

  /**
   * 用户登录
   * @param {Object} parent - GraphQL parent 对象
   * @param {Object} args - 包含登录信息
   * @param {string} args.username - 用户名（可选）
   * @param {string} args.email - 电子邮件（可选）
   * @param {string} args.password - 密码
   * @param {Object} context - GraphQL context 对象
   * @returns {string} JWT token
   */
  signIn: async (parent, { username, email, password }, { models }) => {
    // 如果提供了邮箱，处理邮箱格式
    if (email) {
      email = email.trim().toLowerCase();
    }
    // 通过邮箱或用户名查找用户
    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      throw new AuthenticationError("Error signing in");
    }
    // 验证密码
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Error signing in");
    }
    // 返回 JWT token
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  /**
   * 创建笔记
   * @param {Object} parent - GraphQL parent 对象
   * @param {Object} args - 包含笔记内容
   * @param {string} args.content - 笔记内容
   * @param {Object} context - GraphQL context 对象
   * @returns {Object} 创建的笔记
   */
  createNote: async (parent, { content }, { models, user }) => {
    // 验证用户是否已登录
    checkAuth(user);
    // 创建新笔记
    return await models.Note.create({
      content: content,
      author: user.id,
    });
  },

  /**
   * 更新笔记
   * @param {Object} parent - GraphQL parent 对象
   * @param {Object} args - 包含更新信息
   * @param {string} args.id - 笔记ID
   * @param {string} args.content - 更新的内容
   * @param {Object} context - GraphQL context 对象
   * @returns {Object} 更新后的笔记
   */
  updateNote: async (parent, { id, content }, { models, user }) => {
    // 验证用户是否已登录
    checkAuth(user);
    // 查找笔记
    const note = await models.Note.findById(id);
    // 验证笔记所有权
    checkNoteOwner(note, user.id);
    // 更新笔记并返回更新后的文档
    return await models.Note.findByIdAndUpdate(
      id,
      { $set: { content } },
      { new: true },
    );
  },

  /**
   * 删除笔记
   * @param {Object} parent - GraphQL parent 对象
   * @param {Object} args - 包含笔记ID
   * @param {string} args.id - 要删除的笔记ID
   * @param {Object} context - GraphQL context 对象
   * @returns {boolean} 删除是否成功
   */
  deleteNote: async (parent, { id }, { models, user }) => {
    // 验证用户是否已登录
    checkAuth(user);
    // 查找笔记
    const note = await models.Note.findById(id);
    // 验证笔记所有权
    checkNoteOwner(note, user.id);
    try {
      // 删除笔记
      await models.Note.findByIdAndDelete(id);
      return true;
    } catch (err) {
      console.error("Error deleting note:", err);
      return false;
    }
  },

  /**
   * 切换笔记的收藏状态
   * @param {Object} parent - GraphQL parent 对象
   * @param {Object} args - 传入的参数对象
   * @param {string} args.id - 要切换收藏状态的笔记ID
   * @param {Object} context - GraphQL context 对象
   * @param {Object} context.models - 数据库模型
   * @param {Object} context.user - 当前用户信息
   * @returns {Promise<Object>} 更新后的笔记对象
   */
  toggleFavorite: async (parent, { id }, { models, user }) => {
    // 检查用户是否已认证登录
    checkAuth(user);

    // 查找对应 ID 的笔记
    let noteCheck = await models.Note.findById(id);
    // 检查当前用户是否已经收藏过这条笔记
    // 使用 some 和 equals 来检查用户 ID
    const hasUser = noteCheck.favoritedBy.some((id) => id.equals(user.id));

    if (hasUser) {
      // 如果用户已收藏，则取消收藏
      return await models.Note.findByIdAndUpdate(
        id,
        {
          // 从 favoritedBy 数组中移除用户 ID
          $pull: {
            favoritedBy: new mongoose.Types.ObjectId(user.id),
          },
          // 收藏数量减 1
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          // 返回更新后的文档，而不是更新前的
          new: true,
        },
      );
    } else {
      // 如果用户未收藏，则添加收藏
      return await models.Note.findByIdAndUpdate(
        id,
        {
          // 将用户 ID 添加到 favoritedBy 数组
          $push: {
            favoritedBy: new mongoose.Types.ObjectId(user.id),
          },
          // 收藏数量加 1
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          // 返回更新后的文档，而不是更新前的
          new: true,
        },
      );
    }
  },
};

export default Mutation;
