import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { CourseHeader } from "../CourseHeader/CourseHeader.jsx";
import HybridFeed from "../HybridFeed/HybridFeed.jsx";
import CreateDiscussion from "../CreateDiscussion/CreateDiscussion.jsx";

export default function CoursePage() {
  const location = useLocation();
  const { courseId } = useParams();

  // keep state as initial skeleton only
  const [course, setCourse] = useState(location.state?.course ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [feedVersion, setFeedVersion] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      try {
        setIsLoading(true);
        const res = await apiClient(`/api/courses/${courseId}`);
        const fresh = res?.data ?? res;
        if (active) setCourse(fresh);
      } catch (err) {
        if (active) setError(err.message || "Failed to load course");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadCourse();
    return () => {
      active = false;
    };
  }, [courseId]);

  const handleMembershipChanged = useCallback((payload) => {
    // payload: { isMember, memberCount }
    setCourse((prev) => {
      if (!prev) return prev;

      if (typeof payload?.memberCount === "number") {
        return {
          ...prev,
          memberCount: payload.memberCount,
          numberOfStudents: payload.memberCount,
        };
      }

      const current = Number(
        prev.memberCount ?? prev.numberOfStudents ?? 0
      );
      const next = payload?.isMember ? current + 1 : Math.max(0, current - 1);

      return { ...prev, memberCount: next, numberOfStudents: next };
    });
  }, []);

  if (isLoading) {
    return (
      <div className="course-page">
        <h2>Course Page</h2>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-page">
        <h2>Course Page</h2>
        <p>{error || "No details found for this course."}</p>
        <p><strong>Course ID:</strong> {courseId}</p>
        <Link to="/">Back to create course</Link>
      </div>
    );
  }

  return (
    <div className="course-page">
      <CourseHeader course={course} onMembershipChanged={handleMembershipChanged} />
      <CreateDiscussion
        courseId={courseId}
        buttonLabel="New Discussion"
        embedded={false}
        onDiscussionCreated={() => setFeedVersion((v) => v + 1)}
      />
      <HybridFeed
        key={feedVersion}
        courseId={courseId}
        courseIds={[courseId]}
        showDiscussions={true}
        showResources={true}
        showCourses={false}
        sort="newest"
        limit={20}
      />
    </div>
  );
}
