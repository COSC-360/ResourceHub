import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/fileUploads.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

export const userRoutes = Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User authentication and profile endpoints
 * components:
 *   schemas:
 *     AuthRegisterRequest:
 *       type: object
 *       required: [username, email, password]
 *       properties:
 *         username:
 *           type: string
 *           example: zander
 *         email:
 *           type: string
 *           format: email
 *           example: zander@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 *     AuthLoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: zander@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: StrongPassword123!
 *     UserPublic:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 6614ef11d8a08a2f6fbc1011
 *         username:
 *           type: string
 *           example: zander
 *         email:
 *           type: string
 *           format: email
 *           example: zander@example.com
 *         bio:
 *           type: string
 *           example: CS student
 *         faculty:
 *           type: string
 *           example: Engineering
 *         isAdmin:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/UserPublic'
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     LoginResponse:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     UserErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Wrong email or password
 */

userRoutes.get("/getProfilePhoto/:id", userController.getProfilePhoto);
userRoutes.get("/getUserById/:id", userController.getUserById);

/**
 * @swagger
 * /api/user/signin:
 *   post:
 *     summary: Register a new user (legacy route)
 *     description: Creates a user account and returns an access token. Prefer `/api/user/register` for new clients.
 *     tags: [Users]
 *     deprecated: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       406:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 */
userRoutes.post("/signin", userController.createUser);

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a user account and returns an access token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       406:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 */
userRoutes.post("/register", userController.createUser);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Authenticate user
 *     description: Validates credentials and returns an access token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing required email/password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 */
userRoutes.post("/login", userController.authenticateUser);
userRoutes.patch(
  "/updateProfile",
  verifyAccessToken,
  upload.single("file"),
  userController.updateProfile,
);
userRoutes.get("/courses", verifyAccessToken, userController.getUserCourses);
userRoutes.post("/save", verifyAccessToken, userController.saveUserCourses);
userRoutes.put("/update", verifyAccessToken, userController.updateUserCourses);
userRoutes.delete("/hide", verifyAccessToken, userController.hideUserCourses);
userRoutes.get("/verifytoken", verifyAccessToken, userController.verifyToken);

//Everything past this point requires admin privileges
userRoutes.get("/admin/admins", requireAdmin, userController.getAdmins);
userRoutes.get("/admin/users", requireAdmin, userController.searchUsers);