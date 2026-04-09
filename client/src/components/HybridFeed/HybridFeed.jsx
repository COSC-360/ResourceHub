import { useEffect, useMemo, useState } from 'react';
import './HybridFeed.css';
import DiscussionCard from '../Cards/DiscussionCard.jsx';
import DiscussionFeedControls from './DiscussionFeedControls.jsx';
import { apiClient } from "../../lib/api-client";
import { buildDiscussionFeedQuery } from "../../lib/discussion-feed.js";

function HybridFeed({
    courseId,
    courseIds,
    sort = 'newest',
    limit = 20,
    initialFilters = {},
}) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const normalizedCourseIds = useMemo(
        () => (Array.isArray(courseIds) ? courseIds.filter(Boolean) : []),
        [courseIds],
    );

    const baseFilters = useMemo(() => ({
        courseIds: courseId ? [courseId] : normalizedCourseIds,
        authorIds: [],
        deleted: undefined,
        edited: undefined,
        hasReplies: undefined,
        topLevelOnly: true,
        sortBy: 'createdAt',
        sortOrder: sort === 'oldest' ? 'asc' : 'desc',
        populate: ['courseId'],
    }), [courseId, normalizedCourseIds, sort]);

    const [filters, setFilters] = useState(() => ({
        ...baseFilters,
        ...initialFilters,
        courseIds: initialFilters.courseIds ?? baseFilters.courseIds,
        sortBy: initialFilters.sortBy ?? baseFilters.sortBy,
        sortOrder: initialFilters.sortOrder ?? baseFilters.sortOrder,
        populate: initialFilters.populate ?? baseFilters.populate,
    }));

    const resolvedCourseIds = useMemo(() => {
        if (courseId) return [courseId];
        if (filters.courseIds?.length) return filters.courseIds;
        return normalizedCourseIds;
    }, [courseId, normalizedCourseIds, filters.courseIds]);

    const queryKey = useMemo(
        () =>
            JSON.stringify({
                ...filters,
                courseIds: resolvedCourseIds,
                limit,
            }),
        [filters, resolvedCourseIds, limit],
    );

    function updateFilters(next) {
        setFilters((prev) => ({ ...prev, ...next }));
    }

    function resetFilters() {
        setFilters({
            courseIds: courseId ? [courseId] : courseIds,
            authorIds: [],
            deleted: undefined,
            edited: undefined,
            hasReplies: undefined,
            topLevelOnly: true,
            sortBy: 'createdAt',
            sortOrder: sort === 'oldest' ? 'asc' : 'desc',
            populate: ['courseId'],
        });
    }

    useEffect(() => {
        let cancelled = false;

        setIsLoading(true);
        setError(null);

        async function fetchFeedItems() {
            try {
                const params = buildDiscussionFeedQuery({
                    ...filters,
                    courseIds: resolvedCourseIds,
                    limit,
                });

                const token = localStorage.getItem("access_token");
                const json = await apiClient(`/api/discussion?${params.toString()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!cancelled) {
                    setItems(Array.isArray(json) ? json : (json.data ?? []));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to fetch feed");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchFeedItems();

        return () => {
            cancelled = true;
        };
    }, [queryKey, filters, limit, resolvedCourseIds]);

    return (
        <div className="hybrid-feed">
            <DiscussionFeedControls
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                showCourseIds={!courseId}
            />

            {isLoading && <div className="hybrid-feed__loading">Loading...</div>}
            {error && <div className="hybrid-feed__error">Error: {error}</div>}
            {!isLoading && !error && !items.length && <div className="hybrid-feed__empty">No discussions found</div>}

            {items.map((item) => {
                const discussionId = item._id || item.id;
                return <DiscussionCard key={discussionId} data={item} />;
            })}
        </div>
    );
}

export default HybridFeed;