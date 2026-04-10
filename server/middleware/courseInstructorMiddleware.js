import mongoose from "mongoose";
import * as membershipRepository from "../repositories/membershipRepository.js";
import * as userRepository from "../repositories/userRepository.js";

export async function requireCourseInstructor(req, res, next) {
  try {
    const courseId = req.params.id || req.params.courseId;
    const userId = req.user?.id || req.user?._id || req.user?.userId;

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

/** Site admins or instructors of the course (uses DB isAdmin, same idea as requireAdmin). */
export async function requireAdminOrCourseInstructor(req, res, next) {
  try {
    const courseId = req.params.id || req.params.courseId;
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }

    const userProfile = await userRepository.getUserById(userId);
    if (!userProfile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (userProfile.isAdmin) {
      return next();
    }

    const membership = await membershipRepository.findByUserAndCourse(userId, courseId);
    if (!membership || membership.role !== "instructor") {
      return res.status(403).json({ error: "Instructor or admin access required" });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}