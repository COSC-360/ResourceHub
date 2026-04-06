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

export async function create(course) {
    console.log('Creating course:', course);
    // check that course doesnt already exist with same code
    await checkCourseCodeUnique(course.code);
    console.log('Course code is unique, proceeding to save');
    return courseRepository.save(course);
}

export function getAll() {
    return courseRepository.findAll();
}

export function update(id, updatedData) {
    return courseRepository.update(id, updatedData);
}