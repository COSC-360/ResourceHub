import { Discussion } from "../models/discussion.js";
import { escapeRegex } from "../utils/regex.js";

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
      courseIds,
      authorId,
      parentId = null,
      limit = 100,
      page = 1,
      sort = { createdAt: -1 },
    } = filters;

    const queryList = {};

    if (courseId) queryList.courseId = courseId;
    if (courseIds?.length) queryList.courseId = { $in: courseIds };
    if (authorId) queryList.authorId = authorId;
    if (parentId !== undefined) queryList.parentId = parentId;

    let query = Discussion.find(queryList).sort(sort);

    if (limit && page) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    return query;
  },

  async findByFilters(filters = {}) {
    const {
      courseId,
      courseIds,
      authorId,
      authorIds,
      parentId,
      deleted,
      edited,
      hasReplies,
      term,
      sortBy = "createdAt",
      sortOrder = "desc",
      limit = 100,
      page = 1,
      populate = [],
    } = filters;

    const queryList = {};

    if (courseId) queryList.courseId = courseId;
    if (courseIds?.length) queryList.courseId = { $in: courseIds };
    if (authorId) queryList.authorId = authorId;
    if (authorIds?.length) queryList.authorId = { $in: authorIds };
    if (parentId !== undefined) queryList.parentId = parentId;
    if (typeof deleted === "boolean") queryList.deleted = deleted;
    if (typeof edited === "boolean") queryList.edited = edited;

    if (typeof hasReplies === "boolean") {
      queryList.replies = hasReplies ? { $gt: 0 } : { $lte: 0 };
    }

    if (typeof term === "string" && term.trim()) {
      const normalizedTerm = term.trim().slice(0, 120);
      const escapedTerm = escapeRegex(normalizedTerm);
      queryList.$or = [
        { title: { $regex: escapedTerm, $options: "i" } },
        { content: { $regex: escapedTerm, $options: "i" } },
      ];
    }

    const direction = sortOrder === "asc" ? 1 : -1;
    const allowedSortFields = new Set([
      "createdAt",
      "updatedAt",
      "upvotes",
      "downvotes",
      "replies",
      "deleted",
      "edited",
      "score",
    ]);

    const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";
    const sort =
      safeSortBy === "score"
        ? { upvotes: direction, downvotes: -direction, createdAt: -1 }
        : { [safeSortBy]: direction, _id: -1 };

    let query = Discussion.find(queryList).sort(sort);

    const allowedPopulateFields = new Set(["courseId", "authorId"]);
    const safePopulate = Array.isArray(populate)
      ? populate.filter((item) => allowedPopulateFields.has(item))
      : [];

    safePopulate.forEach((field) => {
      query = query.populate(field);
    });

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
    const normalizedTerm = String(searchTerm ?? "").trim().slice(0, 120);
    if (!normalizedTerm) return [];

    const escapedTerm = escapeRegex(normalizedTerm);
    return await Discussion.find({
      title: { $regex: escapedTerm, $options: "i" },
    }).sort({ timestamp: -1 });
  },

  async findRecent({ scopedCourseIds = null, limit = 20 } = {}) {
    const query =
      Array.isArray(scopedCourseIds) && scopedCourseIds.length
        ? { courseId: { $in: scopedCourseIds }, parentId: null }
        : { parentId: null };

    return Discussion.find(query).sort({ createdAt: -1, _id: -1 }).limit(limit);
  },

  async findByIds(ids) {
    return await this.findAll({
      courseIds: ids,
      parentId: null,
      sort: { createdAt: -1 },
    });
  },
};

export default DiscussionRepository;
