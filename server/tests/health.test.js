import request from "supertest";
import app from "../app.js";

describe("GET /api/health", () => {
  it("returns 200", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
  });
});