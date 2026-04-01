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

export function getUserById(id) {
  void id;
  //Not implemented yet
}

export async function updateProfile(userid, data) {
  if (!userid) return;
  if (data.email) await User.updateOne({ _id: userid, email: data.email });
  if (data.bio) await User.updateOne({ _id: userid, bio: data.bio });
  if (data.pfp) await User.updateOne({ _id: userid, pfp: data.pfp });
  if (data.username) await User.updateOne({ _id: userid, bio: data.username });
  if (data.password) await User.updateOne({ _id: userid, bio: data.username });
  return await User.findById(userid);
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

