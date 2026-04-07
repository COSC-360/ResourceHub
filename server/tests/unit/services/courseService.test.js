import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { CourseCodeAlreadyExistsError } from "../../../errors/courseErrors.js";

const mockFindByCode = jest.fn();
const mockFindById = jest.fn();
const mockFindAll = jest.fn();
const mockSave = jest.fn();
const mockUpdate = jest.fn();
const mockUpdateImage = jest.fn();
const mockDeleteCourse = jest.fn();

await jest.unstable_mockModule("../../../repositories/courseRepository.js", () => ({
    courseRepository: {
        findByCode: mockFindByCode,
        findById: mockFindById,
        findAll: mockFindAll,
        save: mockSave,
        update: mockUpdate,
        updateImage: mockUpdateImage,
        deleteCourse: mockDeleteCourse,
    },
}));

const courseService = await import("../../../services/courseService.js");

describe("courseService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("checkCourseCodeUnique", () => {
        it("does nothing when code is unique", async () => {
            mockFindByCode.mockResolvedValue(null);

            await expect(courseService.checkCourseCodeUnique(null, "CS101")).resolves.toBeUndefined();
            expect(mockFindByCode).toHaveBeenCalledWith("CS101");
        });

        it("throws CourseCodeAlreadyExistsError when code already exists", async () => {
            mockFindByCode.mockResolvedValue({ _id: "1", code: "CS101" });

            await expect(courseService.checkCourseCodeUnique(null, "CS101"))
                .rejects.toBeInstanceOf(CourseCodeAlreadyExistsError);

            expect(mockFindByCode).toHaveBeenCalledWith("CS101");
        });

        it("does not throw when existing course has same id (updating same course)", async () => {
            const existingCourse = { _id: "1", code: "CS101" };
            mockFindByCode.mockResolvedValue(existingCourse);

            await expect(courseService.checkCourseCodeUnique("1", "CS101")).resolves.toBeUndefined();
            expect(mockFindByCode).toHaveBeenCalledWith("CS101");
        });
    });

    describe("getById", () => {
        it("delegates to repository.findById", async () => {
            const course = { _id: "abc", code: "CS101" };
            mockFindById.mockResolvedValue(course);

            await expect(courseService.getById("abc")).resolves.toEqual(course);
            expect(mockFindById).toHaveBeenCalledWith("abc");
        });
    });

    describe("getAll", () => {
        it("delegates to repository.findAll", async () => {
            const courses = [{ code: "CS101" }, { code: "MATH200" }];
            mockFindAll.mockResolvedValue(courses);

            await expect(courseService.getAll()).resolves.toEqual(courses);
            expect(mockFindAll).toHaveBeenCalledTimes(1);
        });
    });

    describe("create", () => {
        it("checks uniqueness then saves course", async () => {
            const input = { code: "CS101", title: "Algorithms" };
            const saved = { _id: "1", ...input };

            mockFindByCode.mockResolvedValue(null);
            mockSave.mockResolvedValue(saved);

            await expect(courseService.create(input)).resolves.toEqual(saved);
            expect(mockFindByCode).toHaveBeenCalledWith("CS101");
            expect(mockSave).toHaveBeenCalledWith(input);
        });

        it("throws and does not save when code already exists", async () => {
            const input = { code: "CS101", title: "Algorithms" };
            mockFindByCode.mockResolvedValue({ _id: "existing", code: "CS101" });

            await expect(courseService.create(input))
                .rejects.toBeInstanceOf(CourseCodeAlreadyExistsError);

            expect(mockSave).not.toHaveBeenCalled();
        });
    });

    describe("update", () => {
        it("checks uniqueness when code is present, then updates", async () => {
            const updatedData = { code: "CS102", title: "Advanced Algorithms" };
            const updated = { _id: "1", ...updatedData };

            mockFindByCode.mockResolvedValue(null);
            mockUpdate.mockResolvedValue(updated);

            await expect(courseService.update("1", updatedData)).resolves.toEqual(updated);
            expect(mockFindByCode).toHaveBeenCalledWith("CS102");
            expect(mockUpdate).toHaveBeenCalledWith("1", updatedData);
        });

        it("throws and does not update when new code already exists", async () => {
            const updatedData = { code: "CS102" };

            mockFindByCode.mockResolvedValue({ _id: "2", code: "CS102" });

            await expect(courseService.update("1", updatedData))
                .rejects.toBeInstanceOf(CourseCodeAlreadyExistsError);

            expect(mockUpdate).not.toHaveBeenCalled();
        });

        it("skips uniqueness check when code is not present", async () => {
            const updatedData = { title: "Only title change" };
            const updated = { _id: "1", code: "CS101", ...updatedData };

            mockUpdate.mockResolvedValue(updated);

            await expect(courseService.update("1", updatedData)).resolves.toEqual(updated);
            expect(mockFindByCode).not.toHaveBeenCalled();
            expect(mockUpdate).toHaveBeenCalledWith("1", updatedData);
        });
    });

    describe("updateImage", () => {
        it("delegates to repository.updateImage", async () => {
            const result = { _id: "1", imageUrl: "https://img.test/a.png" };
            mockUpdateImage.mockResolvedValue(result);

            await expect(courseService.updateImage("1", "https://img.test/a.png")).resolves.toEqual(result);
            expect(mockUpdateImage).toHaveBeenCalledWith("1", "https://img.test/a.png");
        });
    });

    describe("deleteCourse", () => {
        it("delegates to repository.deleteCourse", async () => {
            const result = { deletedCount: 1 };
            mockDeleteCourse.mockResolvedValue(result);

            await expect(courseService.deleteCourse("1")).resolves.toEqual(result);
            expect(mockDeleteCourse).toHaveBeenCalledWith("1");
        });
    });
});