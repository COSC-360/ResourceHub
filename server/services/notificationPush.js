import { getIO } from "../socket.js";
import * as membershipRepository from "../repositories/membershipRepository.js";
import * as userRepository from "../repositories/userRepository.js";

function normalizeId(id) {
  if (id == null) return "";
  return String(id);
}

function discussionToItem(discussion) {
  const d =
    typeof discussion?.toJSON === "function" ? discussion.toJSON() : discussion;
  return {
    type: "discussion",
    id: d._id ?? d.id,
    text: `New discussion: ${d.title || "Untitled discussion"}`,
    createdAt: d.createdAt ?? new Date().toISOString(),
  };
}

function resourceToItem(resource) {
  const r = typeof resource?.toJSON === "function" ? resource.toJSON() : resource;
  return {
    type: "resource",
    id: r._id ?? r.id,
    text: `New resource: ${r.name || "Untitled resource"}`,
    createdAt: r.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Matches notificationService: course members + admins, excluding the author.
 */
export async function pushNewDiscussionNotification(discussion, courseId, authorId) {
  let io;
  try {
    io = getIO();
  } catch {
    return;
  }

  const item = discussionToItem(discussion);
  const author = normalizeId(authorId);
  const memberIds = await membershipRepository.findUserIdsByCourse(courseId);
  const adminIds = await userRepository.findAdminUserIds();
  const recipients = new Set(
    [...memberIds, ...adminIds].map(normalizeId).filter(Boolean),
  );
  recipients.delete(author);

  for (const uid of recipients) {
    io.to(`user:${uid}`).emit("notification:new", { item });
  }
}

/**
 * Matches notificationService: course members + all admins (no author exclusion).
 */
export async function pushNewResourceNotification(resource) {
  let io;
  try {
    io = getIO();
  } catch {
    return;
  }

  const r = typeof resource?.toJSON === "function" ? resource.toJSON() : resource;
  const courseId = r.courseId;
  if (!courseId) return;

  const item = resourceToItem(resource);
  const memberIds = await membershipRepository.findUserIdsByCourse(courseId);
  const adminIds = await userRepository.findAdminUserIds();
  const recipients = new Set(
    [...memberIds, ...adminIds].map(normalizeId).filter(Boolean),
  );

  for (const uid of recipients) {
    io.to(`user:${uid}`).emit("notification:new", { item });
  }
}
