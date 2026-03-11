import { Discussion } from "../models/Discussion.js";
import * as discussionRepository from "../repositories/discussionRepository.js";
import * as authRepository from "../repositories/authRepository.js";

export function getAll() {
  const discussions = discussionRepository.findAll();
  const users = authRepository.findAll();

  return discussions
    .map((discussion) => {
      const author = users.find((u) => u.id === discussion.authorId);
      if (!author) return null;
      return { ...discussion, author };
    })
    .filter((t) => t !== null)
    .reverse();
}

export function create(content, authorId) {
  const discussion = discussion.create(content, authorId);
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

export function remove(id, userId) {
  const discussion = discussionRepository.findById(id);
  if (!discussion) {
    throw new Error("discussion not found");
  }
  if (discussion.authorId !== userId) {
    throw new Error("Not authorized");
  }
  discussionRepository.remove(id);
  return { id };
}
