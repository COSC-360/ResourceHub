import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CourseCard from "../Cards/CourseCard.jsx";
import "./MyCoursesPage.css";

export default function MyCoursesPage() {
  const [myCourses, setMyCourses] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMyCourses() {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return navigate("/login");

        const response = await apiClient("/api/memberships/me/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMyCourses(response.data || []);
      } catch (err) {
        setError(err.message || "Failed to load My Courses.");
      }
    }

    loadMyCourses();
  }, [navigate]);

  return (
    <div className="my-courses-page">
      <h1>My Courses</h1>
      <p>Courses you are a member of.</p>

      {error && <p className="mycourses-error">{error}</p>}

      <div className="mycourses-grid">
        {myCourses.map((course) => (
          <CourseCard key={course._id ?? course.id} data={course} />
        ))}
      </div>
    </div>
  );
}