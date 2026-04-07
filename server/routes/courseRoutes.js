import { Router } from "express";
import * as courseController from "../controllers/courseController.js";
import upload from "../middleware/upload.js"; // use your multer middleware export
import { verifyAccessToken } from "../middleware/authMiddleware.js";

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
