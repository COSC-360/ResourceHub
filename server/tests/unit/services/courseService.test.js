import { jest, describe, it, expect, beforeEach } from "@jest/globals";

const mockGetById = jest.fn();
const mockIsValid = jest.fn();

await jest.unstable_mockModule("../../../services/courseService.js", () => ({
    getById: mockGetById,
}));

await jest.unstable_mockModule("mongoose", () => ({
    default: {
        Types: {
            ObjectId: {
                isValid: mockIsValid,
            },
        },
    },
}));

const { getById } = await import("../../../controllers/courseController.js");

function createRes() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
}

describe("courseController.getById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns 400 when id is invalid", async () => {
        mockIsValid.mockReturnValue(false);

        const req = { params: { id: "bad-id" } };
        const res = createRes();

        await getById(req, res);

        expect(mockIsValid).toHaveBeenCalledWith("bad-id");
        expect(mockGetById).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid course id" });
    });

    it("returns 404 when id is valid but course is not found", async () => {
        mockIsValid.mockReturnValue(true);
        mockGetById.mockResolvedValue(null);

        const req = { params: { id: "507f1f77bcf86cd799439011" } };
        const res = createRes();

        await getById(req, res);

        expect(mockIsValid).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
        expect(mockGetById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Course not found" });
    });

    it("returns 200 with course when found", async () => {
        const course = { id: "507f1f77bcf86cd799439011", name: "Algorithms" };
        mockIsValid.mockReturnValue(true);
        mockGetById.mockResolvedValue(course);

        const req = { params: { id: "507f1f77bcf86cd799439011" } };
        const res = createRes();

        await getById(req, res);

        expect(mockGetById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ data: course });
    });

    it("returns 500 when service throws", async () => {
        mockIsValid.mockReturnValue(true);
        mockGetById.mockRejectedValue(new Error("DB failure"));

        const req = { params: { id: "507f1f77bcf86cd799439011" } };
        const res = createRes();

        await getById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "DB failure" });
    });
});