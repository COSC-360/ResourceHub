import courseRepository from "../repositories/courseRepository.js";
import * as membershipRepository from "../repositories/membershipRepository.js";
import { CourseCodeAlreadyExistsError } from "../errors/courseErrors.js";

export async function checkCourseCodeUnique(id, code) {
  const existingCourse = await courseRepository.findByCode(code);
  const isSameCourse =
    id != null &&
    existingCourse?._id != null &&
    String(id) === String(existingCourse._id);

  if (existingCourse && !isSameCourse) {
    throw new CourseCodeAlreadyExistsError(code);
  }
}

export function getById(id) {
  return courseRepository.findById(id);
}

export function getAll() {
  return courseRepository.findAll();
}

export async function create(course, creatorUserId = null) {
  const existing = await courseRepository.findByCode(course.code);
  if (existing) throw new CourseCodeAlreadyExistsError(course.code);

  const created = await courseRepository.save(course);

  if (!creatorUserId) {
    return created;
  }

  try {
    await membershipRepository.createMembership(creatorUserId, created._id, "instructor");
    const memberCount = await membershipRepository.countByCourse(created._id);
    await courseRepository.setMemberCount(created._id, memberCount);
    return await courseRepository.findById(created._id);
  } catch (err) {
    await courseRepository.deleteCourse(created._id);
    throw err;
  }
}

export async function update(id, updatedData) {
  // check uniqueness of course code if it's being updated
  if ("code" in updatedData) {
    await checkCourseCodeUnique(id, updatedData.code);
  }
  return courseRepository.update(id, updatedData);
}

export async function updateImage(id, imageUrl) {
  return await courseRepository.updateImage(id, imageUrl);
}

export async function deleteCourse(id) {
  // TODO: also need to delete all discussions, resources, and memberships associated with this course
  return await courseRepository.deleteCourse(id);
}

export async function incrementMemberCount(courseId) {
  return await courseRepository.incrementMemberCount(courseId);
}

export async function decrementMemberCount(courseId) {
  return await courseRepository.decrementMemberCount(courseId);
}

export async function setMemberCount(courseId, count) {
  return await courseRepository.setMemberCount(courseId, count);
}