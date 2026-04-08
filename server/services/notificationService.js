import { Discussion } from "../models/discussion.js";
import { Resource } from "../models/resource.js";

export async function getNotifications(since) {
  const sinceDate = new Date(since);

  const discussions = await Discussion.find({
    createdAt: { $gt: sinceDate },
    deleted: false,
  }).sort({ createdAt: -1 });

  const resources = await Resource.find({
    createdAt: { $gt: sinceDate },
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