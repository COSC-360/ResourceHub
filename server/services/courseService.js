import { Course } from '../models/course.js';
import { courseRepository } from '../repositories/courseRepository.js';

export function getById(id) {
    return courseRepository.findById(id);
}

export function create(course) {
    return courseRepository.save({
        name: course.name,
        code: course.code,
        description: course.description,
        image: course.image,
    });
}

export function getAll() {
    return courseRepository.findAll();
}