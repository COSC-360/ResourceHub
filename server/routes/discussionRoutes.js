import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const router = Router();

router.get("/", discussionController.getLatest);
router.post("/", discussionController.create);
router.patch("/:id", authMiddleware, discussionController.update);
router.delete("/:id", authMiddleware, discussionController.remove);

export default router;
