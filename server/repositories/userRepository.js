import { User } from "../models/user.js";
import courseRepository from "./courseRepository.js";

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
  if (data.file != null) {
    $set.pfp = `/uploads/${data.file.filename}`;
  }
  if (data.faculty != null) {
    const f = String(data.faculty).trim();
    $set.faculty = f || "None";
  }

  if (Object.keys($set).length > 0) {
    await User.updateOne({ _id: userid }, { $set });
  }

  return User.findById(userid).select("-password").lean();
}

export async function getUserCourses(userId) {
  const savedIds = savedCourseIdsByUser[userId] || [];
  const allCourses = await courseRepository.findByIds(savedIds);
  return allCourses.filter((course) => {
    const courseId = String(course._id ?? course.id);
    return savedIds.some((savedId) => String(savedId) === courseId);
  });
}

export async function saveUserCourses(userId, courseId) {
  const existingIds = savedCourseIdsByUser[userId] || [];

  if (!existingIds.includes(courseId)) {
    savedCourseIdsByUser[userId] = [...existingIds, courseId];
  }

  return await getUserCourses(userId);
}

export async function updateUserCourses(userId, courseIds) {
  savedCourseIdsByUser[userId] = Array.isArray(courseIds)
    ? [...new Set(courseIds)]
    : [];

  return await getUserCourses(userId);
}

export async function hideUserCourses(userId, courseId) {
  const existingIds = savedCourseIdsByUser[userId] || [];

  savedCourseIdsByUser[userId] = existingIds.filter(
    (id) => String(id) !== String(courseId),
  );

  return await getUserCourses(userId);
}

export async function searchUsers(name, email, faculty, isAdmin) {
  const query = {};
  if (typeof name === "string" && name.trim()) {
    query.username = { $regex: name.trim(), $options: "i" };
  }
  if (typeof email === "string" && email.trim()) {
    query.email = { $regex: email.trim(), $options: "i" };
  }
  if (typeof faculty === "string" && faculty.trim()) {
    query.faculty = { $regex: faculty.trim(), $options: "i" };
  }
  if (typeof isAdmin === "boolean") query.isAdmin = isAdmin;
  return await User.find(query).select("-password").lean();
}

export async function setUserEnabled(userId, enabled) {
  if (!userId || typeof enabled !== "boolean") return null;

  await User.updateOne({ _id: userId }, { $set: { enabled } });
  return User.findById(userId).select("-password").lean();
}