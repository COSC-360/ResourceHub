import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockResourceService = {
  get: jest.fn(),
  findByIds: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

await jest.unstable_mockModule(
  "../../../services/resource.service.js",
  () => mockResourceService,
);

const controller = await import("../../../controllers/resource.controller");

describe("resource controller", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      query: {},
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  test("get - success", async () => {
    req.params.id = "1";
    mockResourceService.get.mockResolvedValue({ id: "1" });

    await controller.get(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  test("get - not found", async () => {
    req.params.id = "1";
    mockResourceService.get.mockResolvedValue(null);

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("get - error", async () => {
    mockResourceService.get.mockRejectedValue(new Error("fail"));

    await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("getAll - with courseIds", async () => {
    req.query.courseIds = "1,2,3";
    mockResourceService.findByIds.mockResolvedValue(["a"]);

    await controller.getAll(req, res);

    expect(mockResourceService.findByIds).toHaveBeenCalledWith(["1", "2", "3"]);
    expect(res.json).toHaveBeenCalledWith({ data: ["a"] });
  });

  test("getAll - without courseIds", async () => {
    mockResourceService.findAll.mockResolvedValue(["a"]);

    await controller.getAll(req, res);

    expect(mockResourceService.findAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ data: ["a"] });
  });

  test("getAll - error", async () => {
    mockResourceService.findAll.mockRejectedValue(new Error("fail"));

    await controller.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("create - success", async () => {
    req.body = { name: "res" };
    mockResourceService.create.mockResolvedValue({ id: "1" });

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  test("create - error", async () => {
    mockResourceService.create.mockRejectedValue(new Error("fail"));

    await controller.create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("update - success", async () => {
    req.params.id = "1";
    req.body = { name: "updated" };

    mockResourceService.update.mockResolvedValue({ id: "1" });

    await controller.update(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: "1" });
  });

  test("update - not found", async () => {
    mockResourceService.update.mockRejectedValue(
      new Error("Resource not found"),
    );

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("update - error", async () => {
    mockResourceService.update.mockRejectedValue(new Error("fail"));

    await controller.update(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test("remove - success", async () => {
    req.params.id = "1";
    mockResourceService.remove.mockResolvedValue();

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test("remove - not found", async () => {
    mockResourceService.remove.mockRejectedValue(
      new Error("Resource not found"),
    );

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("remove - error", async () => {
    mockResourceService.remove.mockRejectedValue(new Error("fail"));

    await controller.remove(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
