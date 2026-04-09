import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { verifyAccessToken, decodeAccessToken } from "../middleware/authMiddleware.js";
import { requireCourseMembership } from "../middleware/courseMembershipMiddleware.js";
import upload from "../middleware/fileUploads.js";

export const discussionRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: Discussions
 *   description: API endpoints for managing discussions
 */

/**
 * @swagger
 * /api/discussion:
 *   get:
 *     summary: Get latest discussions
 *     tags: [Discussions]
 *     security:
 */
discussionRoutes.get("/", decodeAccessToken, discussionController.getLatest);
discussionRoutes.get("/:id/image", discussionController.getImage);
discussionRoutes.get("/replies/:id", decodeAccessToken, discussionController.getReplies);

discussionRoutes.post(
  "/course/:courseId",
  verifyAccessToken,
  requireCourseMembership,
  upload.single("file"),
  discussionController.create,
);

discussionRoutes.patch(
  "/:id",
  verifyAccessToken,
  requireCourseMembership,
  upload.single("file"),
  discussionController.update,
);
discussionRoutes.delete("/:id", verifyAccessToken, requireCourseMembership, discussionController.remove);

export default discussionRoutes;
