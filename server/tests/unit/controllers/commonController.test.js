import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockCommonService = {
  search: jest.fn(),
  feed: jest.fn(),
};

const mockVoteService = {
  hasUpvote: jest.fn(),
  hasDownvote: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/commonService.js",
  () => mockCommonService,
);

await jest.unstable_mockModule(
  "../../../services/voteService.js",
  () => mockVoteService,
);

const controller = await import("../../../controllers/commonController.js");

describe("common controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      user: { id: "user1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("search - missing term", async () => {
    await controller.search(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("search - success", async () => {
    req.query.term = "test";
    mockCommonService.search.mockResolvedValue(["result"]);

    await controller.search(req, res);

    expect(mockCommonService.search).toHaveBeenCalledWith({
      term: "test",
      courseIds: [],
      types: ["discussion", "course"],
      sortOrder: "desc",
      page: 1,
      limit: 20,
      deleted: undefined,
      edited: undefined,
      hasReplies: undefined,
      topLevelOnly: true,
    });
    expect(res.json).toHaveBeenCalledWith({
      searchResults: ["result"],
    });
  });

  test("search - invalid courseIds", async () => {
    req.query.term = "test";
    req.query.courseIds = "not-an-object-id";

    await controller.search(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockCommonService.search).not.toHaveBeenCalled();
  });

  test("search - invalid types", async () => {
    req.query.term = "test";
    req.query.types = "invalid-type";

    await controller.search(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockCommonService.search).not.toHaveBeenCalled();
  });

  test("search - service error", async () => {
    req.query.term = "test";
    mockCommonService.search.mockRejectedValue(new Error("boom"));

    await controller.search(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "boom" });
  });

  test("feed - invalid types", async () => {
    req.query.types = "invalid";

    await controller.feed(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("feed - success with enrichment", async () => {
    req.query = {
      types: "discussion,course",
      limit: "10",
    };

    const mockData = [
      {
        type: "discussion",
        data: {
          _id: "d1",
          image: { contentType: "image/png" },
          toJSON: () => ({ _id: "d1" }),
        },
      },
      {
        type: "course",
        data: {
          _id: "c1",
          toJSON: () => ({ _id: "c1" }),
        },
      },
    ];

    mockCommonService.feed.mockResolvedValue(mockData);

    mockVoteService.hasUpvote.mockResolvedValue(true);
    mockVoteService.hasDownvote.mockResolvedValue(false);

    await controller.feed(req, res);

    expect(mockCommonService.feed).toHaveBeenCalledWith({
      types: ["discussion", "course"],
      courseId: null,
      courseIds: [],
      sort: "newest",
      limit: 10,
    });

    expect(res.status).toHaveBeenCalledWith(200);

    const response = res.json.mock.calls[0][0];

    expect(response.data.length).toBe(2);

    expect(response.data[0].data).toMatchObject({
      _id: "d1",
      hasImage: true,
      hasUpvote: true,
      hasDownvote: false,
    });

    expect(response.data[1].data).toMatchObject({
      _id: "c1",
    });
  });

  test("feed - no user (no votes)", async () => {
    req.user = null;

    mockCommonService.feed.mockResolvedValue([
      {
        type: "discussion",
        data: {
          _id: "d1",
          toJSON: () => ({ _id: "d1" }),
        },
      },
    ]);

    await controller.feed(req, res);

    const response = res.json.mock.calls[0][0];

    expect(response.data[0].data.hasUpvote).toBe(false);
    expect(response.data[0].data.hasDownvote).toBe(false);
  });

  test("feed - error", async () => {
    mockCommonService.feed.mockRejectedValue(new Error("fail"));

    await controller.feed(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
