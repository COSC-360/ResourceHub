import { describe, it, expect } from "vitest";
import {
  LIMITS,
  trimStr,
  isValidEmail,
  validateSignupPassword,
  validateUsername,
  validateProfileTextFields,
  validateMaxLength,
  validateCourseFields,
  validateDiscussionCreate,
  validateReplyContent,
  validateDiscussionEdit,
} from "./formValidation.js";

describe("trimStr", () => {
  it("trims strings and returns empty string for non-strings", () => {
    expect(trimStr("  a  ")).toBe("a");
    expect(trimStr("")).toBe("");
    expect(trimStr(null)).toBe("");
    expect(trimStr(undefined)).toBe("");
  });
});

describe("isValidEmail", () => {
  it("accepts typical valid emails", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("user.name+tag@example.com")).toBe(true);
  });

  it("rejects invalid emails and trims before checking", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("  a@b.co  ")).toBe(true);
  });
});

describe("validateSignupPassword", () => {
  it("requires length and mixed case", () => {
    expect(validateSignupPassword("short")).toBeTruthy();
    expect(validateSignupPassword("alllowercase1")).toBeTruthy();
    expect(validateSignupPassword("ALLUPPERCASE1")).toBeTruthy();
    expect(validateSignupPassword("GoodPass1")).toBe(null);
  });
});

describe("validateUsername", () => {
  it("requires non-empty username within limit", () => {
    expect(validateUsername("")).toBe("Username is required.");
    expect(validateUsername("   ")).toBe("Username is required.");
    expect(validateUsername("ok")).toBe(null);
    expect(validateUsername("a".repeat(LIMITS.USERNAME_MAX + 1))).toContain(
      "at most",
    );
  });
});

describe("validateMaxLength", () => {
  it("returns message when over max", () => {
    expect(validateMaxLength("ab", 2, "Field")).toBe(null);
    expect(validateMaxLength("abc", 2, "Field")).toBe(
      "Field must be at most 2 characters.",
    );
  });
});

describe("validateProfileTextFields", () => {
  it("validates faculty then bio", () => {
    expect(
      validateProfileTextFields("a".repeat(LIMITS.FACULTY_MAX + 1), ""),
    ).toContain("Faculty");
    expect(
      validateProfileTextFields("", "a".repeat(LIMITS.BIO_MAX + 1)),
    ).toContain("Bio");
    expect(validateProfileTextFields("Science", "Hello")).toBe(null);
  });
});

describe("validateCourseFields", () => {
  it("validates name, code, then description", () => {
    expect(
      validateCourseFields(
        "a".repeat(LIMITS.COURSE_NAME_MAX + 1),
        "CODE",
        "",
      ),
    ).toContain("Course name");
    expect(
      validateCourseFields(
        "Name",
        "a".repeat(LIMITS.COURSE_CODE_MAX + 1),
        "",
      ),
    ).toContain("Course code");
    expect(
      validateCourseFields("Name", "CODE", "a".repeat(LIMITS.COURSE_DESC_MAX + 1)),
    ).toContain("Course description");
    expect(validateCourseFields("Name", "CODE", "Desc")).toBe(null);
  });
});

describe("validateDiscussionCreate", () => {
  it("requires title and content within limits", () => {
    expect(validateDiscussionCreate("", "body")).toBe("Title is required.");
    expect(validateDiscussionCreate("t", "")).toBe(
      "Discussion content is required.",
    );
    expect(
      validateDiscussionCreate(
        "a".repeat(LIMITS.DISCUSSION_TITLE_MAX + 1),
        "c",
      ),
    ).toContain("Title");
    expect(
      validateDiscussionCreate(
        "t",
        "a".repeat(LIMITS.DISCUSSION_CONTENT_MAX + 1),
      ),
    ).toContain("Content");
    expect(validateDiscussionCreate("Title", "Body")).toBe(null);
  });
});

describe("validateReplyContent", () => {
  it("requires non-empty reply within limit", () => {
    expect(validateReplyContent("")).toBe("Reply content is required.");
    expect(
      validateReplyContent("a".repeat(LIMITS.DISCUSSION_CONTENT_MAX + 1)),
    ).toContain("Reply");
    expect(validateReplyContent("ok")).toBe(null);
  });
});

describe("validateDiscussionEdit", () => {
  it("requires non-empty combined content", () => {
    expect(
      validateDiscussionEdit({
        isReply: true,
        hadTitle: false,
        draftTitle: "",
        originalTitle: "",
        draftContent: "   ",
        originalContent: "",
      }),
    ).toBe("Content cannot be empty.");
  });

  it("validates title when title field is shown", () => {
    expect(
      validateDiscussionEdit({
        isReply: false,
        hadTitle: false,
        draftTitle: "",
        originalTitle: "",
        draftContent: "x",
        originalContent: "",
      }),
    ).toBe("Title is required.");

    expect(
      validateDiscussionEdit({
        isReply: false,
        hadTitle: false,
        draftTitle: "Ok",
        originalTitle: "",
        draftContent: "x",
        originalContent: "",
      }),
    ).toBe(null);
  });
});
