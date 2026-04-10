import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockIsValid = jest.fn();

class MockSchema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
  }
}

await jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: mockIsValid,
      },
    },
    Schema: Object.assign(MockSchema, {
      Types: {
        Mixed: "Mixed",
      },
    }),
    model: jest.fn(),
  },
}));

const mockFindByUserAndCourse = jest.fn();

await jest.unstable_mockModule(
  "../../../repositories/membershipRepository.js",
  () => ({
    findByUserAndCourse: mockFindByUserAndCourse,
  }),
);

const { requireCourseInstructor } =
  await import("../../../middleware/courseInstructorMiddleware.js");

describe("requireCourseInstructor", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      user: { id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    mockIsValid.mockReset();
    mockFindByUserAndCourse.mockReset();
  });

  test("returns 400 if courseId is invalid", async () => {
    req.params.id = "bad-id";
    mockIsValid.mockReturnValue(false);

    await requireCourseInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid course id",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 if membership not found", async () => {
    req.params.id = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindByUserAndCourse.mockResolvedValue(null);

    await requireCourseInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Instructor access required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 403 if user is not instructor", async () => {
    req.params.courseId = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindByUserAndCourse.mockResolvedValue({
      role: "student",
    });

    await requireCourseInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Instructor access required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next if user is instructor", async () => {
    req.params.id = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindByUserAndCourse.mockResolvedValue({
      role: "instructor",
    });

    await requireCourseInstructor(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("returns 500 if repository throws error", async () => {
    req.params.id = "validid";
    mockIsValid.mockReturnValue(true);

    mockFindByUserAndCourse.mockRejectedValue(new Error("Database error"));

    await requireCourseInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Database error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 400 if no courseId provided", async () => {
    mockIsValid.mockReturnValue(false);

    await requireCourseInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 403 if userId is missing", async () => {
    req.params.id = "validid";
    req.user = {}; // no id
    mockIsValid.mockReturnValue(true);

    mockFindByUserAndCourse.mockResolvedValue(null);

    await requireCourseInstructor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
