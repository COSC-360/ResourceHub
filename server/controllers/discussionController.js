import * as discussionService from "../services/discussionService.js";
import * as voteService from "../services/voteService.js";

export async function getLatest(req, res) {
  const courseIds = (req.query.courseIds ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const discussions = courseIds.length
    ? await discussionService.findByIds(courseIds)
    : await discussionService.findAll();

  const discussionsWithAuthor = await Promise.all(
    discussions.map(async (discussion) => {
      const obj = discussion.toJSON();
      const hasUpvote = await voteService.hasUpvote(
        discussion._id,
        req.user?.id,
        "Discussion",
      );
      const hasDownvote = await voteService.hasDownvote(
        discussion._id,
        req.user?.id,
        "Discussion",
      );
      return {
        ...obj,
        isAuthor: discussion.authorId?.toString() === req.user?.id,
        hasUpvote,
        hasDownvote,
        hasImage: discussion.image.contentType ? true : false,
      };
    }),
  );

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
  const courseId = req.courseId; // set by middleware

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Content is required" });
  }

  if (!parentid && (!title || typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const discussion = await discussionService.create({
      courseId,
      content,
      title,
      image: req.file
        ? { data: req.file.buffer, contentType: req.file.mimetype }
        : null,
      authorId: req.user.id,
      parentId: parentid || null,
    });

    return res.status(201).json({ data: discussion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      message.includes("not found") ? 404 :
      message.includes("course") ? 400 : 500;

    return res.status(status).json({ error: message });
  }
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
    console.log(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message === "Not authorized" ? 403 : 500;
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

export async function getReplies(req, res) {
  const { id } = req.params;

  const discussions = await discussionService.findReplies(id);
  const discussionsWithAuthor = discussions.map((discussion) => {
    const obj = discussion.toJSON();

    return {
      ...obj,
      isAuthor: discussion.authorId?.toString() === req.user?.id,
    };
  });
  res.status(200).json(discussionsWithAuthor);
}
