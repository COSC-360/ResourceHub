import { DiscussionRepository } from "./discussionRepository.js";
import * as ResourceRepository from "./resource.repository.js";
import courseRepository from "./courseRepository.js";

export async function search(searchTerm) {
    const discussions = await DiscussionRepository.search(searchTerm);
    // const courses = await courseRepository.search(searchTerm); // if/when added
    return { discussions };
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