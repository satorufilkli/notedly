import { gql } from "apollo-server-express";
export default gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    notes: [Note!]!
  }

  type Query {
    notes: [Note!]!
    user(username: String!): User
    users: [User!]!
    me: User
  }

  type Mutation {
    createNote(content: String!): Note!
    updateNote(id: ID!, content: String!): Note!
    deleteNote(id: ID!): Boolean!
    signUp(username: String!, email: String!, password: String!): String!
    signIn(username: String, email: String, password: String!): String!
  }
`;
