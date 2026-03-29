import { Router } from "express";
import * as courseController from "../controllers/courseController.js";

export const courseRoutes = Router();

courseRoutes.get("/:id", courseController.getById);
courseRoutes.post("/", courseController.create);
