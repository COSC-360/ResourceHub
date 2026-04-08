import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateCourse.css';
import { apiClient } from '../../lib/api-client';

export default function CreateCourse({ asModal = false, onClose, onCreated }) {
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
            const token = localStorage.getItem("access_token");
            const createdCourse = await apiClient('/api/courses/create', {
                method: 'POST',
                body: course,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const newCourseId = createdCourse?.data?._id || createdCourse?.data?.id;
            if (!newCourseId) {
                throw new Error("Created course ID missing from response");
            }

            setCourseData({
                name: '',
                code: '',
                description: '',
            });

            onCreated?.(createdCourse.data);
            onClose?.();

            // FIX: always redirect
            navigate(`/courses/${newCourseId}`, {
                state: { course: createdCourse.data },
            });
        } catch (error) {
            console.error('Error creating course:', error);
        }
    }

    return (
        <div className={asModal ? "create-course create-course--modal" : "create-course"}>
            <form onSubmit={handleSubmit}>
                <div className="create-course__top">
                    <legend>What is your course?</legend>
                    {asModal && (
                        <button type="button" className="create-course__close" onClick={onClose}>
                            ✕
                        </button>
                    )}
                </div>
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
                <div className="create-course__actions">
                    {asModal && (
                        <button type="button" onClick={onClose} className="create-course__secondary">
                            Cancel
                        </button>
                    )}
                    <button type="submit">Create Course</button>
                </div>
            </form>
        </div>
    );
}