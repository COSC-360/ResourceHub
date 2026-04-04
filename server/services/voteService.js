import VoteRepository from "../repositories/voteRepository";
import DiscussionRepository from "../repositories/discussionRepository";
import { Vote } from "../models/vote";

export async function createUpvote(data) {
  if (data._id) delete data._id;
  if (data.value) delete data.value;
  const upvote = new Vote({ ...data, value: 1 });
  if (data.targetType === "Disucssion") {
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
  const downvote = new Vote({ ...data, value: -1 });
  if (data.targetType === "Disucssion") {
    const discussion = await DiscussionRepository.findById(data.targetId);
    let discussion_downvotes = Number(discussion.downvotes);
    discussion_downvotes++;
    discussion.set({ downvotes: discussion_downvotes });
    await DiscussionRepository.save(discussion);
  }
  return await VoteRepository.save(downvote);
}

export async function deleteVoteByTargetId(id) {
  return await VoteRepository.deleteManyByTargetId(id);
}

export async function deleteVoteById(id) {
  return await VoteRepository.delete(id);
}

export async function deleteVote(data) {
  return await VoteRepository.deleteByFields(data);
}

export async function getVotesByUserId(id) {
  return await VoteRepository.findByUserId(id);
}
