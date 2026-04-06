import { User } from "../models/user.js";
import * as courseRepository from "./courseRepository.js";

const savedCourseIdsByUser = {};

export async function save(username, email, password) {
  return await User.create({
    username: username,
    email: email,
    password: password,
  });
}

export async function getUserByEmail(email) {
  return await User.findOne({ email: email });
}

export async function getUsersByUsername(username) {
  return await User.findOne({ username: username });
}

export async function getUserById(id) {
  if (!id) return null;
  return User.findById(id).select("-password").lean();
}

export async function updateProfile(userid, data) {
  if (!userid) return null;

  const $set = {};
  if (data.username != null && String(data.username).trim()) {
    $set.username = String(data.username).trim();
  }
  if (data.email != null && String(data.email).trim()) {
    $set.email = String(data.email).trim().toLowerCase();
  }
  if (data.bio != null) {
    $set.bio = String(data.bio);
  }

  if (Object.keys($set).length > 0) {
    await User.updateOne({ _id: userid }, { $set });
  }

  return User.findById(userid).select("-password").lean();
}

export function getUserCourses(userId) {
  const savedIds = savedCourseIdsByUser[userId] || [];
  const allCourses = courseRepository.findAll();
  return allCourses.filter((course) => savedIds.includes(course.id));
}

export function saveUserCourses(userId, courseId) {
  const existingIds = savedCourseIdsByUser[userId] || [];

  if (!existingIds.includes(courseId)) {
    savedCourseIdsByUser[userId] = [...existingIds, courseId];
  }

  return getUserCourses(userId);
}

export function updateUserCourses(userId, courseIds) {
  savedCourseIdsByUser[userId] = Array.isArray(courseIds)
    ? [...new Set(courseIds)]
    : [];

  return getUserCourses(userId);
}

export function hideUserCourses(userId, courseId) {
  const existingIds = savedCourseIdsByUser[userId] || [];

  savedCourseIdsByUser[userId] = existingIds.filter(
    (id) => String(id) !== String(courseId)
  );

  return getUserCourses(userId);
}

