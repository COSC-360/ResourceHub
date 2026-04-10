export function buildDiscussionFeedQuery(filters = {}) {
  const params = new URLSearchParams();

  const listToQuery = (value) => {
    if (!Array.isArray(value) || !value.length) return null;
    return value.join(",");
  };

  const courseIds = listToQuery(filters.courseIds);
  const authorIds = listToQuery(filters.authorIds);
  const populate = listToQuery(filters.populate);

  if (courseIds) params.set("courseIds", courseIds);
  if (authorIds) params.set("authorIds", authorIds);
  if (populate) params.set("populate", populate);

  if (filters.deleted !== undefined && filters.deleted !== null) {
    params.set("deleted", String(filters.deleted));
  }

  if (filters.edited !== undefined && filters.edited !== null) {
    params.set("edited", String(filters.edited));
  }

  if (filters.hasReplies !== undefined && filters.hasReplies !== null) {
    params.set("hasReplies", String(filters.hasReplies));
  }

  if (filters.topLevelOnly !== undefined && filters.topLevelOnly !== null) {
    params.set("topLevelOnly", String(filters.topLevelOnly));
  }

  if (filters.sortBy) params.set("sortBy", String(filters.sortBy));
  if (filters.sortOrder) params.set("sortOrder", String(filters.sortOrder));
  if (filters.term) params.set("term", String(filters.term));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  return params;
}