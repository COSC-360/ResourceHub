import { Discussion } from "../models/Discussion.js";

export const DiscussionRepository = {
  async save(data) {
    const discussion = await Discussion.create(data);
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

  async getLatest({ limit = 10, page = 1 } = {}) {
    const offset = (page - 1) * limit;

    return Discussion.find()
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  },

  //This is currently searching by the content field.
  async search(searchTerm) {
    return await Discussion.find({
      title: { $regex: searchTerm, $options: "i" },
    }).sort({ timestamp: -1 });
  },
};

export default DiscussionRepository;
