import * as userRepository from "../repository/userRepository.js";

export function getUserById(id){
    const user = userRepository.getUserById(id);
    return user;
}

export function updateProfile(id, body){
    const user = userRepository.getUserById(id);
    
    const newInfo = 'placeholder';

    const updatedUser = userRepository.updateProfile(id, newInfo);
    return updatedUser;
}

export function getUserCourses(userId) {
  const savedCourses = userRepository.getUserCourses(userId);

  return userRepository.findMostPopularCourses();
}


export function saveUserCourses(userId, courses) {

  return userRepository.saveUserCourses(userId, courses);
}

export function updateUserCourses(userId, courses) {

  return userRepository.updateUserCourses(userId, courses);
}

export function hideUserCourses(userId, courseId) {

  return userRepository.hideUserCourses(userId, courseId);
}