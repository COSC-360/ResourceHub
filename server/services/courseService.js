import { Course } from '../models/course.js';
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

export function update(id, updatedData) {
    return courseRepository.update(id, updatedData);
}

export function updateImage(id, imageUrl) {
    return courseRepository.updateImage(id, imageUrl);
}