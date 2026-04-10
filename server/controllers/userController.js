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
  const access_token = userService.issueAccessToken(created);
  res.status(201).json({ data: created, access_token });
  return;
}

export async function getProfilePhoto(req, res) {
  const { id } = req.params;
  let found = null;
  try {
    found = await userService.getUserById(id);
  } catch {
    return res.status(404).json({ message: "user not found" });
  }
  res.set("Content-Type", found.pfp.contentType);
  res.status(200).send(found.pfp.data.buffer);
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

export async function getUserById(req, res) {
  const { id } = req.params;

  if (id == null || String(id).trim() === "") {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const user = await userService.getUserById(String(id));
    delete user.pfp;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function updateProfile(req, res) {
  const id = req.user?.id;
  if (id == null || String(id).trim() === "") {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const updated = await userService.updateProfile(String(id), {
      ...req.body,
      file: req.file,
    });
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: updated });
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).json({ error: "Email or username already taken" });
      return;
    }
    console.log(e);
    res.status(500).json({ error: "Failed to update profile" });
  }
}

export async function getUserCourses(req, res) {
  const savedCourses = await userService.getUserCourses(req.userId);
  res.status(200).json({ data: savedCourses });
}

export async function saveUserCourses(req, res) {
  const { courseId } = req.body;

  if ((await userService.getUserById(req.userId)) === null) {
    throw new Error("User not authenticated");
  }
  const result = await userService.saveUserCourses(req.userId, courseId);
  res.json({ data: result });
}

export async function updateUserCourses(req, res) {
  const { courseIDs } = req.body;
  const result = await userService.updateUserCourses(req.userId, courseIDs);
  res.json({ data: result });
}

export async function hideUserCourses(req, res) {
  const { courseId } = req.body;

  if ((await userService.getUserById(req.userId)) === null) {
    throw new Error("User not authenticated");
  }
  if (!courseId) {
    res.status(400).json({ error: "Course ID is required" });
    return;
  }

  const result = await userService.hideUserCourses(req.userId, courseId);
  res.json({ data: result });
}

export function verifyToken(req, res) {
  if (req.user) return res.status(200).json(req.user);
  return res.status(403).json({ error: "Invalid access token." });
}

export async function searchUsers(req, res) {
  const name = req.query.name;
  const email = req.query.email;
  const faculty = req.query.faculty;
  let isAdmin;
  if (req.query.isAdmin === "true") isAdmin = true;
  if (req.query.isAdmin === "false") isAdmin = false;
  const users = await userService.searchUsers(name, email, faculty, isAdmin);
  res.status(200).json({ data: users });
}

export async function setUserEnabled(req, res) {
  const { id } = req.params;
  const { enabled } = req.body ?? {};

  if (!id || String(id).trim() === "") {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  if (typeof enabled !== "boolean") {
    res.status(400).json({ error: "enabled must be a boolean" });
    return;
  }

  try {
    const updated = await userService.setUserEnabled(String(id), enabled);
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json({ data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user enabled state" });
  }
}