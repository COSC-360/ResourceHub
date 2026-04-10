import { DiscussionRepository } from "./discussionRepository.js";
import * as ResourceRepository from "./resource.repository.js";
import courseRepository from "./courseRepository.js";

export async function search(searchParams) {
    const defaults = {
        term: "",
        courseIds: [],
        types: ["discussion", "course"],
        sortOrder: "desc",
        page: 1,
        limit: 20,
        deleted: undefined,
        edited: undefined,
        hasReplies: undefined,
        topLevelOnly: true,
    };

    const input =
        typeof searchParams === "string"
            ? { ...defaults, term: searchParams }
            : { ...defaults, ...(searchParams ?? {}) };

    const normalizedTerm = String(input.term ?? "").trim().slice(0, 120);
    if (!normalizedTerm) {
        return { discussions: [], courses: [] };
    }

    const types = Array.isArray(input.types) ? input.types : defaults.types;
    const includeDiscussions = types.includes("discussion");
    const includeCourses = types.includes("course");

    const scopedCourseIds = Array.isArray(input.courseIds)
        ? input.courseIds.filter(Boolean)
        : [];

    const discussions = includeDiscussions
        ? await DiscussionRepository.findByFilters({
              courseIds: scopedCourseIds,
              deleted: input.deleted,
              edited: input.edited,
              hasReplies: input.hasReplies,
              parentId: input.topLevelOnly === false ? undefined : null,
              term: normalizedTerm,
              sortBy: "createdAt",
              sortOrder: input.sortOrder,
              page: input.page,
              limit: input.limit,
          })
        : [];

    const courses = includeCourses
        ? await courseRepository.search({
              term: normalizedTerm,
              scopedCourseIds,
              page: input.page,
              limit: input.limit,
              sortOrder: input.sortOrder,
          })
        : [];

    return { discussions, courses };
}

function toFeedItem(type, doc) {
    return {
        id: String(doc._id),
        type,
        createdAt: doc.createdAt ?? doc.updatedAt ?? new Date(0),
        data: doc,
    };
}

function resolveScopedCourseIds(courseId, courseIds) {
    if (courseId) return [courseId];
    if (courseIds?.length) return courseIds;
    return [];
}

export async function feed({ types, courseId, courseIds, sort, limit }) {
    const tasks = [];
    const scopedCourseIds = resolveScopedCourseIds(courseId, courseIds);
    const hasScope = scopedCourseIds.length > 0;

    if (types.includes("discussion")) {
        tasks.push(
            DiscussionRepository.findRecent({
                scopedCourseIds: hasScope ? scopedCourseIds : null,
                limit,
            }).then((rows) => rows.map((d) => toFeedItem("discussion", d))),
        );
    }

    if (types.includes("resource")) {
        tasks.push(
            ResourceRepository.findRecent({
                scopedCourseIds: hasScope ? scopedCourseIds : null,
                limit,
            }).then((rows) => rows.map((r) => toFeedItem("resource", r))),
        );
    }

    if (types.includes("course")) {
        tasks.push(
            courseRepository
                .findRecent({
                    scopedCourseIds: hasScope ? scopedCourseIds : null,
                    limit,
                })
                .then((rows) => rows.map((c) => toFeedItem("course", c))),
        );
    }

    const grouped = await Promise.all(tasks);
    const items = grouped.flat();

    items.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });

    return items.slice(0, limit);
}