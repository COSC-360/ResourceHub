import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockVerifyAccessToken = jest.fn();

await jest.unstable_mockModule("../../../middleware/authMiddleware.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

const mockGetUserById = jest.fn();

await jest.unstable_mockModule(
  "../../../repositories/userRepository.js",
  () => ({
    getUserById: mockGetUserById,
  }),
);

const { requireAdmin } = await import("../../../middleware/adminMiddleware.js");

describe("requireAdmin", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: "user1", admin: true },
      userId: "user1",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    mockVerifyAccessToken.mockReset();
    mockGetUserById.mockReset();
  });

  test("returns 401 if userId is missing", async () => {
    req.user = {};
    req.userId = undefined;

    mockVerifyAccessToken.mockImplementation((_req, _res, cb) => cb());

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("returns 403 if token admin is false", async () => {
    req.user = { id: "user1", admin: false };

    mockVerifyAccessToken.mockImplementation((_req, _res, cb) => cb());

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Admin access required",
    });
  });

  test("returns 401 if user profile not found", async () => {
    mockVerifyAccessToken.mockImplementation((_req, _res, cb) => cb());

    mockGetUserById.mockResolvedValue(null);

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("returns 403 if DB user is not admin", async () => {
    mockVerifyAccessToken.mockImplementation((_req, _res, cb) => cb());

    mockGetUserById.mockResolvedValue({ isAdmin: false });

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Admin access required",
    });
  });

  test("calls next and sets req.admin for valid admin", async () => {
    mockVerifyAccessToken.mockImplementation((_req, _res, cb) => cb());

    mockGetUserById.mockResolvedValue({ isAdmin: true });

    await requireAdmin(req, res, next);

    expect(req.admin).toBe(true);
    expect(req.user.admin).toBe(true);
    expect(req.userId).toBe("user1");
    expect(next).toHaveBeenCalled();
  });

  test("does nothing if verifyAccessToken does not call next", async () => {
    mockVerifyAccessToken.mockImplementation(() => {
      // left empty on purpose
    });

    await requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  test("returns 500 if repository throws", async () => {
    mockVerifyAccessToken.mockImplementation((_req, _res, cb) => cb());

    mockGetUserById.mockRejectedValue(new Error("DB error"));

    await requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to verify admin permissions",
    });
  });
});
