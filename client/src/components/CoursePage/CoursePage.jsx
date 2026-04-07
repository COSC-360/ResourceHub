import { useEffect, useState, useCallback } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import { CourseHeader } from '../CourseHeader/CourseHeader.jsx';
import HybridFeed from '../HybridFeed/HybridFeed.jsx';
import CreateDiscussion from '../CreateDiscussion/CreateDiscussion.jsx';

export default function CoursePage() {
    const location = useLocation();
    const { courseId } = useParams();
    const [course, setCourse] = useState(location.state?.course ?? null);
    const [isLoading, setIsLoading] = useState(!location.state?.course);
    const [error, setError] = useState('');
    const [feedVersion, setFeedVersion] = useState(0);

    useEffect(() => {
        async function fetchCourse() {
            if (!courseId || location.state?.course) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError('');

                const payload = await apiClient(`/api/courses/${courseId}`, {
                    method: 'GET',
                });

                setCourse(payload.data);
            } catch (fetchError) {
                setError(fetchError.message || 'Failed to load course');
            } finally {
                setIsLoading(false);
            }
        }

        fetchCourse();
    }, [courseId, location.state?.course]);

    const handleMembershipChanged = useCallback((isNowMember) => {
        setCourse((prev) => {
            if (!prev) return prev;
            const current = Number(prev.memberCount ?? 0);
            const next = isNowMember ? current + 1 : Math.max(0, current - 1);
            return { ...prev, memberCount: next };
        });
    }, []);

    if (isLoading) {
        return (
            <div className="course-page">
                <h2>Course Page</h2>
                <p>Loading course details...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-page">
                <h2>Course Page</h2>
                <p>{error || 'No details found for this course.'}</p>
                <p><strong>Course ID:</strong> {courseId}</p>
                <Link to="/">Back to create course</Link>
            </div>
        );
    }

    return (
        <div>
            <CourseHeader
                course={course}
                onMembershipChanged={handleMembershipChanged}
            />

            <CreateDiscussion
                courseId={courseId}
                buttonLabel="New Discussion"
                embedded={false}
                onDiscussionCreated={() => setFeedVersion((v) => v + 1)}
            />

            <HybridFeed
                key={feedVersion}
                courseId={courseId}
                courseIds={[courseId]}
                showDiscussions={true}
                showResources={true}
                showCourses={false}
                sort="newest"
                limit={20}
            />
        </div>
    );
}
