import { Router } from "express";
import * as discussionController from "../controllers/discussionController.js";
import { verifyAccessToken, decodeAccessToken } from "../middleware/authMiddleware.js";
import { requireCourseMembership } from "../middleware/courseMembershipMiddleware.js";
import upload from "../middleware/fileUploads.js";

export const discussionRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Discussions
 *     description: API endpoints for creating, reading, updating, and deleting discussions
 * components:
 *   schemas:
 *     Discussion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6614f1f5d8a08a2f6fbc12ef
 *         courseId:
 *           type: string
 *           example: 6614f1b3d8a08a2f6fbc1291
 *         authorId:
 *           type: string
 *           example: 6614ef11d8a08a2f6fbc1011
 *         deleted:
 *           type: boolean
 *           example: false
 *         title:
 *           type: string
 *           nullable: true
 *           example: How do I normalize this schema?
 *         content:
 *           type: string
 *           example: I'm stuck between 2NF and 3NF for this table design.
 *         edited:
 *           type: boolean
 *           example: false
 *         upvotes:
 *           type: integer
 *           example: 4
 *         downvotes:
 *           type: integer
 *           example: 1
 *         replies:
 *           type: integer
 *           example: 2
 *         parentId:
 *           type: string
 *           nullable: true
 *           example: null
 *         forum:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         isAuthor:
 *           type: boolean
 *           example: true
 *         hasUpvote:
 *           type: boolean
 *           example: false
 *         hasDownvote:
 *           type: boolean
 *           example: false
 *         hasImage:
 *           type: boolean
 *           example: true
 *        score:
 *          type: integer
 *          example: 3
 *     DiscussionCreateResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Discussion'
 *     DiscussionUpdateResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Discussion'
 *     DiscussionDeleteResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: 6614f1f5d8a08a2f6fbc12ef
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Not authorized
 *   parameters:
 *     DiscussionId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *       description: Discussion ID
 *     CourseId:
 *       in: path
 *       name: courseId
 *       required: true
 *       schema:
 *         type: string
 *       description: Course ID
 */

/**
 * @swagger
 * /api/discussion:
 *   get:
 *     summary: Get discussions with filters
 *     description: Returns discussions with optional filtering, sorting, pagination, and hydration.
 *     tags: [Discussions]
 *     parameters:
 *       - in: query
 *         name: courseIds
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated course IDs (for example `id1,id2,id3`).
 *       - in: query
 *         name: authorIds
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated author IDs.
 *       - in: query
 *         name: deleted
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by deleted status.
 *       - in: query
 *         name: edited
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by edited status.
 *       - in: query
 *         name: hasReplies
 *         required: false
 *         schema:
 *           type: boolean
 *         description: When true, only discussions with replies. When false, only discussions without replies.
 *       - in: query
 *         name: parentId
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by parent discussion ID. Pass `null` string to get top-level discussions.
 *       - in: query
 *         name: topLevelOnly
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Shortcut to force only top-level discussions (equivalent to `parentId=null`).
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, upvotes, downvotes, replies, deleted, edited, score]
 *         description: Sort field. `score` is approximated by sorting upvotes then downvotes.
 *       - in: query
 *         name: sortOrder
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort direction.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 1-based page number.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 200
 *         description: Max records per page.
 *       - in: query
 *         name: populate
 *         required: false
 *         schema:
 *           type: string
 *         description: Comma-separated fields to hydrate. Allowed values are `courseId` and `authorId`.
 *     responses:
 *       200:
 *         description: List of discussions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discussion'
 */
discussionRoutes.get("/", decodeAccessToken, discussionController.getAll);

/**
 * @swagger
 * /api/discussion/{id}/image:
 *   get:
 *     summary: Get discussion image
 *     description: Returns the raw image binary for a discussion if one exists.
 *     tags: [Discussions]
 *     parameters:
 *       - $ref: '#/components/parameters/DiscussionId'
 *     responses:
 *       200:
 *         description: Image binary
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Discussion not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
discussionRoutes.get("/:id/image", discussionController.getImage);

/**
 * @swagger
 * /api/discussion/replies/{id}:
 *   get:
 *     summary: Get replies for a discussion
 *     description: Returns direct replies for a parent discussion ID.
 *     tags: [Discussions]
 *     parameters:
 *       - $ref: '#/components/parameters/DiscussionId'
 *     responses:
 *       200:
 *         description: List of replies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Discussion'
 *       404:
 *         description: Parent discussion not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
discussionRoutes.get("/replies/:id", decodeAccessToken, discussionController.getReplies);

/**
 * @swagger
 * /api/discussion/course/{courseId}:
 *   post:
 *     summary: Create a discussion or reply
 *     description: Creates a new top-level discussion (with title) or a reply (with parentid).
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/CourseId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Required for top-level discussion, optional for replies.
 *               content:
 *                 type: string
 *                 description: Required text body.
 *               parentid:
 *                 type: string
 *                 nullable: true
 *                 description: Parent discussion ID. Provide this to create a reply.
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file.
 *             required:
 *               - content
 *     responses:
 *       201:
 *         description: Discussion created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionCreateResponse'
 *       400:
 *         description: Validation or course error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 *       404:
 *         description: Referenced entity not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
discussionRoutes.post(
  "/course/:courseId",
  verifyAccessToken,
  requireCourseMembership,
  upload.single("file"),
  discussionController.create,
);

/**
 * @swagger
 * /api/discussion/{id}:
 *   patch:
 *     summary: Update a discussion
 *     description: Updates discussion fields. Include file and set updatedImage to replace/remove image behavior in your handler logic.
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DiscussionId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               updatedImage:
 *                 type: boolean
 *                 description: Indicates image update intent in controller logic.
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Discussion updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionUpdateResponse'
 *       403:
 *         description: Not authorized to edit discussion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 */
discussionRoutes.patch(
  "/:id",
  verifyAccessToken,
  requireCourseMembership,
  upload.single("file"),
  discussionController.update,
);

/**
 * @swagger
 * /api/discussion/{id}:
 *   delete:
 *     summary: Delete a discussion
 *     description: Deletes a discussion when possible, or soft-deletes if it has replies.
 *     tags: [Discussions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/DiscussionId'
 *     responses:
 *       200:
 *         description: Discussion delete result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DiscussionDeleteResponse'
 *       403:
 *         description: Not authorized to delete discussion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Discussion not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 */
discussionRoutes.delete("/:id", verifyAccessToken, requireCourseMembership, discussionController.remove);

export default discussionRoutes;
