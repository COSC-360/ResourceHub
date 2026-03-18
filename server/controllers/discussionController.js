import * as discussionService from "../services/discussionService.js";

export async function getLatest(_req, res) {
  const discussions = await discussionService.getLatest();
  res.json({ data: discussions });
}

export function create(req, res) {
  const { content, username, faculty } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  if (!username || typeof username !== "string" || !username.trim()) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  const discussion = discussionService.create(
    content.trim(),
    username.trim(),
    faculty || "None",
    req.userId || username.trim(),
  );
  res.status(201).json({ data: discussion });
}

export function update(req, res) {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  try {
    const discussion = discussionService.update(id, content.trim(), req.userId);
    res.json({ data: discussion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Not authorized" ? 403 : 404;
    res.status(status).json({ error: message });
  }
}

export function remove(req, res) {
  const { id } = req.params;

  try {
    const result = discussionService.remove(id, req.userId);
    res.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Not authorized" ? 403 : 404;
    res.status(status).json({ error: message });
  }
}
