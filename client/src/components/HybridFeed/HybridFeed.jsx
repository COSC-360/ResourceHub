import { useEffect, useMemo, useState } from 'react';
import './HybridFeed.css';
import DiscussionCard from '../Cards/DiscussionCard.jsx';
import DiscussionFeedControls from './DiscussionFeedControls.jsx';
import DiscussionFeedPagination from './DiscussionFeedPagination.jsx';
import { apiClient } from "../../lib/api-client";
import { buildDiscussionFeedQuery } from "../../lib/discussion-feed.js";

function HybridFeed({
    courseId,
    courseIds,
    searchTerm,
    sort = 'newest',
    limit = 20,
    maxItemsPerPage,
    showCourseScope = true,
    initialFilters = {},
}) {
    const hasToken = Boolean(localStorage.getItem("access_token"));
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [courseScope, setCourseScope] = useState('any');
    const [courseScopeHint, setCourseScopeHint] = useState('');
    const [myCourseIds, setMyCourseIds] = useState([]);
    const [myCourseIdsLoaded, setMyCourseIdsLoaded] = useState(false);
    const resolvedPageSize = Number(maxItemsPerPage ?? limit ?? 20);
    const pageSize = Number.isFinite(resolvedPageSize) && resolvedPageSize > 0
        ? Math.min(Math.floor(resolvedPageSize), 200)
        : 20;
    const normalizedCourseIds = useMemo(
        () => (Array.isArray(courseIds) ? courseIds.filter(Boolean) : []),
        [courseIds],
    );

    const baseFilters = useMemo(() => ({
        deleted: undefined,
        edited: undefined,
        hasReplies: undefined,
        topLevelOnly: true,
        sortBy: 'createdAt',
        sortOrder: sort === 'oldest' ? 'asc' : 'desc',
        populate: ['courseId'],
    }), [sort]);

    const [filters, setFilters] = useState(() => ({
        ...baseFilters,
        ...initialFilters,
        sortBy: initialFilters.sortBy ?? baseFilters.sortBy,
        sortOrder: initialFilters.sortOrder ?? baseFilters.sortOrder,
        populate: ['courseId'],
    }));

    useEffect(() => {
        if (courseId || courseScope !== 'my') return;

        let cancelled = false;

        async function loadMyCourseIds() {
            const token = localStorage.getItem("access_token");
            if (!token) {
                if (!cancelled) {
                    setMyCourseIds([]);
                    setMyCourseIdsLoaded(true);
                }
                return;
            }

            try {
                const json = await apiClient('/api/memberships/me/course-ids', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!cancelled) {
                    const ids = Array.isArray(json?.data) ? json.data : [];
                    setMyCourseIds(ids);
                    setMyCourseIdsLoaded(true);
                }
            } catch {
                if (!cancelled) {
                    setMyCourseIds([]);
                    setMyCourseIdsLoaded(true);
                }
            }
        }

        loadMyCourseIds();

        return () => {
            cancelled = true;
        };
    }, [courseId, courseScope]);

    const resolvedCourseIds = useMemo(() => {
        if (courseId) return [courseId];
        if (courseScope === 'my') return myCourseIds;
        return normalizedCourseIds;
    }, [courseId, courseScope, myCourseIds, normalizedCourseIds]);

    function updateFilters(next) {
        setFilters((prev) => ({ ...prev, ...next }));
        setPage(1);
    }

    function resetFilters() {
        setFilters({
            deleted: undefined,
            edited: undefined,
            hasReplies: undefined,
            topLevelOnly: true,
            sortBy: 'createdAt',
            sortOrder: sort === 'oldest' ? 'asc' : 'desc',
            populate: ['courseId'],
        });
        setPage(1);
    }

    function handleCourseScopeChange(nextScope) {
        if (nextScope === 'my' && !hasToken) {
            setCourseScopeHint('Log in to use the My courses filter.');
            setCourseScope('any');
            return;
        }

        setCourseScopeHint('');
        setCourseScope(nextScope);
        setPage(1);
    }

    const queryInput = useMemo(
        () => ({
            ...filters,
            term: searchTerm,
            courseIds: resolvedCourseIds,
            page,
            limit: Math.min(pageSize + 1, 200),
        }),
        [filters, searchTerm, resolvedCourseIds, page, pageSize],
    );

    useEffect(() => {
        let cancelled = false;

        if (!courseId && courseScope === 'my' && !myCourseIdsLoaded) {
            return () => {
                cancelled = true;
            };
        }

        setIsLoading(true);
        setError(null);

        async function fetchFeedItems() {
            try {
                const params = buildDiscussionFeedQuery(queryInput);

                const token = localStorage.getItem("access_token");
                const json = await apiClient(`/api/discussion?${params.toString()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!cancelled) {
                    const rows = Array.isArray(json) ? json : (json.data ?? []);
                    const more = rows.length > pageSize;
                    setHasMore(more);
                    setItems(more ? rows.slice(0, pageSize) : rows);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to fetch feed");
                    setHasMore(false);
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
    }, [queryInput, pageSize, courseId, courseScope, myCourseIdsLoaded]);

    return (
        <div className="hybrid-feed">
            <DiscussionFeedControls
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                showCourseScope={showCourseScope}
                courseScope={courseScope}
                onCourseScopeChange={handleCourseScopeChange}
                disableMyCourses={!hasToken}
                hintMessage={courseScopeHint || (!hasToken ? 'Log in to enable My courses.' : '')}
            />

            <DiscussionFeedPagination
                page={page}
                canGoPrevious={page > 1}
                canGoNext={hasMore}
                onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
                onNext={() => setPage((prev) => prev + 1)}
            />

            {isLoading && <div className="hybrid-feed__loading">Loading...</div>}
            {error && <div className="hybrid-feed__error">Error: {error}</div>}
            {!isLoading && !error && !items.length && (
                <div className="hybrid-feed__empty">
                    {searchTerm ? "No discussions match this search." : "No discussions found"}
                </div>
            )}

            {items.map((item) => {
                const discussionId = item._id || item.id;
                return <DiscussionCard key={discussionId} data={item} />;
            })}

            <DiscussionFeedPagination
                page={page}
                canGoPrevious={page > 1}
                canGoNext={hasMore}
                onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
                onNext={() => setPage((prev) => prev + 1)}
            />
        </div>
    );
}

export default HybridFeed;