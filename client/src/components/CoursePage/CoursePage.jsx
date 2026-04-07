import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { apiClient } from '../../lib/api-client'; 

import { CourseHeader } from '../CourseHeader/CourseHeader.jsx';
import HybridFeed from '../HybridFeed/HybridFeed.jsx';

export default function CoursePage() {
    const location = useLocation();
    const { courseId } = useParams();
    const [course, setCourse] = useState(location.state?.course ?? null);
    const [isLoading, setIsLoading] = useState(!location.state?.course);
    const [error, setError] = useState('');

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

    if (isLoading) {
        return (
            <div>
                <h2>Course Page</h2>
                <p>Loading course details...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div>
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
            />
            <HybridFeed 
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
