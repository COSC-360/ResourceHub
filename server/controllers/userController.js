import mongoose from "mongoose";
import * as userService from "../services/userService.js";
import * as userRepository from "../repositories/userRepository.js";
import { getIO } from "../socket.js";
import { ACCOUNT_DISABLED_MESSAGE } from "../middleware/authMiddleware.js";
import { resolveLocalUploadPath } from "../utils/uploads.js";

const DEFAULT_PROFILE_AVATAR_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Default profile avatar">
  <circle cx="32" cy="32" r="32" fill="#E7E3EF"/>
  <circle cx="32" cy="24" r="12" fill="#9A4AE3"/>
  <path d="M12 56c2-11 10-18 20-18s18 7 20 18" fill="#9A4AE3"/>
</svg>
`;

function sendDefaultProfilePhoto(res) {
  res.set("Content-Type", "image/svg+xml; charset=utf-8");
  return res.status(200).send(DEFAULT_PROFILE_AVATAR_SVG.trim());
}

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

  if (!id || String(id).trim() === "") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  let found = null;
  try {
    found = await userService.getUserById(id);
  } catch {
    return sendDefaultProfilePhoto(res);
  }

  if (!found) {
    return sendDefaultProfilePhoto(res);
  }

  if (!found.pfp) {
    return sendDefaultProfilePhoto(res);
  }

  if (typeof found.pfp === "string") {
    const localUploadPath = resolveLocalUploadPath(found.pfp);
    if (localUploadPath) {
      return res.sendFile(localUploadPath, (err) => {
        if (err && !res.headersSent) sendDefaultProfilePhoto(res);
      });
    }

    if (/^https?:\/\//i.test(found.pfp)) {
      return res.redirect(found.pfp);
    }

    return sendDefaultProfilePhoto(res);
  }

  if (found.pfp?.data && found.pfp?.contentType) {
    res.set("Content-Type", found.pfp.contentType);
    return res.status(200).send(found.pfp.data);
  }

  return sendDefaultProfilePhoto(res);
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
  if (accessToken === userService.USER_SIGNIN_ACCOUNT_DISABLED) {
    res.status(403).json({
      error: ACCOUNT_DISABLED_MESSAGE,
      code: "ACCOUNT_DISABLED",
    });
    return;
  }
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
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    delete user.pfp;
    res.json({ data: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function updateProfile(req, res) {
  const rawTarget = req.body?.targetUserId;
  let targetId = req.user?.id;

  if (rawTarget != null && String(rawTarget).trim() !== "") {
    if (!req.user?.admin) {
      res.status(403).json({ error: "Not authorized to update this profile" });
      return;
    }
    const tid = String(rawTarget).trim();
    if (!mongoose.Types.ObjectId.isValid(tid)) {
      res.status(400).json({ error: "Invalid target user ID" });
      return;
    }
    targetId = tid;
  }

  if (targetId == null || String(targetId).trim() === "") {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const updated = await userService.updateProfile(String(targetId), {
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

    if (enabled === false) {
      try {
        const roomId = String(updated?._id ?? updated?.id ?? id);
        getIO().to(`user:${roomId}`).emit("account:disabled", {
          userId: roomId,
        });
      } catch {
        /* Socket may be unavailable in tests or during startup */
      }
    }

    res.status(200).json({ data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user enabled state" });
  }
}
