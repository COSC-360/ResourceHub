import * as VoteService from "../services/voteService.js";
import { getIO } from "../socket.js";
import * as discussionService from "../services/discussionService.js";

function buildDiscussionVotePayload(updatedDiscussion) {
  return {
    targetId: updatedDiscussion._id,
    targetType: "Discussion",
    parentId: updatedDiscussion.parentId ?? null,
    courseId: updatedDiscussion.courseId,
    upvotes: updatedDiscussion.upvotes,
    downvotes: updatedDiscussion.downvotes,
    score:
      Number(updatedDiscussion.upvotes || 0) -
      Number(updatedDiscussion.downvotes || 0),
  };
}

async function emitDiscussionVoteUpdated(targetId) {
  const updatedDiscussion = await discussionService.findById(targetId);
  const io = getIO();
  const payload = buildDiscussionVotePayload(updatedDiscussion);
  const selfId = String(updatedDiscussion._id);

  if (updatedDiscussion.parentId) {
    io.to(`discussion:${updatedDiscussion.parentId}`).emit("vote:updated", payload);
  } else {
    // Thread page joins discussion:<rootId>; home/course feeds use lobby or course rooms.
    io.to(`discussion:${selfId}`).emit("vote:updated", payload);
    io.to(`course:${updatedDiscussion.courseId}`).emit("vote:updated", payload);
    io.to("discussions:lobby").emit("vote:updated", payload);
  }
}

export async function upVoteTarget(req, res) {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.userId;

    const result = await VoteService.createUpvote({
      userId,
      targetId,
      targetType,
    });

    if (!result) {
      return res.status(409).json({ message: "Vote already exists on target" });
    }

    if (targetType === "Discussion") {
      await emitDiscussionVoteUpdated(targetId);
    }

    return res
      .status(201)
      .json({ message: "Target successfully upvoted.", data: result.toJSON() });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
}

export async function downVoteTarget(req, res) {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.userId;

    const result = await VoteService.createDownvote({
      userId,
      targetId,
      targetType,
    });

    if (!result) {
      return res.status(409).json({ message: "Vote already exists on target" });
    }

    if (targetType === "Discussion") {
      await emitDiscussionVoteUpdated(targetId);
    }

    return res
      .status(201)
      .json({ message: "Target successfully downvoted.", data: result.toJSON() });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
}

export async function removeVote(req, res) {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.userId;

    const result = await VoteService.deleteVote({
      targetId,
      targetType,
      userId,
    });

    if (targetType === "Discussion") {
      await emitDiscussionVoteUpdated(targetId);
    }

    return res
      .status(200)
      .json({ message: "Vote successfully deleted.", data: result.toJSON() });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err });
  }
}

export async function getVotes(req, res) {
  try {
    const userId = req.user.userId;
    const votes = VoteService.getVotesByUserId(userId);
    return res.status(200).json(votes);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}