const popularCoursesByUser = {};

export function getUserCourses(userId) {
  return popularCoursesByUser[userId] || [];
}

export function findMostPopularCourses() {
  return [...allCourses].sort((a, b) => b.likes - a.likes);
}