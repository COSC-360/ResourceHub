import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import express from "express";
import request from "supertest";

const getLastWeekDailyCountsMock = jest.fn();

await jest.unstable_mockModule("../../services/adminAnalyticsService.js", () => ({
  getLastWeekDailyCounts: getLastWeekDailyCountsMock,
}));

await jest.unstable_mockModule("../../middleware/adminMiddleware.js", () => ({
  requireAdmin: (_req, _res, next) => next(),
}));

const { adminAnalyticsRoutes } = await import("../../routes/adminAnalyticsRoutes.js");

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/analytics", adminAnalyticsRoutes);
  return app;
}

describe("GET /analytics/week", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and JSON body from service", async () => {
    const app = buildTestApp();
    const payload = {
      timezone: "UTC",
      range: { start: "2026-04-04T00:00:00.000Z", endExclusive: "2026-04-11T00:00:00.000Z" },
      days: [{ date: "2026-04-10", newUsers: 0, coursesCreated: 0, posts: 1, comments: 0 }],
      weekDiscussionEngagement: { distinctUsers: 2, distinctCourses: 1 },
      leaders: { mostActiveUser: null, mostActiveCourse: null },
    };
    getLastWeekDailyCountsMock.mockResolvedValue(payload);

    const res = await request(app).get("/analytics/week");

    expect(res.status).toBe(200);
    expect(getLastWeekDailyCountsMock).toHaveBeenCalledTimes(1);
    expect(res.body).toEqual({ data: payload });
  });

  it("returns 500 when service throws", async () => {
    const app = buildTestApp();
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    getLastWeekDailyCountsMock.mockRejectedValue(new Error("fail"));

    const res = await request(app).get("/analytics/week");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Could not load analytics" });
    errSpy.mockRestore();
  });
});
