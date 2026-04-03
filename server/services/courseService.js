import { Course } from "../models/course.js";
import * as courseRepository from "../repositories/courseRepository.js";

export function create(course) {
  const newCourse = Course.create(
    course.name,
    course.code,
    course.description,
    course.image,
  );
  return courseRepository.save(newCourse.toJSON());
}

export function getById(id) {
  return courseRepository.findById(id);
}

export function getAll() {
  return courseRepository.findAll();
}
