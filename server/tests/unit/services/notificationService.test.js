import { jest } from "@jest/globals";
import mongoose from "mongoose";

// 1. Mock Modules BEFORE imports
jest.unstable_mockModule("../../../models/discussion.js", () => ({
  Discussion: {
    find: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../models/resource.js", () => ({
  Resource: {
    find: jest.fn(),
  },
}));

jest.unstable_mockModule(
  "../../../repositories/membershipRepository.js",
  () => ({
    findCourseIdsByUser: jest.fn(),
  }),
);

const { Discussion } = await import("../../../models/discussion.js");
const { Resource } = await import("../../../models/resource.js");
const membershipRepository =
  await import("../../../repositories/membershipRepository.js");
const NotificationService =
  await import("../../../services/notificationService.js");

describe("Notification Service (unstable_mockModule)", () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockSince = "2023-01-01T00:00:00.000Z";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMongooseQuery = (data) => ({
    sort: jest.fn().mockReturnThis(),
    then: jest
      .fn()
      .mockImplementation((callback) => Promise.resolve(callback(data))),
    [Symbol.toStringTag]: "Promise",
  });

  it("should return empty if not admin and no userId provided", async () => {
    const result = await NotificationService.getNotifications(mockSince, {
      isAdmin: false,
    });
    expect(result.count).toBe(0);
    expect(result.items).toEqual([]);
  });

  it("should return empty if user is not in any courses", async () => {
    membershipRepository.findCourseIdsByUser.mockResolvedValue([]);

    const result = await NotificationService.getNotifications(mockSince, {
      userId: mockUserId,
      isAdmin: false,
    });

    expect(result.count).toBe(0);
    expect(membershipRepository.findCourseIdsByUser).toHaveBeenCalledWith(
      mockUserId,
    );
  });

  it("should fetch and merge notifications for an admin (no course filters)", async () => {
    const mockDiscussions = [
      { _id: "d1", title: "Disc 1", createdAt: new Date("2023-01-02") },
    ];
    const mockResources = [
      { _id: "r1", name: "Res 1", createdAt: new Date("2023-01-03") },
    ];

    Discussion.find.mockReturnValue(mockMongooseQuery(mockDiscussions));
    Resource.find.mockReturnValue(mockMongooseQuery(mockResources));

    const result = await NotificationService.getNotifications(mockSince, {
      isAdmin: true,
    });

    expect(Discussion.find).toHaveBeenCalledWith(
      expect.not.objectContaining({ courseId: expect.any(Object) }),
    );

    expect(result.count).toBe(2);
    expect(result.items[0].type).toBe("resource");
    expect(result.items[1].type).toBe("discussion");
  });

  it("should apply course filters and exclude user's own discussions", async () => {
    const courseId = new mongoose.Types.ObjectId().toString();
    membershipRepository.findCourseIdsByUser.mockResolvedValue([courseId]);

    Discussion.find.mockReturnValue(mockMongooseQuery([]));
    Resource.find.mockReturnValue(mockMongooseQuery([]));

    await NotificationService.getNotifications(mockSince, {
      userId: mockUserId,
      isAdmin: false,
    });

    expect(Discussion.find).toHaveBeenCalledWith(
      expect.objectContaining({
        courseId: { $in: [new mongoose.Types.ObjectId(courseId)] },
        authorId: { $ne: new mongoose.Types.ObjectId(mockUserId) },
      }),
    );
  });

  it("should slice the results to a maximum of 10 items", async () => {
    const manyDiscussions = Array.from({ length: 15 }, (_, i) => ({
      _id: `id${i}`,
      title: `Disc ${i}`,
      createdAt: new Date(),
    }));

    Discussion.find.mockReturnValue(mockMongooseQuery(manyDiscussions));
    Resource.find.mockReturnValue(mockMongooseQuery([]));

    const result = await NotificationService.getNotifications(mockSince, {
      isAdmin: true,
    });

    expect(result.items.length).toBe(10);
    expect(result.count).toBe(10);
  });
});
