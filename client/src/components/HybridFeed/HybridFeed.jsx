import { useState } from 'react';
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
    }
    // fetch
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