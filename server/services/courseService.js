import { Course } from '../models/course.js';
import { courseRepository } from '../repositories/courseRepository.js';
import { CourseCodeAlreadyExistsError } from '../errors/courseErrors.js';

export function getById(id) {
    return courseRepository.findById(id);
}

export async function create(course) {
    // check that course doesnt already exist with same code
    console.log('Creating course:', course);
    const existingCourse = await courseRepository.findByCode(course.code);
    if (existingCourse) {
        throw new CourseCodeAlreadyExistsError(course.code);
    }
    console.log('Course code is unique, proceeding to save');
    return courseRepository.save(course);
}

export function getAll() {
    return courseRepository.findAll();
}
