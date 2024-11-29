// 导入必要的依赖
import { ApolloServer } from "apollo-server-express";
import express from "express";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import cors from "cors";
import depthLimit from "graphql-depth-limit";
import { createComplexityLimitRule } from "graphql-validation-complexity";

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
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send(`
     <!DOCTYPE html>
     <html lang="en">
     <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Welcome</title>
       <style>
         * { margin: 0; padding: 0; box-sizing: border-box; }
         body { font-family: 'Arial', sans-serif; background: #f0f4f8; height: 100vh; display: flex; justify-content: center; align-items: center; color: #333; }
         .container { text-align: center; background: #fff; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); padding: 40px; max-width: 500px; width: 100%; animation: fadeIn 2s ease-out; }
         h1 { font-size: 3rem; color: #3498db; margin-bottom: 20px; }
         p { font-size: 1.2rem; color: #555; margin-bottom: 40px; }
         .cta-button { background-color: #3498db; color: white; border: none; padding: 15px 30px; font-size: 1.1rem; border-radius: 5px; cursor: pointer; transition: background-color 0.3s; }
         .cta-button:hover { background-color: #2980b9; }
         @keyframes fadeIn { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
       </style>
     </head>
     <body>
       <div class="container">
         <h1>Welcome to the Notedly API!</h1>
         <p>Explore the powerful features and start interacting with the data!</p>
         <a href="/api" class="cta-button">Get Started</a>
       </div>
     </body>
     </html>
   `);
});

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
  cache: "bounded",
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
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
