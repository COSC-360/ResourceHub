export const LIMITS = {
  USERNAME_MAX: 64,
  COURSE_NAME_MAX: 200,
  COURSE_CODE_MAX: 50,
  COURSE_DESC_MAX: 5000,
  BIO_MAX: 2000,
  FACULTY_MAX: 200,
  DISCUSSION_TITLE_MAX: 300,
  DISCUSSION_CONTENT_MAX: 20000,
};

export function trimStr(value) {
  return typeof value === "string" ? value.trim() : "";
}

const EMAIL_RE =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email) {
  return EMAIL_RE.test(trimStr(email));
}

const SIGNUP_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

export function validateSignupPassword(password) {
  if (typeof password !== "string" || !SIGNUP_PASSWORD_RE.test(password)) {
    return "Password must be at least 8 characters and include upper and lower case letters.";
  }
  return null;
}

export function validateUsername(username) {
  const s = trimStr(username);
  if (!s) return "Username is required.";
  if (s.length > LIMITS.USERNAME_MAX) {
    return `Username must be at most ${LIMITS.USERNAME_MAX} characters.`;
  }
  return null;
}

export function validateProfileTextFields(faculty, bio) {
  const f = validateMaxLength(
    typeof faculty === "string" ? faculty : "",
    LIMITS.FACULTY_MAX,
    "Faculty",
  );
  if (f) return f;
  return validateMaxLength(
    typeof bio === "string" ? bio : "",
    LIMITS.BIO_MAX,
    "Bio",
  );
}

export function validateMaxLength(value, max, label) {
  const len = typeof value === "string" ? value.length : 0;
  if (len > max) return `${label} must be at most ${max} characters.`;
  return null;
}

export function validateCourseFields(name, code, description) {
  const n = trimStr(name);
  const c = trimStr(code);
  const errName = validateMaxLength(n, LIMITS.COURSE_NAME_MAX, "Course name");
  if (errName) return errName;
  const errCode = validateMaxLength(c, LIMITS.COURSE_CODE_MAX, "Course code");
  if (errCode) return errCode;
  return validateMaxLength(
    typeof description === "string" ? description : "",
    LIMITS.COURSE_DESC_MAX,
    "Course description",
  );
}

export function validateDiscussionCreate(title, content) {
  const t = trimStr(title);
  const c = trimStr(content);
  if (!t) return "Title is required.";
  if (!c) return "Discussion content is required.";
  const et = validateMaxLength(t, LIMITS.DISCUSSION_TITLE_MAX, "Title");
  if (et) return et;
  return validateMaxLength(c, LIMITS.DISCUSSION_CONTENT_MAX, "Content");
}

export function validateReplyContent(content) {
  const c = trimStr(content);
  if (!c) return "Reply content is required.";
  return validateMaxLength(c, LIMITS.DISCUSSION_CONTENT_MAX, "Reply");
}

export function validateDiscussionEdit({
  isReply,
  hadTitle,
  draftTitle,
  originalTitle,
  draftContent,
  originalContent,
}) {
  const contentOut =
    trimStr(draftContent) || trimStr(originalContent);
  if (!contentOut) return "Content cannot be empty.";
  const contentErr = validateMaxLength(
    contentOut,
    LIMITS.DISCUSSION_CONTENT_MAX,
    "Content",
  );
  if (contentErr) return contentErr;

  const titleFieldShown = !isReply || hadTitle;
  if (!titleFieldShown) return null;

  const titleOut = trimStr(draftTitle) || trimStr(originalTitle);
  if (!titleOut) return "Title is required.";
  return validateMaxLength(titleOut, LIMITS.DISCUSSION_TITLE_MAX, "Title");
}
