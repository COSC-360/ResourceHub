import { Router } from "express";
import * as membershipController from "../controllers/membershipController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

export const membershipRoutes = Router();

// static /me/* routes before /me/:courseId
membershipRoutes.get("/me/course-ids", verifyAccessToken, membershipController.getMyCourseIds);
membershipRoutes.get("/me/courses", verifyAccessToken, membershipController.getMyCourses);

membershipRoutes.get("/me/:courseId", verifyAccessToken, membershipController.getMyStatus);
membershipRoutes.post("/:courseId/join", verifyAccessToken, membershipController.join);
membershipRoutes.delete("/:courseId/leave", verifyAccessToken, membershipController.leave);

// TODO: add instructor/admin membership management routes