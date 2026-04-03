import { Discussion } from "../models/discussion.js";
import { DiscussionRepository } from "../repositories/discussionRepository.js";

export function getLatest() {
  return DiscussionRepository.findAll();
}

export async function create(data) {
  const discussion = new Discussion(data);
  console.log(data);

  if (!discussion) throw new Error("Discussion creation failed");
  return await DiscussionRepository.save(discussion);
}

export async function update(id, data) {
  const discussion = await DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error("discussion not found");
  }
  if (discussion.authorId.toString() !== data.authorId) {
    throw new Error("Not authorized");
  }
  discussion.set(data);
  return DiscussionRepository.save(discussion);
}

export function findById(id) {
  const discussion = DiscussionRepository.findById(id);
  if (!discussion) throw new Error(`No discussion with the id ${id} found`);
  return discussion;
}

export function findByAuthor(authorId) {
  const discussions = DiscussionRepository.findByAuthor(authorId);
  if (!discussions) throw new Error(`No discussions tied to ${authorId} found`);
  return discussions;
}

export async function remove(id, userId) {
  const discussion = await DiscussionRepository.findById(id);
  console.log(discussion);
  if (!discussion) {
    throw new Error(`No discussions with the id ${id} found`);
  }
  if (discussion.authorId !== userId) {
    throw new Error("Not authorized");
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
