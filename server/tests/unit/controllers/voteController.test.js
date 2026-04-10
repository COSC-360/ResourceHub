import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockVoteService = {
  createUpvote: jest.fn(),
  createDownvote: jest.fn(),
  deleteVote: jest.fn(),
  getVotesByUserId: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/voteService.js",
  () => mockVoteService,
);

const controller = await import("../../../controllers/voteController.js");

describe("vote controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        targetId: "t1",
        targetType: "Discussion",
      },
      userId: "user1",
      user: { userId: "user1" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("upVoteTarget - success", async () => {
    const mockResult = {
      toJSON: () => ({ id: "vote1" }),
    };

    mockVoteService.createUpvote.mockResolvedValue(mockResult);

    await controller.upVoteTarget(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Target successfully upvoted.",
      data: { id: "vote1" },
    });
  });

  test("upVoteTarget - duplicate vote", async () => {
    mockVoteService.createUpvote.mockResolvedValue(null);

    await controller.upVoteTarget(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("upVoteTarget - error", async () => {
    mockVoteService.createUpvote.mockRejectedValue(new Error("fail"));

    await controller.upVoteTarget(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("downVoteTarget - success", async () => {
    const mockResult = {
      toJSON: () => ({ id: "vote1" }),
    };

    mockVoteService.createDownvote.mockResolvedValue(mockResult);

    await controller.downVoteTarget(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("downVoteTarget - duplicate vote", async () => {
    mockVoteService.createDownvote.mockResolvedValue(null);

    await controller.downVoteTarget(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("removeVote - success", async () => {
    const mockResult = {
      toJSON: () => ({ id: "vote1" }),
    };

    mockVoteService.deleteVote.mockResolvedValue(mockResult);

    await controller.removeVote(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Vote successfully deleted.",
      data: { id: "vote1" },
    });
  });

  test("removeVote - error", async () => {
    mockVoteService.deleteVote.mockRejectedValue(new Error("fail"));

    await controller.removeVote(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getVotes - success", async () => {
    mockVoteService.getVotesByUserId.mockReturnValue([{ id: "v1" }]);

    await controller.getVotes(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: "v1" }]);
  });

  test("getVotes - error", async () => {
    mockVoteService.getVotesByUserId.mockImplementation(() => {
      throw new Error("fail");
    });

    await controller.getVotes(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
