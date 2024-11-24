# Notedly - GraphQL 笔记应用 API

一个使用 GraphQL + Express + MongoDB 构建的笔记应用 API。

## 项目结构

```
notedly/
├── models/           # MongoDB 数据模型
│   ├── index.js     # 模型导出
│   ├── note.js      # 笔记模型
│   └── user.js      # 用户模型
│
├── resolvers/       # GraphQL 解析器
│   ├── index.js     # 解析器导出
│   ├── mutation.js  # 修改操作
│   └── query.js     # 查询操作
│
├── util/            # 工具函数
│   ├── auth.js      # 认证相关
│   └── gravatar.js  # 头像处理
│
├── db.js           # 数据库连接配置
├── schema.js       # GraphQL Schema 定义
├── index.js        # 应用入口文件
│
├── .env            # 环境变量配置
└── package.json    # 项目配置文件
```

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

```
