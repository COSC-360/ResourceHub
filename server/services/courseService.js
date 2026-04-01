import { Course } from '../models/course.js';
import { courseRepository } from '../repositories/courseRepository.js';

export function getById(id) {
    return courseRepository.findById(id);
}

export function create(course) {
    return courseRepository.save(course);
}

export function getAll() {
    return courseRepository.findAll();
}