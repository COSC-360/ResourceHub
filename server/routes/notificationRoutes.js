import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { getNotifications } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyAccessToken, getNotifications);

export default router;