import mongoose from "mongoose";
import * as membershipRepository from "../repositories/membershipRepository.js";

export async function requireCourseInstructor(req, res, next) {
  try {
    const courseId = req.params.id || req.params.courseId;
    const userId = req.user?.id;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }

    const membership = await membershipRepository.findByUserAndCourse(userId, courseId);
    if (!membership || membership.role !== "instructor") {
      return res.status(403).json({ error: "Instructor access required" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}