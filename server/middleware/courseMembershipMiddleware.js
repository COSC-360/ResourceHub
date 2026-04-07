import mongoose from "mongoose";
import { Membership } from "../models/membership.js";

export async function requireCourseMembership(req, res, next) {
  try {
    const courseId = req.params.courseId || req.body.courseId;
    const userId = req.user?.id;

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const membership = await Membership.findOne({ courseId, userId });
    if (!membership) {
      return res.status(403).json({ error: "You are not a member of this course" });
    }

    req.courseId = courseId;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}