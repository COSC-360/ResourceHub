import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockIsValid = jest.fn();

await jest.unstable_mockModule("mongoose", () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: mockIsValid,
      },
    },
    Error: {
      ValidationError: class ValidationError extends Error {},
    },
  },
}));

const mockCourseService = {
  getById: jest.fn(),
  create: jest.fn(),
  getAll: jest.fn(),
  update: jest.fn(),
  updateImage: jest.fn(),
  deleteCourse: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/courseService.js",
  () => mockCourseService,
);

const mockDiscussionService = {
  getAllDiscussionsByCourse: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/discussionService.js",
  () => mockDiscussionService,
);

class MockCourseCodeAlreadyExistsError extends Error {}
await jest.unstable_mockModule("../../../errors/courseErrors.js", () => ({
  CourseCodeAlreadyExistsError: MockCourseCodeAlreadyExistsError,
}));

const controller = await import("../../../controllers/courseController.js");

describe("course controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: "user1" },
      file: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("getById - invalid id", async () => {
    req.params.id = "bad";
    mockIsValid.mockReturnValue(false);

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getById - not found", async () => {
    req.params.id = "valid";
    mockIsValid.mockReturnValue(true);
    mockCourseService.getById.mockResolvedValue(null);

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getById - success", async () => {
    req.params.id = "valid";
    mockIsValid.mockReturnValue(true);
    mockCourseService.getById.mockResolvedValue({ id: "1" });

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("create - missing name", async () => {
    req.body = { code: "C1" };

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("create - unauthorized (no user)", async () => {
    req.user = null;
    req.body = { name: "Course", code: "C1" };

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("create - success", async () => {
    req.body = { name: "Course", code: "C1" };
    mockCourseService.create.mockResolvedValue({ id: "1" });

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("create - duplicate error", async () => {
    req.body = { name: "Course", code: "C1" };

    mockCourseService.create.mockRejectedValue(
      new MockCourseCodeAlreadyExistsError("exists"),
    );

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("update - invalid id", async () => {
    req.params.id = "bad";
    mockIsValid.mockReturnValue(false);

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("update - no fields", async () => {
    req.params.id = "valid";
    mockIsValid.mockReturnValue(true);

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("update - success", async () => {
    req.params.id = "valid";
    req.body = { name: "New Name" };

    mockIsValid.mockReturnValue(true);
    mockCourseService.update.mockResolvedValue({ id: "1" });

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("update - not found", async () => {
    req.params.id = "valid";
    req.body = { name: "New Name" };

    mockIsValid.mockReturnValue(true);
    mockCourseService.update.mockResolvedValue(null);

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateImage - no file", async () => {
    req.params.id = "valid";
    mockIsValid.mockReturnValue(true);

    await controller.updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateImage - success", async () => {
    req.params.id = "valid";
    req.file = { filename: "img.png" };

    mockIsValid.mockReturnValue(true);
    mockCourseService.updateImage.mockResolvedValue({});

    await controller.updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateImage - file too large", async () => {
    req.params.id = "valid";
    req.file = { filename: "img.png" };

    mockIsValid.mockReturnValue(true);
    mockCourseService.updateImage.mockRejectedValue({
      code: "LIMIT_FILE_SIZE",
    });

    await controller.updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deleteCourse - invalid id", async () => {
    req.params.id = "bad";
    mockIsValid.mockReturnValue(false);

    await controller.deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("deleteCourse - success", async () => {
    req.params.id = "valid";
    mockIsValid.mockReturnValue(true);

    mockCourseService.deleteCourse.mockResolvedValue({});

    await controller.deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getDiscussions - invalid id", async () => {
    req.params.id = "bad";
    mockIsValid.mockReturnValue(false);

    await controller.getDiscussions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getDiscussions - success", async () => {
    req.params.id = "valid";
    mockIsValid.mockReturnValue(true);

    mockDiscussionService.getAllDiscussionsByCourse.mockResolvedValue([]);

    await controller.getDiscussions(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getAll - success", async () => {
    mockCourseService.getAll.mockResolvedValue([]);

    await controller.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
