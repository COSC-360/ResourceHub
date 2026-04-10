import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../models/user.js", () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../repositories/courseRepository.js", () => ({
  default: {
    findByIds: jest.fn(),
  },
}));

const { User } = await import("../../../models/user.js");
const courseRepository = (
  await import("../../../repositories/courseRepository.js")
).default;
const UserRepository = await import("../../../repositories/userRepository.js");

describe("User Repository (unstable_mockModule)", () => {
  const mockChain = (data) => ({
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Lookups", () => {
    it("save() should call User.create", async () => {
      User.create.mockResolvedValue({ username: "test" });
      await UserRepository.save("test", "test@test.com", "hash");
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: "test" }),
      );
    });

    it("getUserById() should chain select and lean", async () => {
      const mockUser = { _id: "123", username: "test" };
      User.findById.mockReturnValue(mockChain(mockUser));

      const result = await UserRepository.getUserById("123");
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith("123");
    });
  });

  describe("updateProfile()", () => {
    it("should build correct $set object and update", async () => {
      User.updateOne.mockResolvedValue({});
      User.findById.mockReturnValue(
        mockChain({ _id: "1", username: "newname" }),
      );

      const data = {
        username: " newname ",
        faculty: "Eng",
        file: { filename: "pfp.jpg" },
      };

      await UserRepository.updateProfile("1", data);

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: "1" },
        {
          $set: {
            username: "newname",
            faculty: "Eng",
            pfp: "/uploads/pfp.jpg",
          },
        },
      );
    });
  });

  describe("In-Memory Course Management", () => {
    const userId = "user123";
    const courseId = "course456";

    it("should save a course ID and return filtered course objects", async () => {
      courseRepository.findByIds.mockResolvedValue([
        { _id: courseId, title: "Math" },
      ]);

      const result = await UserRepository.saveUserCourses(userId, courseId);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Math");
      expect(courseRepository.findByIds).toHaveBeenCalledWith([courseId]);
    });

    it("should hide (remove) a course from user list", async () => {
      courseRepository.findByIds.mockResolvedValue([]);
      await UserRepository.updateUserCourses(userId, [courseId]);

      const result = await UserRepository.hideUserCourses(userId, courseId);

      expect(courseRepository.findByIds).toHaveBeenCalledWith([]);
      expect(result).toHaveLength(0);
    });

    it("updateUserCourses should handle duplicates using Set", async () => {
      courseRepository.findByIds.mockResolvedValue([]);
      await UserRepository.updateUserCourses(userId, ["c1", "c1", "c2"]);

      expect(courseRepository.findByIds).toHaveBeenCalledWith(["c1", "c2"]);
    });
  });

  describe("searchUsers()", () => {
    it("should build regex query for name, email, and faculty", async () => {
      User.find.mockReturnValue(mockChain([]));

      await UserRepository.searchUsers("alice", "alice@", "Science", true);

      expect(User.find).toHaveBeenCalledWith({
        username: { $regex: "alice", $options: "i" },
        email: { $regex: "alice@", $options: "i" },
        faculty: { $regex: "Science", $options: "i" },
        isAdmin: true,
      });
    });

    it("should omit search fields if they are not strings or empty", async () => {
      User.find.mockReturnValue(mockChain([]));
      await UserRepository.searchUsers(" ", null, "", undefined);

      expect(User.find).toHaveBeenCalledWith({});
    });
  });

  describe("setUserEnabled()", () => {
    it("should update enabled status", async () => {
      User.updateOne.mockResolvedValue({});
      User.findById.mockReturnValue(mockChain({ enabled: false }));

      await UserRepository.setUserEnabled("1", false);

      expect(User.updateOne).toHaveBeenCalledWith(
        { _id: "1" },
        { $set: { enabled: false } },
      );
    });
  });
});
