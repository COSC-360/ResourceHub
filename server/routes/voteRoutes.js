import { Router } from "express";
import * as VoteController from "../controllers/voteController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

export const voteRoutes = Router();

voteRoutes.post("/up", verifyAccessToken, VoteController.upVoteTarget);
voteRoutes.post("/down", verifyAccessToken, VoteController.downVoteTarget);
voteRoutes.delete("/remove", verifyAccessToken, VoteController.removeVote);
voteRoutes.get("/", verifyAccessToken, VoteController.getVotes);
