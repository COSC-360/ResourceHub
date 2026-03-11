import { Router } from "express";
import * as popularController from "../controllers/popularController.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

export const popularRoutes = Router();

popularRoutes.get("/popular", authMiddleware, popularController.getPopularCourses);
popularRoutes.post("/save", authMiddleware, popularController.savePopularCourses);
popularRoutes.put("/update", authMiddleware, popularController.updatePopularCourses);
popularRoutes.delete("/hide", authMiddleware, popularController.hidePopularCourses);