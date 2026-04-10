import { jest } from "@jest/globals";
// Import the service and the repository it depends on
import * as DiscussionService from "../../../services/discussionService.js";
import { DiscussionRepository } from "../../../repositories/discussionRepository.js";
import { Discussion } from "../../../models/discussion.js";

describe("Discussion Service (ESM)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe("create()", () => {
    it("should throw error if courseId is missing", async () => {
      await expect(DiscussionService.create({})).rejects.toThrow(
        "courseId is required",
      );
    });

    it("should successfully save a new discussion", async () => {
      const mockData = { courseId: "123", title: "Testing ESM" };

      // Using spyOn is often more reliable in ESM than factory mocks
      const saveSpy = jest
        .spyOn(DiscussionRepository, "save")
        .mockResolvedValue({ _id: "new-id", ...mockData });

      const result = await DiscussionService.create(mockData);

      expect(saveSpy).toHaveBeenCalled();
      expect(result._id).toBe("new-id");
    });
  });

  describe("update() logic", () => {
    it("should throw 'Not authorized' if user is not author or admin", async () => {
      const existingDisc = {
        authorId: "user-a",
        toString: () => "user-a",
      };

      jest
        .spyOn(DiscussionRepository, "findById")
        .mockResolvedValue(existingDisc);

      const updateData = { authorId: "user-b", isAdmin: false };

      await expect(
        DiscussionService.update("disc-1", updateData),
      ).rejects.toThrow("Not authorized");
    });
  });

  describe("remove()", () => {
    it("should perform a hard delete if there are no replies", async () => {
      const mockDisc = {
        _id: "1",
        authorId: "user-1",
        replies: 0,
        parentId: null,
      };

      jest.spyOn(DiscussionRepository, "findById").mockResolvedValue(mockDisc);
      const deleteSpy = jest
        .spyOn(DiscussionRepository, "delete")
        .mockResolvedValue({});

      await DiscussionService.remove("1", "user-1");
      expect(deleteSpy).toHaveBeenCalledWith("1");
    });

    it("should perform a soft delete (redact content) if replies exist", async () => {
      const mockDisc = {
        _id: "1",
        authorId: "user-1",
        replies: 2,
        set: jest.fn(),
      };

      jest.spyOn(DiscussionRepository, "findById").mockResolvedValue(mockDisc);
      const saveSpy = jest
        .spyOn(DiscussionRepository, "save")
        .mockResolvedValue({});

      await DiscussionService.remove("1", "user-1");

      expect(mockDisc.set).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "[deleted]",
        }),
      );
      expect(saveSpy).toHaveBeenCalled();
    });
  });
});
