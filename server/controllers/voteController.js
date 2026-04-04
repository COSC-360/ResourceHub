import * as VoteService from "../services/voteService";

export async function upVoteTarget(req, res) {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.user.userId;

    const result = await VoteService.createUpvote({
      userId: userId,
      targetId: targetId,
      targetType: targetType,
    });
    res
      .status(201)
      .json({ message: "Target successfully upvoted.", data: result.toJSON() });
  } catch (err) {
    res.status(400).json({ error: err });
  }
}

export async function downVoteTarget(req, res) {
  try {
    const { targetId, targetType } = req.body;
    const userId = req.user.userId;

    const result = await VoteService.createDownvote({
      userId: userId,
      targetId: targetId,
      targetType: targetType,
    });
    res
      .status(201)
      .json({ message: "Target successfully upvoted.", data: result.toJSON() });
  } catch (err) {
    res.status(400).json({ error: err });
  }
}

export async function removeVote(req, res) {
  try {
    const { targetId } = req.body;
    const userId = req.user.userId;

    const result = await VoteService.deleteVote({
      targetId: targetId,
      userId: userId,
    });

    res
      .status(200)
      .json({ message: "Vote successfully deleted.", data: result.toJSON() });
  } catch (err) {
    res.status(400).json({ error: err });
  }
}

export async function getVotes(req, res) {
  try {
    const userId = req.user.userId;
    const votes = VoteService.getVotesByUserId(userId);
  } catch (error) {
    res.status(500).json({ error: err });
  }
}
