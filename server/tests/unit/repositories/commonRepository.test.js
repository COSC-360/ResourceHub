import { jest } from "@jest/globals";

// 1. Mock Modules BEFORE imports
jest.unstable_mockModule(
  "../../../repositories/discussionRepository.js",
  () => ({
    DiscussionRepository: {
      search: jest.fn(),
      findRecent: jest.fn(),
    },
  }),
);

jest.unstable_mockModule("../../../repositories/courseRepository.js", () => ({
  default: {
    findRecent: jest.fn(),
  },
}));

// 2. Dynamic Imports
const { DiscussionRepository } =
  await import("../../../repositories/discussionRepository.js");
const courseRepository = (
  await import("../../../repositories/courseRepository.js")
).default;
const commonRepository =
  await import("../../../repositories/commonRepository.js");

describe("Feed Service (unstable_mockModule)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("search()", () => {
    it("should return discussions based on searchTerm", async () => {
      const mockResults = [{ title: "Jest Guide" }];
      DiscussionRepository.search.mockResolvedValue(mockResults);

      const result = await commonRepository.search("jest");

      expect(DiscussionRepository.search).toHaveBeenCalledWith("jest");
      expect(result.discussions).toEqual(mockResults);
    });
  });

  describe("feed()", () => {
    const mockDateNew = new Date("2023-10-10");
    const mockDateOld = new Date("2023-01-01");

    it("should merge and transform results from multiple repositories", async () => {
      const disc = [{ _id: "d1", createdAt: mockDateOld }];
      const courses = [{ _id: "c1", createdAt: mockDateNew }];

      DiscussionRepository.findRecent.mockResolvedValue(disc);
      courseRepository.findRecent.mockResolvedValue(courses);

      const result = await commonRepository.feed({
        types: ["discussion", "course"],
        limit: 10,
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("c1");
      expect(result[0].type).toBe("course");
      expect(result[1].type).toBe("discussion");
    });

    it("should resolve course scope: priority to courseId over courseIds", async () => {
      DiscussionRepository.findRecent.mockResolvedValue([]);

      await commonRepository.feed({
        types: ["discussion"],
        courseId: "id-1",
        courseIds: ["id-2", "id-3"],
      });

      expect(DiscussionRepository.findRecent).toHaveBeenCalledWith(
        expect.objectContaining({ scopedCourseIds: ["id-1"] }),
      );
    });

    it("should use courseIds array if individual courseId is missing", async () => {
      DiscussionRepository.findRecent.mockResolvedValue([]);

      await commonRepository.feed({
        types: ["discussion"],
        courseIds: ["id-A", "id-B"],
      });

      expect(DiscussionRepository.findRecent).toHaveBeenCalledWith(
        expect.objectContaining({ scopedCourseIds: ["id-A", "id-B"] }),
      );
    });

    it("should sort by 'oldest' when specified", async () => {
      const oldItem = { _id: "old", createdAt: mockDateOld };
      const newItem = { _id: "new", createdAt: mockDateNew };

      DiscussionRepository.findRecent.mockResolvedValue([newItem]);
      courseRepository.findRecent.mockResolvedValue([oldItem]);

      const result = await commonRepository.feed({
        types: ["discussion", "course"],
        sort: "oldest",
        limit: 10,
      });

      expect(result[0].id).toBe("old");
      expect(result[1].id).toBe("new");
    });

    it("should enforce the limit on the final combined array", async () => {
      const manyItems = Array.from({ length: 5 }, (_, i) => ({
        _id: `${i}`,
        createdAt: new Date(),
      }));

      courseRepository.findRecent.mockResolvedValue(manyItems);

      const result = await commonRepository.feed({
        types: ["course"],
        limit: 2,
      });

      expect(result).toHaveLength(2);
    });

    it("should handle items missing createdAt by using updatedAt or epoch 0", async () => {
      const weirdItem = { _id: "w1", updatedAt: mockDateNew };
      DiscussionRepository.findRecent.mockResolvedValue([weirdItem]);

      const result = await commonRepository.feed({ types: ["discussion"] });

      expect(result[0].createdAt).toEqual(mockDateNew);
    });
  });
});
