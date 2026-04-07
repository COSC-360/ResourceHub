import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import upload from "../middleware/fileUploads.js";

export const userRoutes = Router();

userRoutes.get("/getProfilePhoto/:id", userController.getProfilePhoto);
userRoutes.get("/getUserById/:id", userController.getUserById);
userRoutes.post("/signin", userController.createUser);
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
