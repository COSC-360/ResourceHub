import mongoose from "mongoose";
import * as membershipRepository from "../repositories/membershipRepository.js";
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
  const existing = await membershipRepository.findByUserAndCourse(userId, courseId);
  if (existing) {
    return { alreadyMember: true, membership: existing };
  }

  const membership = await membershipRepository.createMembership(userId, courseId, "student");
  await courseService.incrementMemberCount(courseId);

  return { alreadyMember: false, membership };
}

export async function leaveCourse(userId, courseId) {
  const removed = await membershipRepository.deleteByUserAndCourse(userId, courseId);

  if (removed) {
    await courseService.decrementMemberCount(courseId);
  }

  return { removed: !!removed };
}