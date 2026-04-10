import { jest, describe, expect, beforeEach } from "@jest/globals";

const mockVerify = jest.fn();

await jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

const { verifyAccessToken, decodeAccessToken } =
  await import("../../../middleware/authMiddleware.js");

const { default: jwt } = await import("jsonwebtoken");

describe("verifyAccessToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    next = jest.fn();

    process.env.ACCESS_TOKEN_SECRET_KEY = "testsecret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("throws error if JWT secret is missing", () => {
    delete process.env.ACCESS_TOKEN_SECRET_KEY;

    expect(() => verifyAccessToken(req, res, next)).toThrow(
      "Missing JWT secret",
    );
  });

  test("returns 401 if authorization header is missing", () => {
    verifyAccessToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      "Invalid Authorization header format.",
    );
  });

  test("returns 401 for malformed authorization header", () => {
    req.headers.authorization = "BadHeaderFormat";

    verifyAccessToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith(
      "Invalid Authorization header format.",
    );
  });

  test("returns 401 for unsupported auth scheme", () => {
    req.headers.authorization = "Basic sometoken";

    verifyAccessToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Unsupported authentication scheme.");
  });

  test("returns 401 if token is missing after Bearer", () => {
    req.headers.authorization = "Bearer ";

    verifyAccessToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "No access token found",
    });
  });

  test("returns 403 if token is invalid", () => {
    req.headers.authorization = "Bearer badtoken";

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(new Error("Invalid"), null);
    });

    verifyAccessToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
    });
  });

  test("returns 403 if token payload is invalid", () => {
    req.headers.authorization = "Bearer validtoken";

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, {});
    });

    verifyAccessToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid token",
    });
  });

  test("sets req fields and calls next for valid token", () => {
    req.headers.authorization = "Bearer validtoken";

    const mockUser = { id: 1, admin: true };

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, mockUser);
    });

    verifyAccessToken(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(req.userId).toBe(1);
    expect(req.admin).toBe(true);
    expect(next).toHaveBeenCalled();
  });
});

describe("decodeAccessToken", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();

    process.env.ACCESS_TOKEN_SECRET_KEY = "testsecret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("sets noTokenFlag if no token provided", () => {
    decodeAccessToken(req, res, next);

    expect(req.noTokenFlag).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  test("throws error if JWT secret is missing", () => {
    req.headers.authorization = "Bearer sometoken";
    delete process.env.ACCESS_TOKEN_SECRET_KEY;

    expect(() => decodeAccessToken(req, res, next)).toThrow(
      "Missing JWT secret",
    );
  });

  test("stores error if token is invalid", () => {
    req.headers.authorization = "Bearer badtoken";

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(new Error("Bad token"), null);
    });

    decodeAccessToken(req, res, next);

    expect(req.user).toBeNull();
    expect(req.err).toBeInstanceOf(Error);
    expect(next).toHaveBeenCalled();
  });

  test("decodes token successfully", () => {
    req.headers.authorization = "Bearer goodtoken";

    const mockUser = { id: 42 };

    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, mockUser);
    });

    decodeAccessToken(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(req.err).toBeNull();
    expect(next).toHaveBeenCalled();
  });
});
