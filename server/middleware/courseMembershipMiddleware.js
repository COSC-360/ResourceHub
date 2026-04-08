import mongoose from "mongoose";
import { DiscussionRepository } from "../repositories/discussionRepository.js";
import * as membershipRepository from "../repositories/membershipRepository.js";

export async function requireCourseMembership(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let courseId = req.params?.courseId || req.body?.courseId || req.query?.courseId;

    // Fallback for routes like PATCH/DELETE /api/discussion/:id
    if (!courseId && req.params?.id) {
      const discussionId = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        return res.status(400).json({ error: "Invalid discussionId" });
      }

      const discussion = await DiscussionRepository.findById?.(discussionId);
      courseId = discussion?.courseId ? String(discussion.courseId) : null;
    }

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    const membership = await membershipRepository.findByUserAndCourse(userId, courseId);
    if (!membership) {
      return res.status(403).json({ error: "Course membership required" });
    }

    // make available downstream if needed
    req.courseId = courseId;
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}