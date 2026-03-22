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
  res.status(200).json({ accessToken: accessToken });
}

export function getUserById(req, res) {
  const id = req.body;

  if (!id || typeof id !== "string" || !id.trim()) {
    res.status(400).json({ error: "Id is required" });
    return;
  }

  const user = userService.getUserById(id.trim());
  res.json({ data: user });
}

export function updateProfile(req, res) {
  const id = req.user._id;
  if (!id || typeof id !== "string" || !id.trim()) {
    res.status(400).json({ error: "Id is required" });
    return;
  }

  const user = userService.updateProfile(id, body);
  res.json({ data: user });
}
