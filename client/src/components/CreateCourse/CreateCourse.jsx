import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';
import { apiClient } from '../../lib/api-client';

export default function CreateCourse() {
    const navigate = useNavigate();

    const [courseData, setCourseData] = useState({
        name: '',
        code: '',
        description: '',
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setCourseData((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const course = {
            name: courseData.name.trim(),
            code: courseData.code.trim(),
            description: courseData.description.trim(),
        };

        try {
            const createdCourse = await apiClient('/api/courses/create', {
                method: 'POST',
                body: course,
            });

            const newCourseId = createdCourse?.data?._id || createdCourse?.data?.id;
            if (!newCourseId) {
                throw new Error("Created course ID missing from response");
            }

            navigate(`/courses/${newCourseId}`, {
                state: { course: createdCourse.data },
            });

            setCourseData({
                name: '',
                code: '',
                description: '',
            });
        } catch (error) {
            console.error('Error creating course:', error);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <legend>What is your course?</legend>
                <p>Describe your course to help people find it.</p>
                <fieldset>
                    <label htmlFor="name">Course Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={courseData.name}
                        onChange={handleChange}
                        required
                    />
                </fieldset>
                <fieldset>
                    <label htmlFor="code">Course Code:</label>
                    <input
                        type="text"
                        id="code"
                        name="code"
                        value={courseData.code}
                        onChange={handleChange}
                        required
                    />
                </fieldset>
                <fieldset>
                    <label htmlFor="description">Course Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={courseData.description}
                        onChange={handleChange}
                        required 
                    />
                </fieldset>
                <button type="submit">Create Course</button>
            </form>
        </div>
    );
}