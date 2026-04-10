import { Discussion } from "../models/discussion.js";

export async function aggregateCountByUtcDay(model, matchExtra, start, endExclusive) {
  const pipeline = [
    {
      $match: {
        createdAt: { $gte: start, $lt: endExclusive },
        ...matchExtra,
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" },
        },
        count: { $sum: 1 },
      },
    },
  ];
  return model.aggregate(pipeline);
}

export async function aggregateTopDiscussionUser() {
  return Discussion.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: "$authorId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        username: { $ifNull: ["$user.username", "Unknown user"] },
        postsAndComments: "$total",
      },
    },
  ]);
}

export async function aggregateTopDiscussionCourse() {
  return Discussion.aggregate([
    { $match: { deleted: false } },
    { $group: { _id: "$courseId", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: { path: "$course", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        courseId: "$_id",
        name: { $ifNull: ["$course.name", "Unknown course"] },
        code: { $ifNull: ["$course.code", ""] },
        postsAndComments: "$total",
      },
    },
  ]);
}

export async function aggregateWeekDiscussionEngagement(start, endExclusive) {
  return Discussion.aggregate([
    {
      $match: {
        deleted: false,
        createdAt: { $gte: start, $lt: endExclusive },
      },
    },
    {
      $facet: {
        users: [{ $group: { _id: "$authorId" } }, { $count: "count" }],
        courses: [{ $group: { _id: "$courseId" } }, { $count: "count" }],
      },
    },
  ]);
}
