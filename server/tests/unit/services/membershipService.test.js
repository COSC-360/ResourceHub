import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.unstable_mockModule(
  "../../../repositories/membershipRepository.js",
  () => ({
    findByUserAndCourse: jest.fn(),
    countByCourse: jest.fn(),
    createMembership: jest.fn(),
    deleteByUserAndCourse: jest.fn(),
    findCourseIdsByUser: jest.fn(),
    upsertMembershipRole: jest.fn(),
  }),
);

jest.unstable_mockModule("../../../repositories/courseRepository.js", () => ({
  default: {
    findByIds: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../services/courseService.js", () => ({
  setMemberCount: jest.fn(),
}));

const membershipRepository =
  await import("../../../repositories/membershipRepository.js");
const courseRepository =
  await import("../../../repositories/courseRepository.js");
const courseService = await import("../../../services/courseService.js");
const MembershipService =
  await import("../../../services/membershipService.js");

describe("Membership Service (unstable_mockModule)", () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockCourseId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getMyMembershipStatus", () => {
    it("should return isMember true when membership exists", async () => {
      const mockMembership = { userId: mockUserId, courseId: mockCourseId };

      membershipRepository.findByUserAndCourse.mockResolvedValue(
        mockMembership,
      );

      const result = await MembershipService.getMyMembershipStatus(
        mockUserId,
        mockCourseId,
      );

      expect(result.isMember).toBe(true);
      expect(membershipRepository.findByUserAndCourse).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
      );
    });
  });

  describe("joinCourse", () => {
    it("should handle existing members correctly", async () => {
      membershipRepository.findByUserAndCourse.mockResolvedValue({
        _id: "exists",
      });
      membershipRepository.countByCourse.mockResolvedValue(10);
      courseService.setMemberCount.mockResolvedValue({});

      const result = await MembershipService.joinCourse(
        mockUserId,
        mockCourseId,
      );

      expect(result.alreadyMember).toBe(true);
      expect(courseService.setMemberCount).toHaveBeenCalledWith(
        mockCourseId,
        10,
      );
    });

    it("should create new membership and update count", async () => {
      membershipRepository.findByUserAndCourse.mockResolvedValue(null);
      membershipRepository.createMembership.mockResolvedValue({ _id: "new" });
      membershipRepository.countByCourse.mockResolvedValue(1);

      const result = await MembershipService.joinCourse(
        mockUserId,
        mockCourseId,
      );

      expect(result.alreadyMember).toBe(false);
      expect(membershipRepository.createMembership).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
        "student",
      );
      expect(courseService.setMemberCount).toHaveBeenCalledWith(
        mockCourseId,
        1,
      );
    });
  });

  describe("leaveCourse", () => {
    it("should remove user and update count", async () => {
      membershipRepository.deleteByUserAndCourse.mockResolvedValue({
        deletedCount: 1,
      });
      membershipRepository.countByCourse.mockResolvedValue(0);

      const result = await MembershipService.leaveCourse(
        mockUserId,
        mockCourseId,
      );

      expect(result.removed).toBe(true);
      expect(courseService.setMemberCount).toHaveBeenCalledWith(
        mockCourseId,
        0,
      );
    });
  });

  describe("getMyCourses", () => {
    it("should return empty array if no course IDs are found", async () => {
      membershipRepository.findCourseIdsByUser.mockResolvedValue([]);

      const result = await MembershipService.getMyCourses(mockUserId);
      expect(result).toEqual([]);
      expect(courseRepository.default.findByIds).not.toHaveBeenCalled();
    });

    it("should fetch course details when IDs exist", async () => {
      const ids = [mockCourseId];
      membershipRepository.findCourseIdsByUser.mockResolvedValue(ids);
      courseRepository.default.findByIds.mockResolvedValue([
        { title: "JS 101" },
      ]);

      const result = await MembershipService.getMyCourses(mockUserId);

      expect(courseRepository.default.findByIds).toHaveBeenCalledWith(ids);
      expect(result[0].title).toBe("JS 101");
    });
  });

  describe("Role Assignment", () => {
    it("should upsert instructor role", async () => {
      membershipRepository.upsertMembershipRole.mockResolvedValue({
        role: "instructor",
      });

      await MembershipService.makeInstructorForCourse(mockUserId, mockCourseId);

      expect(membershipRepository.upsertMembershipRole).toHaveBeenCalledWith(
        mockUserId,
        mockCourseId,
        "instructor",
      );
    });
  });
});
