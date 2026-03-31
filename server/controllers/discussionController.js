import * as discussionService from "../services/discussionService.js";

export async function getLatest(req, res) {
  const discussions = await discussionService.getLatest();
  const discussionsWithAuthor = discussions.map((discussion) => {
    const obj = discussion.toJSON();

    return {
      ...obj,
      isAuthor: obj.authorId === req.user?.id,
    };
  });

  res.json({
    data: discussionsWithAuthor,
  });
}

export function create(req, res) {
  const { content, title, image, parentid } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  if (!parentid && (!title || typeof title !== "string" || !title.trim())) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  console.log(content);
  const discussion = discussionService.create({
    content: content,
    title: title,
    image: image,
    username: req.user.username,
    authorId: req.user.id,
    parentid: parentid,
    faculty: req.user?.faculty,
    pfp: req.user?.pfp,
  });
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
