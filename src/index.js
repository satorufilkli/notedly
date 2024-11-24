import { ApolloServer } from "apollo-server-express";
import express from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

import models from "./models/index.js";
import { connect, disconnect } from "./db.js";
import typeDefs from "./schema.js";
import resolvers from "./resolvers/index.js";

const app = express();

connect(DB_HOST);

const getUser = (token) => {
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Session invalid");
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    // console.log(user);
    return { models, user };
  },
});

async function startServer() {
  await server.start();
  server.applyMiddleware({ app, path: "/api" });

  app.listen(port, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`,
    );
  });
}

startServer();
