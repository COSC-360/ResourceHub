import { User } from "../models/user.js";
import { Course } from "../models/course.js";
import { Discussion } from "../models/discussion.js";

const DAY_MS = 86400000;

function utcLastSevenDayRange() {
  const now = new Date();
  const endExclusive = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
  const start = new Date(endExclusive.getTime() - 7 * DAY_MS);
  const labels = [];
  for (let t = start.getTime(); t < endExclusive.getTime(); t += DAY_MS) {
    labels.push(new Date(t).toISOString().slice(0, 10));
  }
  return { start, endExclusive, labels };
}

async function countByUtcDay(model, matchExtra, start, endExclusive) {
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

export async function getLastWeekDailyCounts() {
  const { start, endExclusive, labels } = utcLastSevenDayRange();

  const [usersAgg, coursesAgg, postsAgg, commentsAgg] = await Promise.all([
    countByUtcDay(User, {}, start, endExclusive),
    countByUtcDay(Course, {}, start, endExclusive),
    countByUtcDay(Discussion, { parentId: null, deleted: false }, start, endExclusive),
    countByUtcDay(Discussion, { parentId: { $ne: null }, deleted: false }, start, endExclusive),
  ]);

  const toMap = (rows) => new Map(rows.map((r) => [r._id, r.count]));

  const usersM = toMap(usersAgg);
  const coursesM = toMap(coursesAgg);
  const postsM = toMap(postsAgg);
  const commentsM = toMap(commentsAgg);

  const days = labels.map((date) => ({
    date,
    newUsers: usersM.get(date) ?? 0,
    coursesCreated: coursesM.get(date) ?? 0,
    posts: postsM.get(date) ?? 0,
    comments: commentsM.get(date) ?? 0,
  }));

  return {
    timezone: "UTC",
    range: { start: start.toISOString(), endExclusive: endExclusive.toISOString() },
    days,
  };
}
