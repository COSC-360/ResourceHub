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