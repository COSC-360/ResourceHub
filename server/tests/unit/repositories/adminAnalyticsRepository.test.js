import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const discussionAggregate = jest.fn();

await jest.unstable_mockModule("../../../models/discussion.js", () => ({
  Discussion: { aggregate: discussionAggregate },
}));

const adminAnalyticsRepository = await import("../../../repositories/adminAnalyticsRepository.js");

describe("adminAnalyticsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("aggregateCountByUtcDay", () => {
    test("calls model.aggregate with date range and extra match fields", async () => {
      const aggregate = jest.fn().mockResolvedValue([{ _id: "2026-04-10", count: 2 }]);
      const model = { aggregate };
      const start = new Date("2026-04-04T00:00:00.000Z");
      const endExclusive = new Date("2026-04-11T00:00:00.000Z");

      const rows = await adminAnalyticsRepository.aggregateCountByUtcDay(
        model,
        { deleted: false },
        start,
        endExclusive,
      );

      expect(aggregate).toHaveBeenCalledTimes(1);
      const pipeline = aggregate.mock.calls[0][0];
      expect(pipeline[0].$match).toEqual({
        createdAt: { $gte: start, $lt: endExclusive },
        deleted: false,
      });
      expect(pipeline[1].$group.count).toEqual({ $sum: 1 });
      expect(rows).toEqual([{ _id: "2026-04-10", count: 2 }]);
    });
  });

  describe("aggregateTopDiscussionUser", () => {
    test("delegates to Discussion.aggregate", async () => {
      discussionAggregate.mockResolvedValue([{ userId: "u1", username: "bob", postsAndComments: 3 }]);

      const rows = await adminAnalyticsRepository.aggregateTopDiscussionUser();

      expect(discussionAggregate).toHaveBeenCalledTimes(1);
      const pipeline = discussionAggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({ $match: { deleted: false } });
      expect(pipeline[1]).toEqual({ $group: { _id: "$authorId", total: { $sum: 1 } } });
      expect(pipeline[2]).toEqual({ $sort: { total: -1 } });
      expect(pipeline[3]).toEqual({ $limit: 1 });
      expect(rows).toEqual([{ userId: "u1", username: "bob", postsAndComments: 3 }]);
    });
  });

  describe("aggregateTopDiscussionCourse", () => {
    test("delegates to Discussion.aggregate", async () => {
      discussionAggregate.mockResolvedValue([
        { courseId: "c1", name: "Intro", code: "CS100", postsAndComments: 9 },
      ]);

      const rows = await adminAnalyticsRepository.aggregateTopDiscussionCourse();

      expect(discussionAggregate).toHaveBeenCalledTimes(1);
      const pipeline = discussionAggregate.mock.calls[0][0];
      expect(pipeline[0]).toEqual({ $match: { deleted: false } });
      expect(pipeline[1]).toEqual({ $group: { _id: "$courseId", total: { $sum: 1 } } });
      expect(rows).toEqual([{ courseId: "c1", name: "Intro", code: "CS100", postsAndComments: 9 }]);
    });
  });

  describe("aggregateWeekDiscussionEngagement", () => {
    test("runs facet pipeline for distinct users and courses", async () => {
      discussionAggregate.mockResolvedValue([
        { users: [{ count: 4 }], courses: [{ count: 1 }] },
      ]);
      const start = new Date("2026-04-04T00:00:00.000Z");
      const endExclusive = new Date("2026-04-11T00:00:00.000Z");

      const rows = await adminAnalyticsRepository.aggregateWeekDiscussionEngagement(start, endExclusive);

      expect(discussionAggregate).toHaveBeenCalledTimes(1);
      const pipeline = discussionAggregate.mock.calls[0][0];
      expect(pipeline[0].$match).toEqual({
        deleted: false,
        createdAt: { $gte: start, $lt: endExclusive },
      });
      expect(pipeline[1].$facet).toBeDefined();
      expect(pipeline[1].$facet.users).toHaveLength(2);
      expect(pipeline[1].$facet.courses).toHaveLength(2);
      expect(rows).toEqual([{ users: [{ count: 4 }], courses: [{ count: 1 }] }]);
    });
  });
});
