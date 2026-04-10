import { User } from "../models/user.js";
import { Course } from "../models/course.js";
import { Discussion } from "../models/discussion.js";
import * as adminAnalyticsRepository from "../repositories/adminAnalyticsRepository.js";

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

function mapActivityLeaders(userTop, courseTop) {
  const u = userTop[0];
  const c = courseTop[0];

  return {
    mostActiveUser:
      u && u.postsAndComments > 0
        ? {
            userId: String(u.userId),
            username: u.username,
            postsAndComments: u.postsAndComments,
          }
        : null,
    mostActiveCourse:
      c && c.postsAndComments > 0
        ? {
            courseId: String(c.courseId),
            name: c.name,
            code: c.code,
            postsAndComments: c.postsAndComments,
          }
        : null,
  };
}

function mapWeekDiscussionEngagement(facetRows) {
  const facet = facetRows[0] || { users: [], courses: [] };
  return {
    distinctUsers: facet.users[0]?.count ?? 0,
    distinctCourses: facet.courses[0]?.count ?? 0,
  };
}

export async function getLastWeekDailyCounts() {
  const { start, endExclusive, labels } = utcLastSevenDayRange();

  const [
    usersAgg,
    coursesAgg,
    postsAgg,
    commentsAgg,
    userLeaderRows,
    courseLeaderRows,
    engagementFacetRows,
  ] = await Promise.all([
    adminAnalyticsRepository.aggregateCountByUtcDay(User, {}, start, endExclusive),
    adminAnalyticsRepository.aggregateCountByUtcDay(Course, {}, start, endExclusive),
    adminAnalyticsRepository.aggregateCountByUtcDay(
      Discussion,
      { parentId: null, deleted: false },
      start,
      endExclusive,
    ),
    adminAnalyticsRepository.aggregateCountByUtcDay(
      Discussion,
      { parentId: { $ne: null }, deleted: false },
      start,
      endExclusive,
    ),
    adminAnalyticsRepository.aggregateTopDiscussionUser(),
    adminAnalyticsRepository.aggregateTopDiscussionCourse(),
    adminAnalyticsRepository.aggregateWeekDiscussionEngagement(start, endExclusive),
  ]);

  const leaders = mapActivityLeaders(userLeaderRows, courseLeaderRows);
  const weekDiscussionEngagement = mapWeekDiscussionEngagement(engagementFacetRows);

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
    weekDiscussionEngagement,
    leaders,
  };
}
