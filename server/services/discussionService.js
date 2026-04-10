import { Discussion } from "../models/discussion.js";
import { DiscussionRepository } from "../repositories/discussionRepository.js";

export function getLatest() {
  return DiscussionRepository.findAll();
}

export function findAll() {
  return DiscussionRepository.findAll();
}

export function findByFilters(filters = {}) {
  return DiscussionRepository.findByFilters(filters);
}

// ids = courseIds
export function findByIds(ids) {
  return DiscussionRepository.findByIds(ids);
}

export function getAllDiscussionsByCourse(courseId) {
  return DiscussionRepository.findAll({ courseId });
}

export async function create(data) {
  if (data._id) delete data._id;

  if (!data.courseId) {
    throw new Error("courseId is required");
  }

  if (data.parentId) {
    const parent = await findById(data.parentId);

    if (parent.courseId?.toString() !== data.courseId.toString()) {
      throw new Error("Reply must belong to the same course");
    }

    const replies = Number(parent.replies || 0) + 1;
    parent.set({ replies });
    await DiscussionRepository.save(parent);
  }

  const discussion = new Discussion(data);
  return await DiscussionRepository.save(discussion);
}

export async function update(id, data) {
  if (data._id) delete data._id;
  const { authorId: actorId, isAdmin, ...rest } = data;
  const discussion = await DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error("discussion not found");
  }
  const authorized =
    isAdmin === true ||
    discussion.authorId.toString() === String(actorId);
  if (!authorized) {
    throw new Error("Not authorized");
  }
  discussion.set(rest);
  return DiscussionRepository.save(discussion);
}

export async function findById(id) {
  const discussion = await DiscussionRepository.findById(id);
  if (!discussion) throw new Error(`No discussion with the id ${id} found`);
  return discussion;
}

export async function findReplies(id) {
  try {
    const discussion = await DiscussionRepository.findByParentId(id);
    return discussion;
  } catch (err) {
    throw new Error(`No discussion with the id ${id} found. ${err.message}`);
  }
}

export function findByAuthor(authorid) {
  const discussions = DiscussionRepository.findByAuthor(authorid);
  if (!discussions) throw new Error(`No discussions tied to ${authorid} found`);
  return discussions;
}

export async function remove(id, userId, options = {}) {
  const { isAdmin = false } = options;
  const discussion = await DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error(`No discussions with the id ${id} found`);
  }
  if (!isAdmin && discussion.authorId.toString() !== userId) {
    throw new Error("Not authorized");
  }

   const result = {
    _id: discussion._id.toString(),
    courseId: discussion.courseId?.toString() || null,
    parentId: discussion.parentId?.toString() || null,
    replies: Number(discussion.replies || 0),
    deleted: discussion.deleted || false,
  };

  if (discussion.parentId) {
    const parent = await DiscussionRepository.findById(discussion.parentId);
    let replies = Number(parent.replies);
    replies--;
    parent.set({ replies: replies });
    await DiscussionRepository.save(parent);
  }
   if (discussion.replies > 0) {
    discussion.set({
      content: "[deleted]",
      title: "[deleted]",
      deleted: true,
    });
    await DiscussionRepository.save(discussion);

    return {
      ...result,
      softDeleted: true,
    };
  } else {
    await DiscussionRepository.delete(id);

    return {
      ...result,
      softDeleted: false,
    };
  }
}

export async function findImageById(id) {
  const discussion = await findById(id);
  if (!discussion?.image) {
    return null;
  }

  if (typeof discussion.image === "string") {
    return discussion.image;
  }

  if (discussion.image?.contentType && discussion.image?.data) {
    return {
      contentType: discussion.image.contentType,
      data: discussion.image.data,
    };
  }

  return null;
}
