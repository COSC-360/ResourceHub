import { Router } from "express";
import * as courseController from "../controllers/courseController.js";
import * as discussionController from "../controllers/discussionController.js";
import multerUpload, { multerDiskUpload } from "../middleware/upload.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireAdminOrCourseInstructor } from "../middleware/courseInstructorMiddleware.js";
import { requireCourseMembership } from "../middleware/courseMembershipMiddleware.js";

export const courseRoutes = Router();

courseRoutes.get("/", courseController.getAll); // get all courses
courseRoutes.get("/:id", courseController.getById); // get one course by id

// TODO: when course is created, also need to create a course membership for the creator (probably want to do this in the service layer)
courseRoutes.post("/create", verifyAccessToken, courseController.create); // create a new course

courseRoutes.patch("/:id/update", verifyAccessToken, requireAdminOrCourseInstructor, courseController.update);
courseRoutes.patch(
	"/:id/updateimage",
	verifyAccessToken,
	requireAdminOrCourseInstructor,
	multerDiskUpload.single("image"),
	courseController.updateImage,
);

courseRoutes.delete("/:id", verifyAccessToken, requireAdminOrCourseInstructor, courseController.deleteCourse);

// additional routes for discussions, resources, and members specific pages
courseRoutes.get("/:id/discussions", courseController.getDiscussions); // get all discussions for a course by id
courseRoutes.get("/:id/resources", courseController.getResources); // get all resources for a course by id
courseRoutes.get("/:id/members", courseController.getMembers); // get all members for a course by id

/**
 * @swagger
 * /api/courses/{courseId}/discussions:
 *   post:
 *     summary: Create a top-level discussion in a course
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Discussion created
 */
// create a top-level discussion for a course
courseRoutes.post(
	"/:courseId/discussions",
	verifyAccessToken,
	requireCourseMembership,
	multerUpload.single("file"),
	discussionController.create,
);

/**
 * @swagger
 * /api/courses/{courseId}/discussions/{parentId}/replies:
 *   post:
 *     summary: Create a reply in a course discussion thread
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Reply created
 */
// create a reply under a parent discussion for a course
courseRoutes.post(
	"/:courseId/discussions/:parentId/replies",
	verifyAccessToken,
	requireCourseMembership,
	multerUpload.single("file"),
	discussionController.createReply,
);
