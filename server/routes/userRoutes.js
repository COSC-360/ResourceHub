import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

export const userRoutes = Router();

userRoutes.get("/getUserById", verifyAccessToken, userController.getUserById);
userRoutes.post("/signin", userController.createUser);
userRoutes.post("/login", userController.authenticateUser);
userRoutes.patch(
  "/updateProfile",
  verifyAccessToken,
  userController.updateProfile,
);
userRoutes.get("/courses", authMiddleware, userController.getUserCourses);
userRoutes.post("/save", authMiddleware, userController.saveUserCourses);
userRoutes.put("/update", authMiddleware, userController.updateUserCourses);
userRoutes.delete("/hide", authMiddleware, userController.hideUserCourses);
