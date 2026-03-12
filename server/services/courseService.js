import { Course } from '../models/Course.js';
import * as courseRepository from '../repositories/courseRepository.js';

export function create(course) {
    const newCourse = Course.create(course.name, course.code, course.description, course.image);
    return courseRepository.save(newCourse.toJSON());
}