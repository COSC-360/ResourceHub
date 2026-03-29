import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

export const discussionRoutes = Router();

discussionRoutes.get("/", discussionController.getLatest);
discussionRoutes.post("/", discussionController.create);
discussionRoutes.patch("/:id", verifyAccessToken, discussionController.update);
discussionRoutes.delete("/:id", verifyAccessToken, discussionController.remove);

export default discussionRoutes;
