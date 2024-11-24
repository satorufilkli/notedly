const Query = {
  notes: async (parent, args, { models }) => {
    return await models.Note.find();
  },
  showUsers: async (parent, args, { models }) => {
    return await models.User.find();
  },
};
export default Query;
