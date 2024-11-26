# Notedly - GraphQL 笔记应用 API

一个使用 GraphQL + Express + MongoDB 构建的笔记应用 API。

## 配置和运行

1. 安装依赖
```bash
npm install
```

2. 配置环境变量 (.env)
```
PORT=4000
DB_HOST=mongodb://localhost:27017/notedly
JWT_SECRET=your_jwt_secret
```

3. 运行项目
```bash
node index.js
```

## 主要功能
- 用户注册/登录
- 笔记的增删改查
- JWT 认证
- 用户头像 (Gravatar)

访问 `http://localhost:4000/api` 使用 GraphQL Playground 测试 API。
