import { jest, describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { User } from "../../../models/user.js";
import { Course } from "../../../models/course.js";
import { Discussion } from "../../../models/discussion.js";

const aggregateCountByUtcDay = jest.fn();
const aggregateTopDiscussionUser = jest.fn();
const aggregateTopDiscussionCourse = jest.fn();
const aggregateWeekDiscussionEngagement = jest.fn();

await jest.unstable_mockModule("../../../repositories/adminAnalyticsRepository.js", () => ({
  aggregateCountByUtcDay,
  aggregateTopDiscussionUser,
  aggregateTopDiscussionCourse,
  aggregateWeekDiscussionEngagement,
}));

const adminAnalyticsService = await import("../../../services/adminAnalyticsService.js");

describe("adminAnalyticsService", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-04-10T12:00:00.000Z"));
    jest.clearAllMocks();

    aggregateCountByUtcDay.mockResolvedValue([]);
    aggregateTopDiscussionUser.mockResolvedValue([]);
    aggregateTopDiscussionCourse.mockResolvedValue([]);
    aggregateWeekDiscussionEngagement.mockResolvedValue([{ users: [], courses: [] }]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("getLastWeekDailyCounts returns seven UTC days with merged counts", async () => {
    aggregateCountByUtcDay.mockImplementation((model, matchExtra) => {
      if (model === User) {
        return Promise.resolve([{ _id: "2026-04-10", count: 1 }]);
      }
      if (model === Course) {
        return Promise.resolve([{ _id: "2026-04-10", count: 2 }]);
      }
      if (model === Discussion && matchExtra.parentId === null) {
        return Promise.resolve([{ _id: "2026-04-10", count: 3 }]);
      }
      if (model === Discussion && matchExtra.parentId && "$ne" in matchExtra.parentId) {
        return Promise.resolve([{ _id: "2026-04-10", count: 4 }]);
      }
      return Promise.resolve([]);
    });

    const result = await adminAnalyticsService.getLastWeekDailyCounts();

    expect(result.days).toHaveLength(7);
    expect(result.days.map((d) => d.date)).toEqual([
      "2026-04-04",
      "2026-04-05",
      "2026-04-06",
      "2026-04-07",
      "2026-04-08",
      "2026-04-09",
      "2026-04-10",
    ]);

    const apr10 = result.days.find((d) => d.date === "2026-04-10");
    expect(apr10).toEqual({
      date: "2026-04-10",
      newUsers: 1,
      coursesCreated: 2,
      posts: 3,
      comments: 4,
    });

    const apr4 = result.days.find((d) => d.date === "2026-04-04");
    expect(apr4).toMatchObject({
      newUsers: 0,
      coursesCreated: 0,
      posts: 0,
      comments: 0,
    });

    expect(result.timezone).toBe("UTC");
    expect(result.range.start).toBe("2026-04-04T00:00:00.000Z");
    expect(result.range.endExclusive).toBe("2026-04-11T00:00:00.000Z");

    expect(aggregateCountByUtcDay).toHaveBeenCalledWith(
      User,
      {},
      expect.any(Date),
      expect.any(Date),
    );
    expect(aggregateCountByUtcDay).toHaveBeenCalledWith(
      Course,
      {},
      expect.any(Date),
      expect.any(Date),
    );
    expect(aggregateCountByUtcDay).toHaveBeenCalledWith(
      Discussion,
      { parentId: null, deleted: false },
      expect.any(Date),
      expect.any(Date),
    );
    expect(aggregateCountByUtcDay).toHaveBeenCalledWith(
      Discussion,
      { parentId: { $ne: null }, deleted: false },
      expect.any(Date),
      expect.any(Date),
    );
  });

  test("getLastWeekDailyCounts maps leaders and week engagement", async () => {
    aggregateTopDiscussionUser.mockResolvedValue([
      { userId: "u1", username: "alice", postsAndComments: 5 },
    ]);
    aggregateTopDiscussionCourse.mockResolvedValue([
      { courseId: "c1", name: "Algorithms", code: "COSC360", postsAndComments: 12 },
    ]);
    aggregateWeekDiscussionEngagement.mockResolvedValue([
      { users: [{ count: 7 }], courses: [{ count: 2 }] },
    ]);

    const result = await adminAnalyticsService.getLastWeekDailyCounts();

    expect(result.leaders).toEqual({
      mostActiveUser: {
        userId: "u1",
        username: "alice",
        postsAndComments: 5,
      },
      mostActiveCourse: {
        courseId: "c1",
        name: "Algorithms",
        code: "COSC360",
        postsAndComments: 12,
      },
    });

    expect(result.weekDiscussionEngagement).toEqual({
      distinctUsers: 7,
      distinctCourses: 2,
    });
  });

  test("getLastWeekDailyCounts yields null leaders when no activity rows", async () => {
    aggregateTopDiscussionUser.mockResolvedValue([]);
    aggregateTopDiscussionCourse.mockResolvedValue([]);

    const result = await adminAnalyticsService.getLastWeekDailyCounts();

    expect(result.leaders).toEqual({
      mostActiveUser: null,
      mostActiveCourse: null,
    });
  });

  test("getLastWeekDailyCounts yields null leaders when counts are zero", async () => {
    aggregateTopDiscussionUser.mockResolvedValue([
      { userId: "u1", username: "alice", postsAndComments: 0 },
    ]);
    aggregateTopDiscussionCourse.mockResolvedValue([
      { courseId: "c1", name: "X", code: "Y", postsAndComments: 0 },
    ]);

    const result = await adminAnalyticsService.getLastWeekDailyCounts();

    expect(result.leaders.mostActiveUser).toBeNull();
    expect(result.leaders.mostActiveCourse).toBeNull();
  });
});
