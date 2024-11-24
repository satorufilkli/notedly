import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticationError, ForbiddenError } from "apollo-server-express";
import gravatar from "../util/gravatar.js";
import { checkAuth, checkNoteOwner } from "../util/auth.js";

const Mutation = {
  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw new Error("Error creating account");
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }
    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      throw new AuthenticationError("Error signing in");
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Error signing in");
    }
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  createNote: async (parent, { content }, { models, user }) => {
    checkAuth(user);
    return await models.Note.create({
      content: content,
      author: user.id,
    });
  },

  updateNote: async (parent, { id, content }, { models, user }) => {
    checkAuth(user);
    const note = await models.Note.findById(id);
    checkNoteOwner(note, user.id);
    return await models.Note.findByIdAndUpdate(
      id,
      { $set: { content } },
      { new: true },
    );
  },

  deleteNote: async (parent, { id }, { models, user }) => {
    checkAuth(user);
    const note = await models.Note.findById(id);
    checkNoteOwner(note, user.id);
    try {
      await models.Note.findByIdAndDelete(id);
      return true;
    } catch (err) {
      console.error("Error deleting note:", err);
      return false;
    }
  },
};

export default Mutation;
