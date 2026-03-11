import * as popularRepository from "../models/popular.js";

export function getPopularCourses(userId) {
  const savedCourses = popularRepository.getSavedPopularCourses(userId);

  if (savedCourses.length > 0) {
    return savedCourses;
  }

  return popularRepository.findMostPopularCourses();
}

export function savePopularCourses(userId, courses) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return popularRepository.savePopularCourses(userId, courses);
}

export function updatePopularCourses(userId, courses) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  return popularRepository.updatePopularCourses(userId, courses);
}

export function hidePopularCourses(userId, courseId) {
  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  return popularRepository.hidePopularCourse(userId, courseId);
}