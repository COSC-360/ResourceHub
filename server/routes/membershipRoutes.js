import { Router } from "express";
import * as membershipController from "../controllers/membershipController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

export const membershipRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Memberships
 *     description: Course membership endpoints for the authenticated user
 * components:
 *   schemas:
 *     MembershipCourseIdsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: string
 *           example: ["6614f1b3d8a08a2f6fbc1291", "6614f21ad8a08a2f6fbc1319"]
 *     MembershipMyCoursesResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *           description: List of full course documents the user belongs to.
 *     MembershipErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Invalid courseId
 */

// static /me/* routes before /me/:courseId
/**
 * @swagger
 * /api/memberships/me/course-ids:
 *   get:
 *     summary: Get my course IDs
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Course IDs for memberships owned by current user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipCourseIdsResponse'
 *       401:
 *         description: Missing or invalid access token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipErrorResponse'
 */
membershipRoutes.get("/me/course-ids", verifyAccessToken, membershipController.getMyCourseIds);

/**
 * @swagger
 * /api/memberships/me/courses:
 *   get:
 *     summary: Get all courses I belong to
 *     description: Returns full course documents for courses where the authenticated user has a membership.
 *     tags: [Memberships]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Courses for current user memberships
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipMyCoursesResponse'
 *       401:
 *         description: Missing or invalid access token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipErrorResponse'
 */
membershipRoutes.get("/me/courses", verifyAccessToken, membershipController.getMyCourses);

membershipRoutes.get("/me/:courseId", verifyAccessToken, membershipController.getMyStatus);
membershipRoutes.post("/:courseId/join", verifyAccessToken, membershipController.join);
membershipRoutes.delete("/:courseId/leave", verifyAccessToken, membershipController.leave);

// TODO: add instructor/admin membership management routes