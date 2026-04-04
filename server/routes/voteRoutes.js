import { Router } from "express";
import * as VoteController from "../controllers/voteController";
import { verifyAccessToken } from "../middleware/authMiddleware";

const voteRouter = Router();

voteRouter.post("/up", verifyAccessToken, VoteController.upVoteTarget);
voteRouter.post("/down", verifyAccessToken, VoteController.downVoteTarget);
voteRouter.delete("/remove", verifyAccessToken, VoteController.removeVote);
voteRouter.get("/", verifyAccessToken, VoteController.getVotes);
