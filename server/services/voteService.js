import VoteRepository from "../repositories/voteRepository.js";
import DiscussionRepository from "../repositories/discussionRepository.js";
import { Vote } from "../models/vote.js";

export async function createUpvote(data) {
  if (data._id) delete data._id;
  if (data.value) delete data.value;
  const found = await VoteRepository.findByFields(data);
  if (found?.length > 0) return null;
  const upvote = new Vote({ ...data, value: 1 });
  if (data.targetType === "Discussion") {
    const discussion = await DiscussionRepository.findById(data.targetId);
    let discussion_upvotes = Number(discussion.upvotes);
    discussion_upvotes++;
    discussion.set({ upvotes: discussion_upvotes });
    await DiscussionRepository.save(discussion);
  }
  return await VoteRepository.save(upvote);
}

export async function createDownvote(data) {
  if (data._id) delete data._id;
  if (data.value) delete data.value;
  const found = await VoteRepository.findByFields(data);
  if (found?.length > 0) return null;
  const downvote = new Vote({ ...data, value: -1 });
  if (data.targetType === "Discussion") {
    const discussion = await DiscussionRepository.findById(data.targetId);
    let discussion_downvotes = Number(discussion.downvotes);
    discussion_downvotes++;
    discussion.set({ downvotes: discussion_downvotes });
    await DiscussionRepository.save(discussion);
  }
  return await VoteRepository.save(downvote);
}

export async function hasUpvote(targetId, userId, targetType) {
  const found = await VoteRepository.findByFields({
    targetId: targetId,
    targetType: targetType,
    userId: userId,
    value: 1,
  });
  if (found?.length > 0) return true;
  return false;
}

export async function hasDownvote(targetId, userId, targetType) {
  const found = await VoteRepository.findByFields({
    targetId: targetId,
    targetType: targetType,
    userId: userId,
    value: -1,
  });
  if (found?.length > 0) return true;
  return false;
}

export async function deleteVoteByTargetId(id) {
  return await VoteRepository.deleteManyByTargetId(id);
}

export async function deleteVoteById(id) {
  return await VoteRepository.delete(id);
}

export async function deleteVote(data) {
  const result = await VoteRepository.deleteByFields(data);
  if (!result) return null;

  if (data.targetType === "Discussion") {
    const discussion = await DiscussionRepository.findById(data.targetId);
    let discussion_votes = Number(
      result.value === -1 ? discussion.downvotes : discussion.upvotes,
    );
    discussion_votes--;
    if (result.value === -1) discussion.set({ downvotes: discussion_votes });
    else discussion.set({ upvotes: discussion_votes });
    await DiscussionRepository.save(discussion);
  }
  return result;
}

export async function getVotesByUserId(id) {
  return await VoteRepository.findByUserId(id);
}
