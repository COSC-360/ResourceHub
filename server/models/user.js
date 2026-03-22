import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  bio: { type: String, required: false },
  posts: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  faculty: { type: String, required: false },
  pfp: { type: String },
});

const popularCoursesByUser = {};

export const User = mongoose.model("User", UserSchema);


export function getUserCourses(userId) {
  return popularCoursesByUser[userId] || [];
}

export function findMostPopularCourses() {
  return [...allCourses].sort((a, b) => b.likes - a.likes);
}
