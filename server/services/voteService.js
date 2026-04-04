import VoteRepository from "../repositories/voteRepository";
import { Vote } from "../models/vote";

export async function createUpvote(data) {
  if (data._id) delete data._id;
  if (data.value) delete data.value;
  const upvote = new Vote({ ...data, value: 1 });
  return await VoteRepository.save(upvote);
}

export async function createDownvote(data) {
  if (data._id) delete data._id;
  if (data.value) delete data.value;
  const downvote = new Vote({ ...data, value: 1 });
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
