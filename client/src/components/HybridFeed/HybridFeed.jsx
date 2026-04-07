import { useEffect, useState } from 'react';
import './HybridFeed.css';

function HybridFeed({
    courseId,
    courseIds = [],
    showDiscussions = true,
    showResources = true,
    showCourses = true,
    sort = 'newest',
    limit = 20,
}) {
    const CARD_BY_TYPE = {
        discussion: DiscussionCard,
        resource: ResourceCard,
        course: CourseCard,
    };

    const [items, setItems] = useState([]);

    async function fetchFeedItems() {
        const types = [
            showDiscussions && 'discussion',
            showResources && 'resource',
            showCourses && 'course',
        ].filter(Boolean);

        // nothing selected
        if (types.length === 0) {
            setItems([]);
            return;
        }

        const params = new URLSearchParams();
        params.set('types', types.join(','));
        params.set('sort', sort);
        params.set('limit', String(limit));

        if (courseId) params.set('courseId', courseId);
        else if (courseIds.length) params.set('courseIds', courseIds.join(','));

        const res = await fetch(`/api/feed?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch feed');
        const json = await res.json();
        setItems(json.data ?? []);
    }

    useEffect(() => {
        fetchFeedItems().catch(console.error);
    }, [courseId, courseIds, showDiscussions, showResources, showCourses, sort, limit]);

    return (
        <div>
            {items.map(item => {
                const CardComponent = CARD_BY_TYPE[item.type];
                return <CardComponent key={item.id} data={item} />;
            })}
        </div>
    );
}

function DiscussionCard({ data }) {
    return (
        <div className="discussion-card">
            <h3>{data.title}</h3>
            <p>{data.excerpt}</p>
        </div>
    );
}

function ResourceCard({ data }) {
    return (
        <div className="resource-card">
            <h3>{data.title}</h3>
            <p>{data.excerpt}</p>
        </div>
    );
}

function CourseCard({ data }) {
    return (
        <div className="course-card">
            <h3>{data.name}</h3>
            <p>{data.description}</p>
        </div>
    );
}

export default HybridFeed;