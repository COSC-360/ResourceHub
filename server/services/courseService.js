import { courseRepository } from '../repositories/courseRepository.js';
import { CourseCodeAlreadyExistsError } from '../errors/courseErrors.js';

export async function checkCourseCodeUnique(code) {
    const existingCourse = await courseRepository.findByCode(code);
    if (existingCourse) {
        throw new CourseCodeAlreadyExistsError(code);
    }
}

export function getById(id) {
    return courseRepository.findById(id);
}

export function getAll() {
    return courseRepository.findAll();
}

export async function create(course) {
    await checkCourseCodeUnique(course.code);
    return courseRepository.save(course);
}

export async function update(id, updatedData) {
    // check uniqueness of course code if it's being updated
    if ("code" in updatedData) {
        await courseService.checkCourseCodeUnique(updatedData.code);
    }
    return courseRepository.update(id, updatedData);
}

export async function updateImage(id, imageUrl) {
    return await courseRepository.updateImage(id, imageUrl);
}

export async function deleteCourse(id) {
    // TODO: also need to delete all discussions, resources, and memberships associated with this course
    return await courseRepository.deleteCourse(id);
}