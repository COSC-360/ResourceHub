import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../lib/api-client";
import CourseCard from "../Cards/CourseCard.jsx";
import CreateCourse from "../CreateCourse/CreateCourse.jsx";
import "./AddMyCourse.css";

function isLoggedIn() {
  return Boolean(localStorage.getItem("access_token"));
}

export default function AddMyCoursePage({showAll = false}) {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadAvailableCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const allCoursesPromise = apiClient("/api/courses");
      const myIdsPromise = token
        ? apiClient("/api/memberships/me/course-ids", {
            headers: { Authorization: `Bearer ${token}` },
          })
        : Promise.resolve({ data: [] });

      const [allCoursesRes, myIdsRes] = await Promise.all([allCoursesPromise, myIdsPromise]);
      const allCourses = allCoursesRes.data || [];

      if (showAll) {
        setAvailableCourses(allCourses);
        return;
      }
      const myIds = new Set((myIdsRes.data || []).map(String));

      const filtered = allCourses.filter((course) => {
        const id = String(course._id ?? course.id);
        return !myIds.has(id);
      });

      setAvailableCourses(filtered);
    } catch (err) {
      setError(err.message || "Failed to load courses.");
    }
  }, [showAll]);

  useEffect(() => {
    const id = setTimeout(() => {
      void loadAvailableCourses();
    }, 0);

    return () => clearTimeout(id);
  }, [loadAvailableCourses]);

  function openCreateModal() {
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    setShowCreateModal(false);
  }

  async function handleCourseCreated() {
    setShowCreateModal(false);
    await loadAvailableCourses();
  }

  return (
    <div className={`add-my-course-page ${showCreateModal ? "is-blurred" : ""}`}>
      <div className="add-my-course-page__header">
        <div>
          <h1>All Courses</h1>
          <p>Select a course to open it, then join from the course page.</p>
        </div>
        {isLoggedIn() ? (
          <button className="add-my-course-page__create-btn" onClick={openCreateModal}>
            + Create Course
          </button>
        ) : null}
      </div>

      {error && <p className="mycourses-error">{error}</p>}

      <div className="all-courses-grid">
        {availableCourses.map((course) => (
          <CourseCard key={course._id ?? course.id} data={course} />
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-backdrop" onClick={closeCreateModal}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <CreateCourse asModal onClose={closeCreateModal} onCreated={handleCourseCreated} />
          </div>
        </div>
      )}
    </div>
  );
}