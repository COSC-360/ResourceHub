import { Membership } from "../models/membership.js";

export async function findByUserAndCourse(userId, courseId) {
  return Membership.findOne({ userId, courseId });
}

export async function createMembership(userId, courseId, role = "student") {
  return Membership.create({ userId, courseId, role });
}

export async function deleteByUserAndCourse(userId, courseId) {
  return Membership.findOneAndDelete({ userId, courseId });
}

export async function countByCourse(courseId) {
  return Membership.countDocuments({ courseId });
}

export async function findByUser(userId) {
  return Membership.find({ userId }).lean();
}

export async function findCourseIdsByUser(userId) {
  const rows = await Membership.find({ userId }).select("courseId -_id").lean();
  return rows.map((r) => String(r.courseId));
}

export async function upsertMembershipRole(userId, courseId, role) {
  return Membership.findOneAndUpdate(
    { userId, courseId },
    {
      $set: { role },
      $setOnInsert: { joinedAt: new Date() },
    },
    { new: true, upsert: true }
  );
}