import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';

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

                const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);

                if (!response.ok) {
                    throw new Error('Course not found');
                }

                const payload = await response.json();
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
            <h2>{course.name}</h2>
            <p><strong>Course Code:</strong> {course.code}</p>
            <p><strong>Description:</strong> {course.description}</p>
            <Link to="/">Create another course</Link>
        </div>
    );
}
