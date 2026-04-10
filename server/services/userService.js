import * as userRepository from "../repositories/userRepository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function createUser(user) {
  const salt = await bcrypt.genSalt();
  const passwordHashed = await bcrypt.hash(user.password, salt);

  return userRepository.save(user.username, user.email, passwordHashed);
}

export function issueAccessToken(userDoc) {
  const u = userDoc.toJSON ? userDoc.toJSON() : userDoc;
  return jwt.sign(
    {
      id: u._id,
      username: u.username,
      faculty: u.faculty,
      pfp: u.pfp,
      admin: u.isAdmin,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: "60m" },
  );
}

export async function userSignin(email, password) {
  const found_user = await userRepository.getUserByEmail(email);
  if (!found_user) return;
  const found = found_user.toJSON();

  const match = await bcrypt.compare(password, found.password);
  if (match) {
    const accessToken = jwt.sign(
      {
        id: found._id,
        username: found.username,
        faculty: found.faculty,
        admin: found.isAdmin,
      },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "60m",
      },
    );
    return accessToken;
  }
}

export async function getUserById(id) {
  return userRepository.getUserById(id);
}

export async function updateProfile(id, body) {
  return userRepository.updateProfile(id, body);
}


export async function getUserCourses(userId) {
  return await userRepository.getUserCourses(userId);
}


export async function saveUserCourses(userId, courses) {

  return await userRepository.saveUserCourses(userId, courses);
}

export async function updateUserCourses(userId, courses) {

  return await userRepository.updateUserCourses(userId, courses);
}

export async function hideUserCourses(userId, courseId) {

  return await userRepository.hideUserCourses(userId, courseId);
}

export async function getAdmins() {
  return await userRepository.searchUsers(undefined, undefined, undefined, true);
}

export async function searchUsers(name, email, faculty, isAdmin) {
  return await userRepository.searchUsers(name, email, faculty, isAdmin);
}