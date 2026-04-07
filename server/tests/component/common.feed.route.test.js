import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import express from "express";
import request from "supertest";

// Mock commonService BEFORE importing routes/controller
const feedMock = jest.fn();
const searchMock = jest.fn();

await jest.unstable_mockModule("../../services/commonService.js", () => ({
  feed: feedMock,
  search: searchMock,
}));

const { commonRoutes } = await import("../../routes/commonRoutes.js");

function buildTestApp() {
  const app = express();
  app.use(express.json());
  app.use("/common", commonRoutes);
  return app;
}

describe("GET /common/feed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when types are invalid", async () => {
    const app = buildTestApp();

    const res = await request(app).get("/common/feed?types=banana,apple");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid types query param" });
    expect(feedMock).not.toHaveBeenCalled();
  });

  it("returns 200 and forwards parsed params to service", async () => {
    const app = buildTestApp();

    feedMock.mockResolvedValue([
      { id: "1", type: "course", createdAt: "2026-01-01T00:00:00.000Z", data: {} },
    ]);

    const res = await request(app).get(
      "/common/feed?types=course,invalid&courseId=abc123&sort=oldest&limit=25"
    );

    expect(res.status).toBe(200);
    expect(feedMock).toHaveBeenCalledWith({
      types: ["course"],
      courseId: "abc123",
      courseIds: [],
      sort: "oldest",
      limit: 25,
    });
    expect(res.body).toEqual({
      data: [{ id: "1", type: "course", createdAt: "2026-01-01T00:00:00.000Z", data: {} }],
    });
  });

  it("parses courseIds and clamps limit to max 100", async () => {
    const app = buildTestApp();

    feedMock.mockResolvedValue([]);

    const res = await request(app).get(
      "/common/feed?types=discussion,resource&courseIds=a,b,c&limit=999"
    );

    expect(res.status).toBe(200);
    expect(feedMock).toHaveBeenCalledWith({
      types: ["discussion", "resource"],
      courseId: null,
      courseIds: ["a", "b", "c"],
      sort: "newest",
      limit: 100,
    });
  });
});