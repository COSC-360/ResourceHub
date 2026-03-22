import { User } from "../models/User.js";

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


export function findMostPopularCourses() {
  return [...allCourses].sort((a, b) => b.likes - a.likes);
}

export function getUserCourses(userId) {
  return popularCoursesByUser[userId] || [];
}

export function saveUserCourses(userId, courses) {
  popularCoursesByUser[userId] = courses;
  return { userId, courses: popularCoursesByUser[userId] };
}

export function updateUserCourses(userId, courses) {
  popularCoursesByUser[userId] = courses;
  return { userId, courses: popularCoursesByUser[userId] };
}

export function hideUserCourses(userId, courseId) {

  popularCoursesByUser[userId] = popularCoursesByUser[userId].filter(
    (id) => String(id) !== String(courseId)
  );

  return {
    userId,
    courses: popularCoursesByUser[userId]
  };
}

