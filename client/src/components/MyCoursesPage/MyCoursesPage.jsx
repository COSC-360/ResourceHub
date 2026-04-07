import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "./MyCoursesPage.css";

function MyCourseCard({ course, onClick }) {
  return (
    <button type="button" className="mycourse-square mycourse-nav-button" onClick={onClick}>
      <h3>{course.code}</h3>
      <p>{course.name}</p>
    </button>
  );
}

function AddCourseCard({ onClick }) {
  return (
    <button className="mycourse-square add-course-square" onClick={onClick}>
      <span className="plus-sign">+</span>
      <span>Add Courses to My Courses</span>
    </button>
  );
}

export default function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMyCourses() {
      try {
        const response = await apiClient("/api/user/courses");
        setMyCourses(response.data || []);
      } catch (err) {
        setError(err.message || "Failed to load My Courses.");
      }
    }

    loadMyCourses();
  }, []);

  return (
    <div className="my-courses-page">
      <h1>My Courses</h1>
      <p>Your saved courses.</p>

      {error && <p className="mycourses-error">{error}</p>}

      <div className="mycourses-grid">
        {myCourses.map((course) => (
          <MyCourseCard key={course._id} course={course} onClick={() => navigate(`/courses/${course._id}`)} />
        ))}

        <AddCourseCard onClick={() => navigate("/my-courses/add")} />
      </div>
    </div>
  );
}