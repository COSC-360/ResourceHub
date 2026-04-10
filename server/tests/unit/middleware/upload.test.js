import { jest, describe, test, expect, beforeEach } from "@jest/globals";

let capturedConfig;

await jest.unstable_mockModule("multer", () => {
  const multerMock = jest.fn((config) => {
    capturedConfig = config;
    return config;
  });

  multerMock.diskStorage = jest.fn((opts) => opts);

  return {
    default: multerMock,
  };
});

const mockExistsSync = jest.fn();
const mockMkdirSync = jest.fn();

await jest.unstable_mockModule("fs", () => ({
  default: {
    existsSync: mockExistsSync,
    mkdirSync: mockMkdirSync,
  },
}));

describe("multer upload config", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates upload directory if it does not exist", async () => {
    jest.resetModules();
    mockExistsSync.mockReturnValue(false);

    await import("../../../middleware/upload.js");

    expect(mockMkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
  });

  test("rejects non-image files", () => {
    const file = { mimetype: "application/pdf" };
    const cb = jest.fn();

    capturedConfig.fileFilter({}, file, cb);

    expect(cb).toHaveBeenCalledWith(expect.any(Error), false);
  });

  test("accepts image files", () => {
    const file = { mimetype: "image/png" };
    const cb = jest.fn();

    capturedConfig.fileFilter({}, file, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  test("generates filename with correct extension", () => {
    const file = { originalname: "photo.png" };
    const cb = jest.fn();

    capturedConfig.storage.filename({}, file, cb);

    const filename = cb.mock.calls[0][1];

    expect(filename).toMatch(/\.png$/);
  });

  test("defaults to .jpg if no extension", () => {
    const file = { originalname: "noext" };
    const cb = jest.fn();

    capturedConfig.storage.filename({}, file, cb);

    const filename = cb.mock.calls[0][1];

    expect(filename).toMatch(/\.jpg$/);
  });

  test("sets correct upload destination", () => {
    const cb = jest.fn();

    capturedConfig.storage.destination({}, {}, cb);

    expect(cb).toHaveBeenCalledWith(null, expect.stringContaining("uploads"));
  });

  test("has 5MB file size limit", () => {
    expect(capturedConfig.limits.fileSize).toBe(5 * 1024 * 1024);
  });
});
