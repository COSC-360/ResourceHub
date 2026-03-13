import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

export const router = Router();

discussionRoutes.get("/", discussionController.getAll);
discussionRoutes.post("/", authMiddleware, discussionController.create);
discussionRoutes.patch("/:id", authMiddleware, discussionController.update);
discussionRoutes.delete("/:id", authMiddleware, discussionController.remove);

router.get("/", async (req, res) => {
  const db = getDB();

  const users = await db.collection("users").find().toArray();

  res.json(users);
});

module.exports = router;
