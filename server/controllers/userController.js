import * as userService from "../services/userService.js";
import * as userRepository from "../repositories/userRepository.js";

export async function createUser(req, res) {
  const user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  if (await userRepository.getUserByEmail(user.email)) {
    res
      .status(406)
      .json({ error: "This email already has an account attached to it." });
    return;
  }
  if (await userRepository.getUsersByUsername(user.email)) {
    res.status(406).json({ error: "This username is already taken." });
    return;
  }
  const created = await userService.createUser(user);
  res.status(201).json({ data: created });
  return;
}

export async function authenticateUser(req, res) {
  if (
    !req.body.password ||
    typeof req.body.password !== "string" ||
    !req.body.password.trim()
  )
    res.status(400).json({ error: "Password is required" });
  if (
    !req.body.email ||
    typeof req.body.email !== "string" ||
    !req.body.email.trim()
  )
    res.status(400).json({ error: "Email is required" });
  const accessToken = await userService.userSignin(
    req.body.email,
    req.body.password,
  );
  if (!accessToken) {
    res.status(401).json({ error: "Wrong email or password" });
    return;
  }
  res.status(200).json({ access_token: accessToken });
}

export function getUserById(req, res) {
  const id = req.user.id;

  if (!id || typeof id !== "string" || !id.trim()) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const user = userService.getUserById(id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ data: user });
}

export function updateProfile(req, res) {
  const id = req.user._id;
  const data = req.body;
  if (!id || typeof id !== "string" || !id.trim()) {
    res.status(400).json({ error: "Id is required" });
    return;
  }

  const user = userService.updateProfile(id, data);
  res.json({ data: user });
}


export function getUserCourses(userId) {
  const savedCourses = userService.getUserCourses(userId);

  if (savedCourses.length > 0) {
    return savedCourses;
  }

  return userService.findMostPopularCourses();
}

export function saveUserCourses(req, res) {
    const { courses } = req.body;

    if (getUserById(req.userId) === null) {
        throw new Error("User not authenticated");
    } 
    const result = userService.saveUserCourses(req.userId, courses);
    res.json({ data: result });
}   


export function updateUserCourses(req, res) {
    const { courses } = req.body;

    if (getUserById(req.userId) === null) {
        throw new Error("User not authenticated");
    } 
    const result = userService.updateUserCourses(req.userId, courses);
    res.json({ data: result });
  }

export function hideUserCourses(req, res) {
    const { courseId } = req.body;

    if (getUserById(req.userId) === null) {
        throw new Error("User not authenticated");
    }
    if (!courseId) {
      res.status(400).json({ error: "Course ID is required" });
      return;
    }

    const result = userService.hideUserCourses(req.userId, courseId);
    res.json({ data: result });
}

export function verifyToken(req, res) {
  if (req.user) return res.status(200).json("Valid access token.");
  return res.status(403).json("Invalid access token.");
}
