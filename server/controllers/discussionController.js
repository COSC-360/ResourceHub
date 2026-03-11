import * as discussionService from "./discussion.service.js";

export function getAll(_req, res) {
  const discussions = discussionService.getAll();
  res.json({ data: discussions });
}

export function create(req, res) {
  const { content } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  const discussion = discussionService.create(content.trim(), req.userId);
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
