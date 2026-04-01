import { Router } from "express";
import * as courseController from "../controllers/courseController.js";

export const courseRoutes = Router();

courseRoutes.get("/", courseController.getAll); // get all courses
courseRoutes.get("/:id", courseController.getById); // get one course by id


courseRoutes.post("/", courseController.create); // create a new course

courseRoutes.patch("/:id", courseController.update); // update a course by id
courseRoutes.patch("/:id/image", courseController.updateImage); // update a course's image by id

// TODO: delete a course by id, probably want auth 
courseRoutes.delete("/:id", courseController.delete); 

// join and leave routes
courseRoutes.post("/:id/join", courseController.join); // join a course by id
courseRoutes.delete("/:id/join", courseController.leave); // leave a course by id

// additional routes for discussions, resources, and members specific pages
courseRoutes.get("/:id/discussions", courseController.getDiscussions); // get all discussions for a course by id
courseRoutes.get("/:id/resources", courseController.getResources); // get all resources for a course by id
courseRoutes.get("/:id/members", courseController.getMembers); // get all members for a course by id
