import { jest } from "@jest/globals";

// 1. Mock Modules BEFORE imports
jest.unstable_mockModule("../../../repositories/voteRepository.js", () => ({
  default: {
    findByFields: jest.fn(),
    save: jest.fn(),
    deleteByFields: jest.fn(),
    deleteManyByTargetId: jest.fn(),
    delete: jest.fn(),
    findByUserId: jest.fn(),
  },
}));

jest.unstable_mockModule(
  "../../../repositories/discussionRepository.js",
  () => ({
    default: {
      findById: jest.fn(),
      save: jest.fn(),
    },
  }),
);

jest.unstable_mockModule("../../../models/vote.js", () => ({
  Vote: jest.fn().mockImplementation((data) => ({
    ...data,
  })),
}));

const VoteRepository = (await import("../../../repositories/voteRepository.js"))
  .default;
const DiscussionRepository = (
  await import("../../../repositories/discussionRepository.js")
).default;
const { Vote } = await import("../../../models/vote.js");
const VoteService = await import("../../../services/voteService.js");

describe("Vote Service (unstable_mockModule)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUpvote", () => {
    const mockData = {
      targetId: "disc123",
      targetType: "Discussion",
      userId: "user1",
    };

    it("should return null if an upvote already exists", async () => {
      VoteRepository.findByFields.mockResolvedValue([{ _id: "existing" }]);

      const result = await VoteService.createUpvote(mockData);

      expect(result).toBeNull();
      expect(VoteRepository.save).not.toHaveBeenCalled();
    });

    it("should create an upvote and increment discussion upvote count", async () => {
      VoteRepository.findByFields.mockResolvedValue([]);

      const mockDiscussion = {
        _id: "disc123",
        upvotes: 5,
        set: jest.fn(),
      };
      DiscussionRepository.findById.mockResolvedValue(mockDiscussion);
      VoteRepository.save.mockImplementation((v) => Promise.resolve(v));

      const result = await VoteService.createUpvote(mockData);

      expect(DiscussionRepository.findById).toHaveBeenCalledWith("disc123");
      expect(mockDiscussion.set).toHaveBeenCalledWith({ upvotes: 6 });
      expect(DiscussionRepository.save).toHaveBeenCalledWith(mockDiscussion);

      expect(result.value).toBe(1);
      expect(VoteRepository.save).toHaveBeenCalled();
    });
  });

  describe("createDownvote", () => {
    it("should create a downvote and increment discussion downvote count", async () => {
      const mockData = {
        targetId: "disc123",
        targetType: "Discussion",
        userId: "user1",
      };
      VoteRepository.findByFields.mockResolvedValue([]);

      const mockDiscussion = {
        _id: "disc123",
        downvotes: 2,
        set: jest.fn(),
      };
      DiscussionRepository.findById.mockResolvedValue(mockDiscussion);

      await VoteService.createDownvote(mockData);

      expect(mockDiscussion.set).toHaveBeenCalledWith({ downvotes: 3 });
      expect(DiscussionRepository.save).toHaveBeenCalledWith(mockDiscussion);
    });
  });

  describe("Check Vote Existence", () => {
    it("hasUpvote should return true if found", async () => {
      VoteRepository.findByFields.mockResolvedValue([{ _id: "v1" }]);
      const result = await VoteService.hasUpvote("t1", "u1", "Discussion");
      expect(result).toBe(true);
      expect(VoteRepository.findByFields).toHaveBeenCalledWith(
        expect.objectContaining({ value: 1 }),
      );
    });

    it("hasDownvote should return false if not found", async () => {
      VoteRepository.findByFields.mockResolvedValue([]);
      const result = await VoteService.hasDownvote("t1", "u1", "Discussion");
      expect(result).toBe(false);
    });
  });

  describe("deleteVote", () => {
    it("should decrement the correct counter based on deleted vote value", async () => {
      const deleteParams = {
        targetId: "disc123",
        targetType: "Discussion",
        userId: "user1",
      };
      const mockDeletedVote = { targetId: "disc123", value: -1 };
      VoteRepository.deleteByFields.mockResolvedValue(mockDeletedVote);

      const mockDiscussion = {
        _id: "disc123",
        downvotes: 10,
        set: jest.fn(),
      };
      DiscussionRepository.findById.mockResolvedValue(mockDiscussion);

      await VoteService.deleteVote(deleteParams);

      expect(mockDiscussion.set).toHaveBeenCalledWith({ downvotes: 9 });
      expect(DiscussionRepository.save).toHaveBeenCalled();
    });

    it("should decrement upvotes if the deleted vote was an upvote", async () => {
      const deleteParams = { targetId: "disc123", targetType: "Discussion" };
      const mockDeletedVote = { targetId: "disc123", value: 1 };
      VoteRepository.deleteByFields.mockResolvedValue(mockDeletedVote);

      const mockDiscussion = {
        _id: "disc123",
        upvotes: 10,
        set: jest.fn(),
      };
      DiscussionRepository.findById.mockResolvedValue(mockDiscussion);

      await VoteService.deleteVote(deleteParams);

      expect(mockDiscussion.set).toHaveBeenCalledWith({ upvotes: 9 });
    });
  });
});
