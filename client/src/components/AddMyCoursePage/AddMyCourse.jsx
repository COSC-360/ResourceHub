import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CourseCard from "../Cards/CourseCard.jsx";
import CreateCourse from "../CreateCourse/CreateCourse.jsx";
import "./AddMyCourse.css";

export default function AddMyCoursePage() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const loadAvailableCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const [allCoursesRes, myIdsRes] = await Promise.all([
        apiClient("/api/courses"),
        apiClient("/api/memberships/me/course-ids", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allCourses = allCoursesRes.data || [];
      const myIds = new Set((myIdsRes.data || []).map(String));

      const filtered = allCourses.filter((course) => {
        const id = String(course._id ?? course.id);
        return !myIds.has(id);
      });

      setAvailableCourses(filtered);
    } catch (err) {
      setError(err.message || "Failed to load courses.");
    }
  }, [navigate]);

  useEffect(() => {
    loadAvailableCourses();
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
        <button className="add-my-course-page__create-btn" onClick={openCreateModal}>
          + Create Course
        </button>
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