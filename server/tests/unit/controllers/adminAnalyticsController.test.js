import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockGetLastWeekDailyCounts = jest.fn();

await jest.unstable_mockModule("../../../services/adminAnalyticsService.js", () => ({
  getLastWeekDailyCounts: mockGetLastWeekDailyCounts,
}));

const controller = await import("../../../controllers/adminAnalyticsController.js");

describe("admin analytics controller", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("getLastWeek returns 200 with service data", async () => {
    const payload = {
      timezone: "UTC",
      range: { start: "a", endExclusive: "b" },
      days: [],
      weekDiscussionEngagement: { distinctUsers: 0, distinctCourses: 0 },
      leaders: { mostActiveUser: null, mostActiveCourse: null },
    };
    mockGetLastWeekDailyCounts.mockResolvedValue(payload);

    await controller.getLastWeek(req, res);

    expect(mockGetLastWeekDailyCounts).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: payload });
  });

  test("getLastWeek returns 500 when service throws", async () => {
    const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetLastWeekDailyCounts.mockRejectedValue(new Error("db down"));

    await controller.getLastWeek(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Could not load analytics" });
    errSpy.mockRestore();
  });
});
