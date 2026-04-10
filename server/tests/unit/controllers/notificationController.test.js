import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockNotificationService = {
  getNotifications: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/notificationService.js",
  () => mockNotificationService,
);

const controller =
  await import("../../../controllers/notificationController.js");

describe("getNotifications", () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      userId: "user1",
      admin: false,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("uses default 'since' when not provided", async () => {
    const mockData = [{ id: 1 }];
    mockNotificationService.getNotifications.mockResolvedValue(mockData);

    await controller.getNotifications(req, res);

    expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(
      expect.any(String),
      {
        userId: "user1",
        isAdmin: false,
      },
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  test("uses provided 'since' query param", async () => {
    req.query.since = "2024-01-01T00:00:00.000Z";

    mockNotificationService.getNotifications.mockResolvedValue([]);

    await controller.getNotifications(req, res);

    expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(
      "2024-01-01T00:00:00.000Z",
      {
        userId: "user1",
        isAdmin: false,
      },
    );
  });

  test("passes admin flag correctly", async () => {
    req.admin = true;

    mockNotificationService.getNotifications.mockResolvedValue([]);

    await controller.getNotifications(req, res);

    expect(mockNotificationService.getNotifications).toHaveBeenCalledWith(
      expect.any(String),
      {
        userId: "user1",
        isAdmin: true,
      },
    );
  });

  test("returns 500 if service throws", async () => {
    mockNotificationService.getNotifications.mockRejectedValue(
      new Error("fail"),
    );

    await controller.getNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Failed to fetch notifications",
    });
  });
});
