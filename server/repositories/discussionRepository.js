import { Discussion } from "../models/discussion.js";

export const DiscussionRepository = {
  async save(discussion) {
    return discussion.save();
  },

  async findById(id) {
    return await Discussion.findById(id);
  },

  async findAll(filters = {}) {
    const {
      courseId,
      authorId,
      parentId = null,
      limit = 100,
      page = 1,
      sort = { createdAt: -1 },
    } = filters;

    const queryList = {};

    if (courseId) queryList.courseId = courseId;
    if (authorId) queryList.authorId = authorId;
    if (parentId !== undefined) queryList.parentId = parentId;

    let query = Discussion.find(queryList).sort(sort);

    if (limit && page) {
      query = query.skip((page - 1) * limit).limit(limit);
    }
    
    return query;
  },

  async findByAuthor(authorid) {
    return await Discussion.find({ authorId: authorid }).sort({
      timestamp: -1,
    });
  },

  async findByParentId(parentid) {
    return await Discussion.find({ parentId: parentid }).sort({
      timestamp: -1,
    });
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

  //This is currently searching by the title field.
  async search(searchTerm) {
    return await Discussion.find({
      title: { $regex: searchTerm, $options: "i" },
    }).sort({ timestamp: -1 });
  },
};

export default DiscussionRepository;
