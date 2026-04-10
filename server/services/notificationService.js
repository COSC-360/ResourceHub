import mongoose from "mongoose";
import { Discussion } from "../models/discussion.js";
import { Resource } from "../models/resource.js";
import * as membershipRepository from "../repositories/membershipRepository.js";

export async function getNotifications(since, { userId, isAdmin } = {}) {
  const sinceDate = new Date(since);

  let courseFilter = {};
  if (!isAdmin) {
    if (!userId) {
      return { count: 0, items: [] };
    }
    const courseIdStrings = await membershipRepository.findCourseIdsByUser(
      userId,
    );
    const courseIds = courseIdStrings
      .map((id) => {
        try {
          return new mongoose.Types.ObjectId(id);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    if (courseIds.length === 0) {
      return { count: 0, items: [] };
    }
    courseFilter = { courseId: { $in: courseIds } };
  }

  const discussionQuery = {
    createdAt: { $gt: sinceDate },
    deleted: false,
    ...courseFilter,
  };
  if (userId) {
    try {
      discussionQuery.authorId = {
        $ne: new mongoose.Types.ObjectId(userId),
      };
    } catch {
      /* invalid id: omit author filter */
    }
  }

  const discussions = await Discussion.find(discussionQuery).sort({
    createdAt: -1,
  });

  const resources = await Resource.find({
    createdAt: { $gt: sinceDate },
    ...courseFilter,
  }).sort({ createdAt: -1 });

  const discussionItems = discussions.map((item) => ({
    type: "discussion",
    id: item._id,
    text: `New discussion: ${item.title || "Untitled discussion"}`,
    createdAt: item.createdAt,
  }));

  const resourceItems = resources.map((item) => ({
    type: "resource",
    id: item._id,
    text: `New resource: ${item.name || "Untitled resource"}`,
    createdAt: item.createdAt,
  }));

  const items = [...discussionItems, ...resourceItems]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return {
    count: items.length,
    items,
  };
}