import { Router } from "express";
import * as membershipController from "../controllers/membershipController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

export const membershipRoutes = Router();

membershipRoutes.get("/me/:courseId", verifyAccessToken, membershipController.getMyStatus);
membershipRoutes.post("/:courseId/join", verifyAccessToken, membershipController.join);
membershipRoutes.delete("/:courseId/leave", verifyAccessToken, membershipController.leave);

// TODO: add instructor/admin membership management routes