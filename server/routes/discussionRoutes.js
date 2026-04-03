import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import {
  verifyAccessToken,
  decodeAccessToken,
} from "../middleware/authMiddleware.js";
import upload from "../middleware/fileUploads.js";

export const discussionRoutes = Router();

discussionRoutes.get("/", decodeAccessToken, discussionController.getLatest);
discussionRoutes.get("/:id/image", discussionController.getImage);
discussionRoutes.post(
  "/",
  verifyAccessToken,
  upload.single("file"),
  discussionController.create,
);
discussionRoutes.patch(
  "/:id",
  verifyAccessToken,
  upload.single("file"),
  discussionController.update,
);
discussionRoutes.delete("/:id", verifyAccessToken, discussionController.remove);

export default discussionRoutes;
