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
userRoutes.get("/courses", verifyAccessToken, userController.getUserCourses);
userRoutes.post("/save", verifyAccessToken, userController.saveUserCourses);
userRoutes.put("/update", verifyAccessToken, userController.updateUserCourses);
userRoutes.delete("/hide", verifyAccessToken, userController.hideUserCourses);
userRoutes.get("/verifytoken", verifyAccessToken, userController.verifyToken);
