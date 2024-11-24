// 导入必要的依赖
import { ApolloServer } from "apollo-server-express";
import express from "express";
import jwt from "jsonwebtoken";
// 导入环境变量配置
import "dotenv/config";

// 设置服务器端口和数据库连接地址，使用环境变量或默认值
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

// 导入自定义模块
import models from "./models/index.js";
import { connect, disconnect } from "./db.js";
import typeDefs from "./schema.js";
import resolvers from "./resolvers/index.js";

// 创建 Express 应用实例
const app = express();

// 连接数据库
connect(DB_HOST);

/**
 * 验证并解析 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解析后的用户信息或 null
 */
const getUser = (token) => {
  if (token) {
    try {
      // 验证 token 并返回解码后的用户信息
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Session invalid");
    }
  }
};

// 创建 Apollo Server 实例
const server = new ApolloServer({
  typeDefs, // GraphQL schema 类型定义
  resolvers, // GraphQL resolvers 解析函数
  // 设置 context，每个请求都会执行
  context: ({ req }) => {
    // 从请求头获取 token
    const token = req.headers.authorization;
    // 验证 token 并获取用户信息
    const user = getUser(token);
    // 返回上下文对象，包含数据库模型和用户信息
    return { models, user };
  },
});

/**
 * 启动 Apollo Server 和 Express 服务器
 */
async function startServer() {
  // 启动 Apollo Server
  await server.start();
  // 将 Apollo Server 作为中间件添加到 Express
  server.applyMiddleware({ app, path: "/api" });

  // 启动 Express 服务器
  app.listen(port, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
    );
  });
}

// 执行服务器启动函数
startServer();
