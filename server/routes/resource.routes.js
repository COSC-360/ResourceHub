import { Router } from "express";
import * as resourceController from "../controllers/resource.controller.js";

export const resourceRoutes = Router();

resourceRoutes.get("/", resourceController.getAll); // all resources OR ?courseIds=id1,id2
resourceRoutes.get("/:id", resourceController.get);
resourceRoutes.post("/", resourceController.create);
resourceRoutes.put("/:id", resourceController.update);
resourceRoutes.delete("/:id", resourceController.remove);

// TODO: add download tracking route
// resourceRoutes.patch("/:id/download", resourceController.incrementDownloadCount);

// TODO: if needed, add course-scoped shortcut route
// resourceRoutes.get("/course/:courseId", resourceController.getByCourseId);