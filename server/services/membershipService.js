import mongoose from "mongoose";
import * as membershipRepository from "../repositories/membershipRepository.js";
import courseRepository from "../repositories/courseRepository.js";
import * as courseService from "./courseService.js";

function assertValidObjectId(id, fieldName) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

export async function getMyMembershipStatus(userId, courseId) {
  assertValidObjectId(courseId, "courseId");
  const membership = await membershipRepository.findByUserAndCourse(userId, courseId);
  return { isMember: !!membership, membership };
}

export async function joinCourse(userId, courseId) {
  assertValidObjectId(courseId, "courseId");

  const existing = await membershipRepository.findByUserAndCourse(userId, courseId);
  if (existing) {
    const memberCount = await membershipRepository.countByCourse(courseId);
    await courseService.setMemberCount(courseId, memberCount);
    return { alreadyMember: true, membership: existing, memberCount };
  }

  const membership = await membershipRepository.createMembership(userId, courseId, "student");
  const memberCount = await membershipRepository.countByCourse(courseId);
  await courseService.setMemberCount(courseId, memberCount);

  return { alreadyMember: false, membership, memberCount };
}

export async function leaveCourse(userId, courseId) {
  assertValidObjectId(courseId, "courseId");

  const removed = await membershipRepository.deleteByUserAndCourse(userId, courseId);
  const memberCount = await membershipRepository.countByCourse(courseId);
  await courseService.setMemberCount(courseId, memberCount);

  return { removed: !!removed, memberCount };
}

export async function getMyCourseIds(userId) {
  return membershipRepository.findCourseIdsByUser(userId);
}

export async function getMyCourses(userId) {
  const courseIds = await membershipRepository.findCourseIdsByUser(userId);
  if (!courseIds.length) return [];
  return courseRepository.findByIds(courseIds);
}

export async function makeInstructorForCourse(userId, courseId) {
  assertValidObjectId(courseId, "courseId");
  return membershipRepository.upsertMembershipRole(userId, courseId, "instructor");
}

export async function makeStudentForCourse(userId, courseId) {
  assertValidObjectId(courseId, "courseId");
  return membershipRepository.upsertMembershipRole(userId, courseId, "student");
}