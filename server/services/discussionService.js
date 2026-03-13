import { Discussion } from "../models/Discussion.js";
import * as discussionRepository from "../repositories/discussionRepository.js";
import * as authRepository from "../repositories/authRepository.js";

export function create(content, authorId) {
  const discussion = new Discussion(content, authorId);
  if (!discussion) throw new Error("Discussion creation failed");
  return discussionRepository.save(discussion.toJSON());
}

export function update(id, content, userId) {
  const discussion = discussionRepository.findById(id);
  if (!discussion) {
    throw new Error("discussion not found");
  }
  if (discussion.authorId !== userId) {
    throw new Error("Not authorized");
  }
  discussion.content = content;
  return discussionRepository.save(discussion);
}

export function findById(id) {
  const discussion = discussionRepository.findById(id);
  if (!discussion) throw new Error(`No discussion with the id ${id} found`);
  return discussion;
}

export function findByAuthor(authorId) {
  const discussions = discussionRepository.findByAuthor(authorId);
  if (!discussions) throw new Error(`No discussions tied to ${authorId} found`);
  return discussions;
}

export function remove(id, userId) {
  const discussion = discussionRepository.findById(id);
  if (!discussion) {
    throw new Error(`No discussions with the id ${id} found`);
  }
  if (discussion.authorId !== userId) {
    throw new Error("Not authorized");
  }
  discussionRepository.remove(id);
  return { id };
}
