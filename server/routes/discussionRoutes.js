import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const discussionRoutes = Router();

discussionRoutes.get("/", discussionController.getLatest);
discussionRoutes.post("/", discussionController.create);
discussionRoutes.patch("/:id", authMiddleware, discussionController.update);
discussionRoutes.delete("/:id", authMiddleware, discussionController.remove);

export default discussionRoutes;
