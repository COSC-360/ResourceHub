/**
 * Client route path strings — keep in sync with `App.jsx` `<Route path="…" />` values.
 */

export const HOMEROUTE = "/";

export const SEARCH_ROUTE = "/search";
export const COURSES_ROUTE = "/courses";
export const COURSE_ADD_ROUTE = `${COURSES_ROUTE}/add`;
export const COURSE_CREATE_ROUTE = `${COURSES_ROUTE}/create`;
export const CREATE_POST_ROUTE = "/create";
export const LOGIN_ROUTE = "/login";
export const REGISTER_ROUTE = "/register";
export const INFORMATION_ROUTE = "/information";
export const PROFILE_ROUTE = "/profile";
export const ADMIN_ROUTE = "/admin";
export const ADMIN_USERS_ROUTE = `${ADMIN_ROUTE}/users`;
export const ADMIN_COURSES_ROUTE = `${ADMIN_ROUTE}/courses`;
export const ADMIN_ANALYTICS_ROUTE = `${ADMIN_ROUTE}/analytics`;

export const COURSE_DETAIL_ROUTE = `${COURSES_ROUTE}/:courseId`;
export const COURSE_DISCUSSION_ROUTE = `${COURSES_ROUTE}/:courseId/discussions/:discussionId`;
export const PROFILE_USER_ROUTE = `${PROFILE_ROUTE}/:userId`;
export const COURSE_UPDATE_ROUTE = `${COURSES_ROUTE}/:courseId/update`;

export const NOT_FOUND_ROUTE = "*";

export function coursePath(courseId) {
  return `${COURSES_ROUTE}/${courseId}`;
}

export function courseDiscussionPath(courseId, discussionId) {
  return `${COURSES_ROUTE}/${courseId}/discussions/${discussionId}`;
}

export function profileUserPath(userId) {
  return `${PROFILE_ROUTE}/${userId}`;
}

export function courseUpdatePath(courseId) {
  return `${COURSES_ROUTE}/${courseId}/update`;
}

export function searchPathWithTerm(term) {
  return `${SEARCH_ROUTE}?term=${encodeURIComponent(term)}`;
}
