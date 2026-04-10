import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockIsValid = jest.fn();

await jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: mockIsValid,
      },
    },
  },
}));

const mockFindDiscussionById = jest.fn();

await jest.unstable_mockModule(
  "../../../repositories/discussionRepository.js",
  () => ({
    DiscussionRepository: {
      findById: mockFindDiscussionById,
    },
  }),
);

const mockFindMembership = jest.fn();

await jest.unstable_mockModule(
  "../../../repositories/membershipRepository.js",
  () => ({
    findByUserAndCourse: mockFindMembership,
  }),
);

const { requireCourseMembership } =
  await import("../../../middleware/courseMembershipMiddleware.js");

describe("requireCourseMembership", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: { id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    mockIsValid.mockReset();
    mockFindDiscussionById.mockReset();
    mockFindMembership.mockReset();
  });

  test("returns 401 if userId is missing", async () => {
    req.user = null;

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
  });

  test("returns 400 if courseId is not provided", async () => {
    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "courseId is required",
    });
  });

  test("returns 400 if courseId is invalid", async () => {
    req.params.courseId = "badid";
    mockIsValid.mockReturnValue(false);

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid courseId",
    });
  });

  test("returns 403 if membership not found", async () => {
    req.params.courseId = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindMembership.mockResolvedValue(null);

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Course membership required",
    });
  });

  test("calls next and sets req.courseId if membership exists", async () => {
    req.params.courseId = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindMembership.mockResolvedValue({ role: "student" });

    await requireCourseMembership(req, res, next);

    expect(req.courseId).toBe("validid");
    expect(next).toHaveBeenCalled();
  });

  test("returns 400 if discussionId is invalid", async () => {
    req.params.id = "badDiscussionId";
    mockIsValid.mockReturnValue(false);

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid discussionId",
    });
  });

  test("returns 400 if discussion has no courseId", async () => {
    req.params.id = "validDiscussionId";
    mockIsValid.mockReturnValue(true);

    mockFindDiscussionById.mockResolvedValue(null);

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "courseId is required",
    });
  });

  test("returns 400 if derived courseId is invalid", async () => {
    req.params.id = "validDiscussionId";

    mockIsValid.mockReturnValueOnce(true).mockReturnValueOnce(false);

    mockFindDiscussionById.mockResolvedValue({
      courseId: "badCourseId",
    });

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid courseId",
    });
  });

  test("uses discussion fallback and succeeds", async () => {
    req.params.id = "discussionId";

    mockIsValid.mockReturnValueOnce(true).mockReturnValueOnce(true);

    mockFindDiscussionById.mockResolvedValue({
      courseId: "course123",
    });

    mockFindMembership.mockResolvedValue({ role: "student" });

    await requireCourseMembership(req, res, next);

    expect(req.courseId).toBe("course123");
    expect(next).toHaveBeenCalled();
  });

  test("returns 500 if something throws", async () => {
    req.params.courseId = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindMembership.mockRejectedValue(new Error("DB error"));

    await requireCourseMembership(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "DB error",
    });
  });
});
