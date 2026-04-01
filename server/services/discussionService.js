import { Discussion } from "../models/discussion.js";
import { DiscussionRepository } from "../repositories/discussionRepository.js";

export function getLatest() {
  return DiscussionRepository.findAll();
}

export function create(data) {
  const discussion = new Discussion(data);
  if (!discussion) throw new Error("Discussion creation failed");
  return DiscussionRepository.save(discussion.toJSON());
}

export function update(id, content, userId) {
  const discussion = DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error("discussion not found");
  }
  if (discussion.authorId !== userId) {
    throw new Error("Not authorized");
  }
  discussion.content = content;
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

export function remove(id, userId) {
  const discussion = DiscussionRepository.findById(id);
  if (!discussion) {
    throw new Error(`No discussions with the id ${id} found`);
  }
  if (discussion.authorId !== userId) {
    throw new Error("Not authorized");
  }
  DiscussionRepository.delete(id);
  return { id };
}
