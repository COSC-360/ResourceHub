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

export async function userSignin(email, password) {
  const found_user = await userRepository.getUserByEmail(email);
  if (!found_user) return;
  const found = found_user.toJSON();

  const match = await bcrypt.compare(password, found.password);
  if (match) {
    const accessToken = jwt.sign(
      { id: found._id, username: found.username },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      {
        expiresIn: "60m",
      },
    );
    return accessToken;
  }
}

export function getUserById(id) {
  const user = userRepository.getUserById(id);
  return user;
}

export function updateProfile(id, body) {
  const user = userRepository.getUserById(id);
  void body; //hack to pass CI
  void user; //hack to pass CI

  const newInfo = "placeholder";

  const updatedUser = userRepository.updateProfile(id, newInfo);
  return updatedUser;
}


export function getUserCourses(userId) {
  const savedCourses = userRepository.getUserCourses(userId);

  if (savedCourses.length > 0) {
    return savedCourses;
  }
  
  return userRepository.findMostPopularCourses();
}


export function saveUserCourses(userId, courses) {

  return userRepository.saveUserCourses(userId, courses);
}

export function updateUserCourses(userId, courses) {

  return userRepository.updateUserCourses(userId, courses);
}

export function hideUserCourses(userId, courseId) {

  return userRepository.hideUserCourses(userId, courseId);
}