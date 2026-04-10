import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../repositories/userRepository.js", () => ({
  save: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  updateProfile: jest.fn(),
  getUserCourses: jest.fn(),
  saveUserCourses: jest.fn(),
  updateUserCourses: jest.fn(),
  hideUserCourses: jest.fn(),
  searchUsers: jest.fn(),
  setUserEnabled: jest.fn(),
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

const userRepository = await import("../../../repositories/userRepository.js");
const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const UserService = await import("../../../services/userService.js");

describe("User Service (unstable_mockModule)", () => {
  process.env.ACCESS_TOKEN_SECRET_KEY = "test_secret";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should hash the password and save the user", async () => {
      const userData = {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
      };
      bcrypt.genSalt.mockResolvedValue("salt123");
      bcrypt.hash.mockResolvedValue("hashed_password");
      userRepository.save.mockResolvedValue({
        id: "1",
        ...userData,
        password: "hashed_password",
      });

      const result = await UserService.createUser(userData);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", "salt123");
      expect(userRepository.save).toHaveBeenCalledWith(
        "johndoe",
        "john@example.com",
        "hashed_password",
      );
      expect(result.password).toBe("hashed_password");
    });
  });

  describe("issueAccessToken", () => {
    it("should sign a token with correct user data", () => {
      const mockUserDoc = {
        _id: "user123",
        username: "johndoe",
        faculty: "Science",
        isAdmin: true,
        toJSON: () => ({
          _id: "user123",
          username: "johndoe",
          faculty: "Science",
          isAdmin: true,
        }),
      };

      jwt.sign.mockReturnValue("mock_token");

      const token = UserService.issueAccessToken(mockUserDoc);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "user123",
          admin: true,
          enabled: true,
        }),
        "test_secret",
        { expiresIn: "60m" },
      );
      expect(token).toBe("mock_token");
    });
  });

  describe("userSignin", () => {
    const email = "john@example.com";
    const password = "password123";

    it("should return undefined if user is not found", async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);
      const result = await UserService.userSignin(email, password);
      expect(result).toBeUndefined();
    });

    it("should return a token if password matches", async () => {
      const mockUser = {
        _id: "123",
        password: "hashed_in_db",
        toJSON: () => ({ _id: "123", password: "hashed_in_db" }),
      };

      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("signed_jwt");

      const result = await UserService.userSignin(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, "hashed_in_db");
      expect(result).toBe("signed_jwt");
    });

    it("should return undefined if password does not match", async () => {
      const mockUser = {
        _id: "123",
        password: "hashed_in_db",
        toJSON: () => ({ _id: "123", password: "hashed_in_db" }),
      };

      userRepository.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const result = await UserService.userSignin(email, password);
      expect(result).toBeUndefined();
    });
  });

  describe("Repository Wrappers", () => {
    it("should call updateProfile with correct arguments", async () => {
      userRepository.updateProfile.mockResolvedValue({ success: true });
      const result = await UserService.updateProfile("123", {
        name: "New Name",
      });
      expect(userRepository.updateProfile).toHaveBeenCalledWith("123", {
        name: "New Name",
      });
      expect(result.success).toBe(true);
    });

    it("should call searchUsers with all filters", async () => {
      await UserService.searchUsers("John", "john@test.com", "Arts", false);
      expect(userRepository.searchUsers).toHaveBeenCalledWith(
        "John",
        "john@test.com",
        "Arts",
        false,
      );
    });

    it("should call setUserEnabled correctly", async () => {
      await UserService.setUserEnabled("123", false);
      expect(userRepository.setUserEnabled).toHaveBeenCalledWith("123", false);
    });
  });
});
