import { jest, describe, test, expect, beforeEach } from "@jest/globals";

// 🔧 mock membershipService
const mockService = {
  getMyMembershipStatus: jest.fn(),
  joinCourse: jest.fn(),
  leaveCourse: jest.fn(),
  getMyCourseIds: jest.fn(),
  getMyCourses: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/membershipService.js",
  () => mockService,
);

// 📦 import AFTER mocks
const controller = await import("../../../controllers/membershipController.js");

describe("membership controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { courseId: "course1" },
      user: { id: "user1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("getMyStatus - success", async () => {
    mockService.getMyMembershipStatus.mockResolvedValue({
      isMember: true,
      membership: { role: "student" },
    });

    await controller.getMyStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      isMember: true,
      role: "student",
    });
  });

  test("getMyStatus - no membership", async () => {
    mockService.getMyMembershipStatus.mockResolvedValue({
      isMember: false,
      membership: null,
    });

    await controller.getMyStatus(req, res);

    expect(res.json).toHaveBeenCalledWith({
      isMember: false,
      role: null,
    });
  });

  test("getMyStatus - invalid error", async () => {
    mockService.getMyMembershipStatus.mockRejectedValue(
      new Error("Invalid courseId"),
    );

    await controller.getMyStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getMyStatus - server error", async () => {
    mockService.getMyMembershipStatus.mockRejectedValue(new Error("DB error"));

    await controller.getMyStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("join - new membership (201)", async () => {
    mockService.joinCourse.mockResolvedValue({
      alreadyMember: false,
      memberCount: 10,
    });

    await controller.join(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      isMember: true,
      memberCount: 10,
      message: "Joined course",
    });
  });

  test("join - already member (200)", async () => {
    mockService.joinCourse.mockResolvedValue({
      alreadyMember: true,
      memberCount: 10,
    });

    await controller.join(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      isMember: true,
      memberCount: 10,
      message: "Already joined",
    });
  });

  test("join - invalid error", async () => {
    mockService.joinCourse.mockRejectedValue(new Error("Invalid courseId"));

    await controller.join(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("leave - successfully removed", async () => {
    mockService.leaveCourse.mockResolvedValue({
      removed: true,
      memberCount: 5,
    });

    await controller.leave(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      isMember: false,
      memberCount: 5,
      message: "Left course",
    });
  });

  test("leave - not enrolled", async () => {
    mockService.leaveCourse.mockResolvedValue({
      removed: false,
      memberCount: 5,
    });

    await controller.leave(req, res);

    expect(res.json).toHaveBeenCalledWith({
      isMember: false,
      memberCount: 5,
      message: "Not enrolled",
    });
  });

  test("leave - invalid error", async () => {
    mockService.leaveCourse.mockRejectedValue(new Error("Invalid courseId"));

    await controller.leave(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getMyCourseIds - success", async () => {
    mockService.getMyCourseIds.mockResolvedValue(["c1", "c2"]);

    await controller.getMyCourseIds(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: ["c1", "c2"],
    });
  });

  test("getMyCourseIds - error", async () => {
    mockService.getMyCourseIds.mockRejectedValue(new Error("DB error"));

    await controller.getMyCourseIds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getMyCourses - success", async () => {
    mockService.getMyCourses.mockResolvedValue([{ id: "c1" }]);

    await controller.getMyCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: "c1" }],
    });
  });

  test("getMyCourses - error", async () => {
    mockService.getMyCourses.mockRejectedValue(new Error("DB error"));

    await controller.getMyCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
