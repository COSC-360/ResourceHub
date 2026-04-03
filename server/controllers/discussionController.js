import * as discussionService from "../services/discussionService.js";

export async function getLatest(req, res) {
  const discussions = await discussionService.getLatest();
  const discussionsWithAuthor = discussions.map((discussion) => {
    const obj = discussion.toJSON();
    return {
      ...obj,
      isAuthor: discussion.authorId?.toString() === req.user?.id,
    };
  });
  res.json(discussionsWithAuthor);
}

export async function getImage(req, res) {
  const { id } = req.params;
  const found = await discussionService.findImageById(id);
  res.set("Content-Type", found.contentType);
  res.status(200).send(found.data);
}

export async function create(req, res) {
  const { content, title, parentid } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  if (!parentid && (!title || typeof title !== "string" || !title.trim())) {
    res.status(400).json({ error: "Title is required" });
    return;
  }
  const discussion = await discussionService.create({
    content: content,
    title: title,
    image: req.file
      ? {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        }
      : null,
    username: req.user.username,
    authorId: req.user.id,
    parentid: parentid,
    hasImage: req.file ? true : false,
  });
  res.status(201).json({ data: discussion });
}

export async function update(req, res) {
  const { id } = req.params;
  const { updatedImage, content, title } = req.body;

  try {
    let discussion = null;
    if (updatedImage) {
      discussion = await discussionService.update(id, {
        _id: id,
        title: title,
        image: req.file
          ? {
              data: req.file.buffer,
              contentType: req.file.mimetype,
            }
          : null,
        edited: true,
        content: content,
        authorId: req.userId,
        hasImage: req.file ? true : false,
      });
    } else {
      discussion = await discussionService.update(id, {
        _id: id,
        title: title,
        edited: true,
        content: content,
        authorId: req.userId,
        hasImage: req.file ? true : false,
      });
    }
    res.status(200).json({ data: discussion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Not authorized" ? 403 : 404;
    res.status(status).json({ error: message });
  }
}

export async function remove(req, res) {
  const { id } = req.params;
  try {
    const result = await discussionService.remove(id, req.userId);
    res.status(200).json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Not authorized" ? 403 : 404;
    res.status(status).json({ error: message });
  }
}
