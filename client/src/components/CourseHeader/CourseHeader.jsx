import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
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

export function CourseHeader({ course }) {
    const navigate = useNavigate();

    const handleDelete = async () => {
        const shouldDelete = window.confirm(
            "Are you sure you want to delete this course? This action cannot be undone.",
        );

        if (!shouldDelete) {
            return;
        }

        try {
            await apiClient(`/api/courses/${course._id}`, {
                method: "DELETE",
            });
            alert("Course deleted successfully.");
            navigate("/");
        } catch (error) {
            console.error("Error deleting course:", error);
            alert(error.message || "An error occurred while deleting the course.");
        }
    };

    return (
        <section className="course-header">
            <div className="course-header__image-wrap">
                <img className="course-header__image" src={course.image} alt={course.name} />
            </div>

            <div className="course-header__content">
                <div className="course-header__main">
                    <h1 className="course-header__title">{course.name} - {course.code}</h1>
                    <p className="course-header__description">{course.description}</p>
                </div>

                <div className="course-header__side">
                    <button // TODO: implement join/leave functionality
                        type="button"
                        className={`course-header__join`}
                    >
                        Join
                    </button>
                    <a
                        href={`/courses/${course._id}/update`} // TODO: implement update course page
                        className="course-header__edit-link"
                    >
                        Edit
                    </a>
                    <button // TODO: implement delete course functionality
                        type="button"
                        className="course-header__delete-link"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>

                    <div
                        className="course-header__members"
                        aria-label={`${course.memberCount} members`}
                    >
                        <PeopleIcon />
                        <span className="course-header__members-count">{course.memberCount}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}