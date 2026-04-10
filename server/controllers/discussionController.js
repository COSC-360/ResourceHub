import * as discussionService from "../services/discussionService.js";
import * as voteService from "../services/voteService.js";
import mongoose from "mongoose";

function parseCsv(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
      .filter(Boolean);
  }

  if (typeof value !== "string") return [];

  const raw = value.trim();
  if (!raw) return [];

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
          .filter(Boolean);
      }
    } catch {
      // fall through to CSV-style parsing
    }
  }

  return raw
    .split(/[\n,]/)
    .map((item) => item.trim())
    .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
    .filter(Boolean);
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes"].includes(normalized)) return true;
  if (["0", "false", "no"].includes(normalized)) return false;
  return undefined;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parsePopulate(value) {
  const allowed = new Set(["courseId", "authorId"]);
  return parseCsv(value).filter((entry) => allowed.has(entry));
}

function hasInvalidObjectId(ids = []) {
  return ids.some((id) => !mongoose.Types.ObjectId.isValid(id));
}

export async function getAll(req, res) {
  const courseIds = parseCsv(req.query.courseIds);
  const authorIds = parseCsv(req.query.authorIds);
  const populate = parsePopulate(req.query.populate);
  const deleted = parseBoolean(req.query.deleted);
  const edited = parseBoolean(req.query.edited);
  const hasReplies = parseBoolean(req.query.hasReplies);
  const topLevelOnly = parseBoolean(req.query.topLevelOnly);
  const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, 100), 200);

  let parentId;
  if (typeof req.query.parentId === "string") {
    parentId = req.query.parentId === "null" ? null : req.query.parentId;
  } else if (topLevelOnly === true) {
    parentId = null;
  }

  if (courseIds.length && hasInvalidObjectId(courseIds)) {
    return res.status(400).json({
      error: "Invalid courseIds. Use comma-separated Mongo ObjectIds.",
    });
  }

  if (authorIds.length && hasInvalidObjectId(authorIds)) {
    return res.status(400).json({
      error: "Invalid authorIds. Use comma-separated Mongo ObjectIds.",
    });
  }

  if (
    typeof parentId === "string" &&
    parentId.trim() !== "" &&
    !mongoose.Types.ObjectId.isValid(parentId)
  ) {
    return res.status(400).json({ error: "Invalid parentId." });
  }

  try {
    const discussions = await discussionService.findByFilters({
      courseIds,
      authorIds,
      deleted,
      edited,
      hasReplies,
      parentId,
      populate,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    const discussionsWithAuthor = await Promise.all(
      discussions.map(async (discussion) => {
        const obj = discussion.toJSON();

        const authorId =
          typeof discussion.authorId === "object" && discussion.authorId !== null
            ? discussion.authorId._id?.toString()
            : discussion.authorId?.toString();

        const hasUpvote = req.user?.id
          ? await voteService.hasUpvote(discussion._id, req.user.id, "Discussion")
          : false;
        const hasDownvote = req.user?.id
          ? await voteService.hasDownvote(discussion._id, req.user.id, "Discussion")
          : false;

        return {
          ...obj,
          isAuthor: authorId === req.user?.id,
          hasUpvote,
          hasDownvote,
          hasImage: Boolean(discussion.image?.contentType),
          score: Number(discussion.upvotes || 0) - Number(discussion.downvotes || 0),
        };
      }),
    );

    return res.json(discussionsWithAuthor);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}

export const getLatest = getAll;

export async function getById(req, res) {
  const { id } = req.params;

  try {
    const discussion = await discussionService.findById(id);
    await discussion.populate({ path: "courseId", select: "code" });
    const obj = discussion.toJSON();

    const authorId =
      typeof discussion.authorId === "object" && discussion.authorId !== null
        ? discussion.authorId._id?.toString()
        : discussion.authorId?.toString();

    const hasUpvote = req.user?.id
      ? await voteService.hasUpvote(discussion._id, req.user.id, "Discussion")
      : false;
    const hasDownvote = req.user?.id
      ? await voteService.hasDownvote(discussion._id, req.user.id, "Discussion")
      : false;

    return res.json({
      ...obj,
      isAuthor: authorId === req.user?.id,
      hasUpvote,
      hasDownvote,
      hasImage: Boolean(discussion.image?.contentType),
      score: Number(discussion.upvotes || 0) - Number(discussion.downvotes || 0),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("No discussion") ? 404 : 500;
    return res.status(status).json({ error: message });
  }
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

export async function createReply(req, res) {
  const { parentId } = req.params;
  req.body = {
    ...req.body,
    parentid: parentId,
  };
  return create(req, res);
}

export async function update(req, res) {
  const { id } = req.params;
  const { updatedImage, content, title } = req.body;

  const wantsImageUpdate =
    updatedImage === true ||
    updatedImage === "true" ||
    updatedImage === "1";

  try {
    let discussion = null;
    if (wantsImageUpdate) {
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
        isAdmin: Boolean(req.admin),
        hasImage: req.file ? true : false,
      });
    } else {
      discussion = await discussionService.update(id, {
        _id: id,
        title: title,
        edited: true,
        content: content,
        authorId: req.userId,
        isAdmin: Boolean(req.admin),
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
    const result = await discussionService.remove(id, req.userId, {
      isAdmin: Boolean(req.admin),
    });
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
  const discussionsWithAuthor = await Promise.all(discussions.map(async (discussion) => {
    await discussion.populate({ path: "courseId", select: "code" });
    const obj = discussion.toJSON();

    return {
      ...obj,
      isAuthor: discussion.authorId?.toString() === req.user?.id,
    };
  }));
  res.status(200).json(discussionsWithAuthor);
}
