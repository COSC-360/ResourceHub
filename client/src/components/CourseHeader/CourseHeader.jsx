// takes course id and gets from db and displays course name, code, description, and image
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { apiClient } from '../../lib/api-client';
import './CourseHeader.css';

export function CourseHeader({ courseId }) {
    const [course, setCourse] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    // replace with actual member count from db when that gets implemented, for now just a placeholder
    const [memberCount, setMemberCount] = useState(1); 

    useEffect(() => {
        async function fetchCourse() {
            try {
                const payload = await apiClient(`/api/courses/${courseId}`, {});
                setCourse(payload.data);
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        }

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleJoinToggle = () => {
        if (isJoined) {
            setMemberCount(memberCount - 1);
        } else {
            setMemberCount(memberCount + 1);
        }
        setIsJoined(!isJoined);
    };

    if (!course) {
        return <div className="course-header-loading">Loading course details...</div>;
    }

    return (
        <div className="course-header">
            {course.image && <div className="course-header-image" style={{ backgroundImage: `url(${course.image})` }}></div>}
            <div className="course-header-content">
                <div className="course-header-info">
                    <h1 className="course-title">{course.name}</h1>
                    <h2 className="course-code">{course.code}</h2>
                    <p className="course-description">{course.description}</p>
                </div>
                <div className="course-header-actions">
                    <button 
                        className={`join-button ${isJoined ? 'joined' : ''}`}
                        onClick={handleJoinToggle}
                    >
                        {isJoined ? 'Joined' : 'Join'}
                    </button>
                    <div className="member-count">
                        <span className="member-icon">👥</span>
                        <span>{memberCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
