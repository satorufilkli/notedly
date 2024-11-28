import { AuthenticationError, ForbiddenError } from "apollo-server-express";

// 验证用户登录状态
export const checkAuth = (user) => {
  if (!user) {
    throw new AuthenticationError("You must be signed in!");
  }
  return user;
};

// 验证笔记所有权
export const checkNoteOwner = (note, userId) => {
  if (!note) {
    throw new Error("Note not found");
  }
  if (String(note.author) !== userId) {
    throw new ForbiddenError("You don't have permission to do that!");
  }
  return note;
};
