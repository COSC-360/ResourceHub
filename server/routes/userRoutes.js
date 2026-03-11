import { Router } from "express"
import * as userController from "../controllers/userController.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

export const userRoutes = Router();

userRoutes.get("/getUserById", authMiddleware, userController.getUserById);
userRoutes.patch("/updateProfile", authMiddleware, userController.updateProfile);
userRoutes.get("/courses", authMiddleware, userController.getUserCourses);
userRoutes.post("/save", authMiddleware, userController.saveUserCourses);
userRoutes.put("/update", authMiddleware, userController.updateUserCourses);
userRoutes.delete("/hide", authMiddleware, userController.hideUserCourses);