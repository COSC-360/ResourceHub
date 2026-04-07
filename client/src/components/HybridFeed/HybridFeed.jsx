import { useEffect, useState } from 'react';
import './HybridFeed.css';
import CourseCard from '../Cards/CourseCard.jsx';
import DiscussionCard from '../Cards/DiscussionCard.jsx';
import ResourceCard from '../Cards/ResourceCard.jsx';
import { apiClient } from "../../lib/api-client";

function HybridFeed({
    courseId,
    courseIds = [],
    showDiscussions = true,
    showResources = true,
    showCourses = true,
    sort = 'newest',
    limit = 20,
}) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    async function fetchFeedItems() {
        const types = [
            showDiscussions && 'discussion',
            showResources && 'resource',
            showCourses && 'course',
        ].filter(Boolean);

        if (types.length === 0) {
            setItems([]);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('types', types.join(','));
            params.set('sort', sort);
            params.set('limit', String(limit));

            if (courseId) params.set('courseId', courseId);
            else if (courseIds.length) params.set('courseIds', courseIds.join(','));

            const token = localStorage.getItem("access_token");
            const json = await apiClient(`/api/common/feed?${params.toString()}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            setItems(json.data ?? []);
        } catch (err) {
            setError(err.message || "Failed to fetch feed");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchFeedItems();
    }, [courseId, courseIds, showDiscussions, showResources, showCourses, sort, limit]);

    if (isLoading) return <div className="hybrid-feed__loading">Loading...</div>;
    if (error) return <div className="hybrid-feed__error">Error: {error}</div>;
    if (!items.length) return <div className="hybrid-feed__empty">No items found</div>;

    return (
        <div className="hybrid-feed">
            {items.map((item) => {
                switch (item.type) {
                    case 'discussion':
                        return <DiscussionCard key={`${item.type}-${item.id}`} data={item.data} />;
                    case 'resource':
                        return <ResourceCard key={`${item.type}-${item.id}`} data={item.data} />;
                    case 'course':
                        return <CourseCard key={`${item.type}-${item.id}`} data={item.data} />;
                    default:
                        return null;
                }
            })}
        </div>
    );
}

export default HybridFeed;