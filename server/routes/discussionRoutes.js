import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import getDB from "../db.js"

export const discussionRoutes = Router();

discussionRoutes.get("/", discussionController.getAll);
discussionRoutes.post("/", authMiddleware, discussionController.create);
discussionRoutes.patch("/:id", authMiddleware, discussionController.update);
discussionRoutes.delete("/:id", authMiddleware, discussionController.remove);

discussionRoutes.get("/", async (req, res) => {
  const db = getDB();

  const users = await db.collection("users").find().toArray();

  res.json(users);
});

module.exports = discussionRoutes;
