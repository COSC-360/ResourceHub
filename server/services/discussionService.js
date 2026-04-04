import { Discussion } from "../models/discussion.js";
import { DiscussionRepository } from "../repositories/discussionRepository.js";

export function getLatest() {
  return DiscussionRepository.findAll();
}

export async function create(data) {
  if (data._id) delete data._id;
  const discussion = new Discussion(data);
  if (data.parentId) {
    const parent = await findById(data.parentId);
    let replies = Number(parent.replies);
    replies++;
    parent.set({ replies: replies });
    await DiscussionRepository.save(parent);
  }
  if (!discussion) throw new Error("Discussion creation failed");
  return await DiscussionRepository.save(discussion);
}

export async function update(id, data) {
  if (data._id) delete data._id;
  const discussion = await DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error("discussion not found");
  }
  if (discussion.authorid.toString() !== data.authorid) {
    throw new Error("Not authorized");
  }
  discussion.set(data);
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
    throw new Error(`No discussion with the id ${id} found`);
  }
}

export function findByAuthor(authorid) {
  const discussions = DiscussionRepository.findByAuthor(authorid);
  if (!discussions) throw new Error(`No discussions tied to ${authorid} found`);
  return discussions;
}

export async function remove(id, userId) {
  const discussion = await DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error(`No discussions with the id ${id} found`);
  }
  if (discussion.authorId.toString() !== userId) {
    throw new Error("Not authorized");
  }
  if (discussion.parentId) {
    const parent = await DiscussionRepository.findById(discussion.parentId);
    let replies = Number(parent.replies);
    replies--;
    parent.set({ replies: replies });
    await DiscussionRepository.save(parent);
  }
  DiscussionRepository.delete(id);
  return { id };
}

export async function findImageById(id) {
  const discussion = await findById(id);
  return {
    contentType: discussion.image.contentType,
    data: discussion.image.data,
  };
}
