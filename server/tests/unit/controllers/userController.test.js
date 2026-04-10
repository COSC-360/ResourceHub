import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockUserService = {
  createUser: jest.fn(),
  issueAccessToken: jest.fn(),
  getUserById: jest.fn(),
  userSignin: jest.fn(),
  updateProfile: jest.fn(),
  getUserCourses: jest.fn(),
  saveUserCourses: jest.fn(),
  updateUserCourses: jest.fn(),
  hideUserCourses: jest.fn(),
  searchUsers: jest.fn(),
  setUserEnabled: jest.fn(),
  USER_SIGNIN_ACCOUNT_DISABLED: "USER_SIGNIN_ACCOUNT_DISABLED",
};

await jest.unstable_mockModule(
  "../../../services/userService.js",
  () => mockUserService,
);

const mockUserRepo = {
  getUserByEmail: jest.fn(),
  getUsersByUsername: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../repositories/userRepository.js",
  () => mockUserRepo,
);

await jest.unstable_mockModule("../../../socket.js", () => ({
  getIO: () => ({
    to: jest.fn().mockReturnValue({ emit: jest.fn() }),
  }),
}));

const controller = await import("../../../controllers/userController.js");

describe("user controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: "user1" },
      userId: "user1",
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

  test("createUser - email already exists", async () => {
    req.body = { email: "a@test.com", username: "u", password: "p" };
    mockUserRepo.getUserByEmail.mockResolvedValue({});

    await controller.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
  });

  test("createUser - username taken", async () => {
    req.body = { email: "a@test.com", username: "u", password: "p" };
    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockUserRepo.getUsersByUsername.mockResolvedValue({});

    await controller.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(406);
  });

  test("createUser - success", async () => {
    req.body = { email: "a@test.com", username: "u", password: "p" };

    mockUserRepo.getUserByEmail.mockResolvedValue(null);
    mockUserRepo.getUsersByUsername.mockResolvedValue(null);
    mockUserService.createUser.mockResolvedValue({ id: "1" });
    mockUserService.issueAccessToken.mockReturnValue("token");

    await controller.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: { id: "1" },
      access_token: "token",
    });
  });

  test("authenticateUser - missing password", async () => {
    req.body = { email: "a@test.com" };

    await controller.authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("authenticateUser - invalid credentials", async () => {
    req.body = { email: "a@test.com", password: "p" };
    mockUserService.userSignin.mockResolvedValue(null);

    await controller.authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("authenticateUser - success", async () => {
    req.body = { email: "a@test.com", password: "p" };
    mockUserService.userSignin.mockResolvedValue("token");

    await controller.authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("authenticateUser - disabled account", async () => {
    req.body = { email: "a@test.com", password: "p" };
    mockUserService.userSignin.mockResolvedValue("USER_SIGNIN_ACCOUNT_DISABLED");

    await controller.authenticateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "ACCOUNT_DISABLED" }),
    );
  });

  test("getUserById - invalid id", async () => {
    req.params.id = "";

    await controller.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getUserById - not found", async () => {
    req.params.id = "1";
    mockUserService.getUserById.mockResolvedValue(null);

    await controller.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getUserById - success", async () => {
    req.params.id = "1";
    mockUserService.getUserById.mockResolvedValue({ id: "1", pfp: {} });

    await controller.getUserById(req, res);

    expect(res.json).toHaveBeenCalled();
  });

  test("updateProfile - invalid id", async () => {
    req.user = null;

    await controller.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("updateProfile - not found", async () => {
    mockUserService.updateProfile.mockResolvedValue(null);

    await controller.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("updateProfile - duplicate error", async () => {
    mockUserService.updateProfile.mockRejectedValue({ code: 11000 });

    await controller.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("verifyToken - valid", () => {
    req.user = { id: "1" };

    controller.verifyToken(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("verifyToken - invalid", () => {
    req.user = null;

    controller.verifyToken(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("setUserEnabled - invalid id", async () => {
    req.params.id = "";
    req.body.enabled = true;

    await controller.setUserEnabled(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("setUserEnabled - invalid enabled type", async () => {
    req.params.id = "1";
    req.body.enabled = "yes";

    await controller.setUserEnabled(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("setUserEnabled - success", async () => {
    req.params.id = "1";
    req.body.enabled = true;

    mockUserService.setUserEnabled.mockResolvedValue({});

    await controller.setUserEnabled(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("setUserEnabled - not found", async () => {
    req.params.id = "1";
    req.body.enabled = true;

    mockUserService.setUserEnabled.mockResolvedValue(null);

    await controller.setUserEnabled(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("getUserCourses - success", async () => {
    mockUserService.getUserCourses.mockResolvedValue([]);

    await controller.getUserCourses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("searchUsers - success", async () => {
    req.query = { name: "test", isAdmin: "true" };

    mockUserService.searchUsers.mockResolvedValue([]);

    await controller.searchUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
