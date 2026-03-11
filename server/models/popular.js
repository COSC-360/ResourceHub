const popularCoursesByUser = {};
const allCourses = [
  { id: 1, name: "COSC 320", likes: 0 },
  { id: 2, name: "COSC 405", likes: 0 },
  { id: 3, name: "COSC 360", likes: 0 },
  { id: 4, name: "COSC 322", likes: 0 }
];

export function findMostPopularCourses() {
  return [...allCourses].sort((a, b) => b.likes - a.likes);
}

export function getSavedPopularCourses(userId) {
  return popularCoursesByUser[userId] || [];
}

export function savePopularCourses(userId, courses) {
  popularCoursesByUser[userId] = courses;
  return { userId, courses: popularCoursesByUser[userId] };
}

export function updatePopularCourses(userId, courses) {
  popularCoursesByUser[userId] = courses;
  return { userId, courses: popularCoursesByUser[userId] };
}

export function hidePopularCourse(userId, courseId) {
  if (!popularCoursesByUser[userId]) {
    throw new Error("User has no saved popular courses");
  }

  popularCoursesByUser[userId] = popularCoursesByUser[userId].filter(
    (id) => String(id) !== String(courseId)
  );

  return {
    userId,
    courses: popularCoursesByUser[userId]
  };
}