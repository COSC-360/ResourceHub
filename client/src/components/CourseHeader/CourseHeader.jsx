import { useState, useEffect, useContext } from "react";
import { apiClient } from "../../lib/api-client";
import AuthContext from "../../AuthContext.jsx";
import { DEFAULT_COURSE_COVER, resolveCourseImageSrc } from "../../lib/course-cover.js";
import CreateCourse from "../CreateCourse/CreateCourse.jsx";
import CourseImageMenu from "../CourseImageMenu/CourseImageMenu.jsx";
import CourseMembershipButton from "../CourseMembershipButton/CourseMembershipButton.jsx";
import MemberCount from "../MemberCount/MemberCount.jsx";
import UpdateCourseInfo from "../UpdateCourseInfo/UpdateCourseInfo.jsx";
import "./CourseHeader.css";

function PeopleIcon() {
    return (
        <svg
            className="course-header__members-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.96 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z"
                fill="currentColor"
            />
        </svg>
    );
}

export function CourseHeader({ course, onMembershipChanged, onCourseUpdated, onCourseDeleted }) {
    const { user: sessionUser } = useContext(AuthContext);
    const [displayCourse, setDisplayCourse] = useState(course);

    useEffect(() => {
        setDisplayCourse(course);
    }, [course]);

    const courseId = displayCourse._id || displayCourse.id;

    const [isInstructor, setIsInstructor] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const isAdmin = Boolean(sessionUser?.admin);
    const canManageCourse = isInstructor || isAdmin;

    useEffect(() => {
        let active = true;

        async function loadRole() {
            const token = localStorage.getItem("access_token");
            if (!token || !courseId) return;

            try {
                const res = await apiClient(`/api/memberships/me/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (active) setIsInstructor(res?.role === "instructor");
            } catch {
                if (active) setIsInstructor(false);
            }
        }

        loadRole();
        return () => {
            active = false;
        };
    }, [courseId]);

    const memberCount = Number(
        displayCourse.memberCount ?? displayCourse.numberOfStudents ?? 0
    );

    const imageSrc = resolveCourseImageSrc(displayCourse.image);
    const coverSrc = imageSrc || DEFAULT_COURSE_COVER;
    const coverAlt = imageSrc ? displayCourse.name : "";

    return (
        <section className="course-header">
            <div className="course-header__image-wrap">
                <img
                    className="course-header__image"
                    src={coverSrc}
                    alt={coverAlt}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_COURSE_COVER;
                    }}
                />
                {canManageCourse && (
                    <CourseImageMenu
                        courseId={courseId}
                        onUpdated={(updated) => {
                            if (updated) setDisplayCourse(updated);
                            onCourseUpdated?.(updated);
                        }}
                    />
                )}
            </div>

            <div className="course-header__content">
                <div className="course-header__main">
                    <h1 className="course-header__title">{displayCourse.name} - {displayCourse.code}</h1>
                    <p className="course-header__description">
                        {displayCourse.description?.trim() ? displayCourse.description : "No description"}
                    </p>
                </div>

                <div className="course-header__side">
                    <CourseMembershipButton
                        courseId={courseId}
                        onMembershipChanged={onMembershipChanged}
                    />

                    {canManageCourse && (
                        <button
                            type="button"
                            className="course-header__edit-link"
                            onClick={() => setShowEditModal(true)}
                        >
                            Edit
                        </button>
                    )}

                    <div
                        className="course-header__members"
                        aria-label={`${memberCount} members`}
                    >
                        <PeopleIcon />
                        <MemberCount
                            count={memberCount}
                            className="course-header__members-text"
                        />
                    </div>
                </div>

                {showEditModal && (
                    <div
                        className="course-header__modal-backdrop"
                    >
                        <div
                            className="course-header__modal-panel"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isInstructor ? (
                                <UpdateCourseInfo
                                    asModal
                                    courseId={courseId}
                                    initialCourse={displayCourse}
                                    onClose={() => setShowEditModal(false)}
                                    onUpdated={(updated) => {
                                        if (updated) setDisplayCourse(updated);
                                        onCourseUpdated?.(updated);
                                    }}
                                />
                            ) : isAdmin ? (
                                <CreateCourse
                                    asModal
                                    mode="edit"
                                    courseId={courseId}
                                    initialCourse={displayCourse}
                                    onClose={() => setShowEditModal(false)}
                                    onUpdated={(updated) => {
                                        if (updated) setDisplayCourse(updated);
                                        onCourseUpdated?.(updated);
                                    }}
                                    onDeleted={() => {
                                        setShowEditModal(false);
                                        onCourseDeleted?.();
                                    }}
                                />
                            ) : null}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
