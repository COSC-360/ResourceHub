import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CourseCard from "../Cards/CourseCard.jsx";
import HybridFeed from "../HybridFeed/HybridFeed.jsx";
import "./SearchResults.css";

export function SearchResults() {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const term = useMemo(
    () => new URLSearchParams(location.search).get("term")?.trim() ?? "",
    [location.search],
  );

  useEffect(() => {
    const fetchResults = async () => {
      if (!term || !term.trim()) {
        setCourses([]);
        return;
      }

      setIsLoadingCourses(true);

      try {
        const data = await apiClient(
          `/api/common/search?term=${encodeURIComponent(term)}`,
          {
            method: "GET",
          },
        );

        const courseResults =
          data?.searchResults?.courses || data?.courses || [];

        setCourses(courseResults);
      } catch (error) {
        console.error("Search API error", error);
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchResults();
  }, [term]);

  if (!term) {
    return (
      <div className="search-results">
        <h1>Search Results</h1>
        <p className="search-results__empty">Enter a search term to see results.</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <h1>Search Results</h1>

      <section className="search-results__section">
        <h2>Courses</h2>
        {isLoadingCourses ? (
          <div className="search-results__status">Loading courses...</div>
        ) : courses.length ? (
          <div className="search-results__course-grid">
            {courses.map((course) => (
              <CourseCard key={course._id ?? course.id} data={course} />
            ))}
          </div>
        ) : (
          <div className="search-results__status">No courses match this search.</div>
        )}
      </section>

      <section className="search-results__section">
        <h2>Discussions</h2>
        <HybridFeed searchTerm={term} showCourseScope={true} />
      </section>
    </div>
  );
}

export default SearchResults;
