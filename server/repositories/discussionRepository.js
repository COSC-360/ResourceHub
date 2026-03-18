import { Discussion } from "../models/Discussion.js";

export const DiscussionRepository = {
  async save({ image, content, username, faculty, authorId, parentid }) {
    const discussion = await Discussion.create({
      image,
      content,
      username,
      faculty,
      authorId,
      parentid,
    });
    return discussion;
  },

  async findById(id) {
    return await Discussion.findById(id);
  },

  async findAll() {
    return await Discussion.find().sort({ timestamp: -1 });
  },

  async findByAuthor(authorId) {
    return await Discussion.find({ authorId }).sort({ timestamp: -1 });
  },

  async findReplies(parentid) {
    return await Discussion.find({ parentid }).sort({ timestamp: -1 });
  },

  async upvote(id) {
    return await Discussion.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true },
    );
  },

  async downvote(id) {
    return await Discussion.findByIdAndUpdate(
      id,
      { $inc: { downvotes: 1 } },
      { new: true },
    );
  },

  async incrementReplies(parentid) {
    return await Discussion.findByIdAndUpdate(
      parentid,
      { $inc: { replies: 1 } },
      { new: true },
    );
  },

  async update(id, fields) {
    return await Discussion.findByIdAndUpdate(id, fields, { new: true });
  },

  async delete(id) {
    return await Discussion.findByIdAndDelete(id);
  },
};
