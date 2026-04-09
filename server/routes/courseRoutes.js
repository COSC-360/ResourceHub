import { Router } from "express";
import * as courseController from "../controllers/courseController.js";
import * as discussionController from "../controllers/discussionController.js";
import upload from "../middleware/upload.js"; // use your multer middleware export
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { requireCourseMembership } from "../middleware/courseMembershipMiddleware.js";
import discussionUpload from "../middleware/fileUploads.js";

export const courseRoutes = Router();

courseRoutes.get("/", courseController.getAll); // get all courses
courseRoutes.get("/:id", courseController.getById); // get one course by id

// TODO: when course is created, also need to create a course membership for the creator (probably want to do this in the service layer)
courseRoutes.post("/create", verifyAccessToken, courseController.create); // create a new course

// TODO: add auth middleware to these routes, also need to check if user is an instructor for the course when updating or deleting
courseRoutes.patch("/:id/update", verifyAccessToken, courseController.update); // update a course by id
courseRoutes.patch("/:id/updateimage", verifyAccessToken, upload.single("image"), courseController.updateImage); // update a course's image by id

// TODO: delete a course by id, probably want auth also check membership and role (only allow instructors to delete courses)
courseRoutes.delete("/:id", verifyAccessToken, courseController.deleteCourse); // delete a course by id

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
	discussionUpload.single("file"),
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
	discussionUpload.single("file"),
	discussionController.createReply,
);
