export function getUserById(id){
    //Not implemented yet
}

export function updateProfile(id, userInfo){
    //Not implemeneted yet
}


export function findMostPopularCourses() {
  return [...allCourses].sort((a, b) => b.likes - a.likes);
}

export function getUserCourses(userId) {
  return popularCoursesByUser[userId] || [];
}

export function saveUserCourses(userId, courses) {
  popularCoursesByUser[userId] = courses;
  return { userId, courses: popularCoursesByUser[userId] };
}

export function updateUserCourses(userId, courses) {
  popularCoursesByUser[userId] = courses;
  return { userId, courses: popularCoursesByUser[userId] };
}

export function hideUserCourses(userId, courseId) {

  popularCoursesByUser[userId] = popularCoursesByUser[userId].filter(
    (id) => String(id) !== String(courseId)
  );

  return {
    userId,
    courses: popularCoursesByUser[userId]
  };
}
