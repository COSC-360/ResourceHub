import { describe, it, expect } from "vitest";
import {
  COURSES_ROUTE,
  SEARCH_ROUTE,
  coursePath,
  courseDiscussionPath,
  profileUserPath,
  courseUpdatePath,
  searchPathWithTerm,
} from "./RouteConstants.jsx";

describe("route helpers", () => {
  it("coursePath builds course detail path", () => {
    expect(coursePath("abc123")).toBe(`${COURSES_ROUTE}/abc123`);
  });

  it("courseDiscussionPath includes discussion id", () => {
    expect(courseDiscussionPath("c1", "d2")).toBe(
      `${COURSES_ROUTE}/c1/discussions/d2`,
    );
  });

  it("profileUserPath builds profile subpath", () => {
    expect(profileUserPath("u9")).toBe("/profile/u9");
  });

  it("courseUpdatePath builds update route", () => {
    expect(courseUpdatePath("xyz")).toBe(`${COURSES_ROUTE}/xyz/update`);
  });

  it("searchPathWithTerm encodes query", () => {
    expect(searchPathWithTerm("a b")).toBe(`${SEARCH_ROUTE}?term=a%20b`);
  });
});
