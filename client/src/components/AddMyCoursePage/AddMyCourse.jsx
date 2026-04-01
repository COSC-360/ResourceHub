import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "./AddMyCourse.css";

function CourseOptionCard({ course, onAdd }) {
  return (
    <button className="course-option-square" onClick={() => onAdd(course)}>
      <h3>{course.code}</h3>
      <p>{course.name}</p>
    </button>
  );
}

export default function AddMyCoursePage() {
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAllCourses() {
      try {
        const response = await apiClient("/api/courses");
        setAllCourses(response.data || []);
      } catch (err) {
        setError(err.message || "Failed to load courses.");
      }
    }

    loadAllCourses();
  }, []);

  async function handleAddCourse(course) {
    try {
      await apiClient("/api/user/save", {
        method: "POST",
        body: { courseId: course.id },
      });

      navigate("/my-courses");
    } catch (err) {
      setError(err.message || "Failed to add course.");
    }
  }

  return (
    <div className="add-my-course-page">
      <h1>Add My Course</h1>
      <p>Select a course to add to your My Courses page.</p>

      {error && <p className="mycourses-error">{error}</p>}

      <div className="all-courses-grid">
        {allCourses.map((course) => (
          <CourseOptionCard
            key={course.id}
            course={course}
            onAdd={handleAddCourse}
          />
        ))}
      </div>
    </div>
  );
}