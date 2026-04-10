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

const mockDiscussionService = {
  findByFilters: jest.fn(),
  findById: jest.fn(),
  findImageById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findReplies: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/discussionService.js",
  () => mockDiscussionService,
);

const mockVoteService = {
  hasUpvote: jest.fn(),
  hasDownvote: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/voteService.js",
  () => mockVoteService,
);

await jest.unstable_mockModule("../../../socket.js", () => ({
  getIO: () => ({
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  }),
}));

const controller = await import("../../../controllers/discussionController.js");

describe("discussion controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: "user1" },
      userId: "user1",
      admin: false,
      file: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      set: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("getAll - invalid courseIds", async () => {
    req.query.courseIds = "badid";
    mockIsValid.mockReturnValue(false);

    await controller.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getAll - success with votes + score", async () => {
    mockIsValid.mockReturnValue(true);

    const fakeDiscussion = {
      _id: "d1",
      authorId: "user1",
      upvotes: 5,
      downvotes: 2,
      image: { contentType: "image/png" },
      toJSON: () => ({ content: "test" }),
    };

    mockDiscussionService.findByFilters.mockResolvedValue([fakeDiscussion]);
    mockVoteService.hasUpvote.mockResolvedValue(true);
    mockVoteService.hasDownvote.mockResolvedValue(false);

    await controller.getAll(req, res);

    const result = res.json.mock.calls[0][0][0];

    expect(result.isAuthor).toBe(true);
    expect(result.hasUpvote).toBe(true);
    expect(result.hasDownvote).toBe(false);
    expect(result.score).toBe(3);
    expect(result.hasImage).toBe(true);
  });

  test("getById - success", async () => {
    const fakeDiscussion = {
      _id: "d1",
      authorId: "user1",
      upvotes: 4,
      downvotes: 1,
      image: {},
      populate: jest.fn(),
      toJSON: () => ({ content: "hello" }),
    };

    mockDiscussionService.findById.mockResolvedValue(fakeDiscussion);
    mockVoteService.hasUpvote.mockResolvedValue(true);
    mockVoteService.hasDownvote.mockResolvedValue(false);

    await controller.getById(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("getById - not found error", async () => {
    mockDiscussionService.findById.mockRejectedValue(
      new Error("No discussion found"),
    );

    await controller.getById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("create - missing content", async () => {
    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("create - missing title for top-level", async () => {
    req.body.content = "test";

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("create - success", async () => {
    req.body = { content: "test", title: "Title" };
    req.courseId = "course1";

    mockDiscussionService.create.mockResolvedValue({ id: "d1" });

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("update - success without image", async () => {
    req.params.id = "d1";
    req.body = { content: "updated" };

    mockDiscussionService.update.mockResolvedValue({});

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("update - success with image", async () => {
    req.params.id = "d1";
    req.body = { updatedImage: "true" };
    req.file = { buffer: Buffer.from("x"), mimetype: "image/png" };

    mockDiscussionService.update.mockResolvedValue({});

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("update - unauthorized error", async () => {
    req.params.id = "d1";

    mockDiscussionService.update.mockRejectedValue(new Error("Not authorized"));

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("remove - success", async () => {
    req.params.id = "d1";

    mockDiscussionService.remove.mockResolvedValue({});

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("remove - unauthorized", async () => {
    req.params.id = "d1";

    mockDiscussionService.remove.mockRejectedValue(new Error("Not authorized"));

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("getImage - success", async () => {
    req.params.id = "d1";

    mockDiscussionService.findImageById.mockResolvedValue({
      contentType: "image/png",
      data: Buffer.from("img"),
    });

    await controller.getImage(req, res);

    expect(res.set).toHaveBeenCalledWith("Content-Type", "image/png");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getReplies - success", async () => {
    const fakeDiscussion = {
      authorId: "user1",
      populate: jest.fn(),
      toJSON: () => ({ content: "reply" }),
    };

    mockDiscussionService.findReplies.mockResolvedValue([fakeDiscussion]);

    await controller.getReplies(req, res);

    const result = res.json.mock.calls[0][0][0];
    expect(result.isAuthor).toBe(true);
  });
});
