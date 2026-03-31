import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import {
  verifyAccessToken,
  decodeAccessToken,
} from "../middleware/authMiddleware.js";

export const discussionRoutes = Router();

discussionRoutes.get("/", decodeAccessToken, discussionController.getLatest);
discussionRoutes.post("/", verifyAccessToken, discussionController.create);
discussionRoutes.patch("/:id", verifyAccessToken, discussionController.update);
discussionRoutes.delete("/:id", verifyAccessToken, discussionController.remove);

export default discussionRoutes;
