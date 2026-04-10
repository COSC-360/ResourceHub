import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateCourse.css";
import { apiClient } from "../../lib/api-client";

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default function CreateCourse({
  asModal = false,
  onClose,
  onCreated,
  mode = "create",
  courseId: editCourseId,
  initialCourse = null,
  onUpdated,
  onDeleted,
}) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [courseData, setCourseData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [baseline, setBaseline] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit || !initialCourse) return;
    const next = {
      name: initialCourse.name ?? "",
      code: initialCourse.code ?? "",
      description: initialCourse.description ?? "",
    };
    setCourseData(next);
    setBaseline(next);
    setError("");
  }, [isEdit, initialCourse, editCourseId]);

  const hasChanges = useMemo(() => {
    if (!isEdit || !baseline) return true;
    return (
      trim(courseData.name) !== trim(baseline.name) ||
      trim(courseData.code) !== trim(baseline.code) ||
      trim(courseData.description) !== trim(baseline.description)
    );
  }, [isEdit, baseline, courseData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setError("");
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const course = {
      name: trim(courseData.name),
      code: trim(courseData.code),
      description: trim(courseData.description),
    };

    if (!course.name || !course.code) {
      setError("Course name and code are required.");
      return;
    }

    if (isEdit) {
      if (!editCourseId) {
        setError("Missing course id.");
        return;
      }
      const updates = {};
      if (baseline) {
        if (course.name !== trim(baseline.name)) updates.name = course.name;
        if (course.code !== trim(baseline.code)) updates.code = course.code;
        if (course.description !== trim(baseline.description)) {
          updates.description = course.description;
        }
      }
      if (Object.keys(updates).length === 0) {
        setError("No changes to save.");
        return;
      }

      try {
        setSaving(true);
        const token = localStorage.getItem("access_token");
        const payload = await apiClient(`/api/courses/${editCourseId}/update`, {
          method: "PATCH",
          body: updates,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const updated = payload?.data ?? null;
        onUpdated?.(updated);
        onClose?.();
      } catch (err) {
        setError(err.message || "Failed to update course.");
      } finally {
        setSaving(false);
      }
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      const createdCourse = await apiClient("/api/courses/create", {
        method: "POST",
        body: course,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const newCourseId = createdCourse?.data?._id || createdCourse?.data?.id;
      if (!newCourseId) {
        throw new Error("Created course ID missing from response");
      }

      setCourseData({
        name: "",
        code: "",
        description: "",
      });

      onCreated?.(createdCourse.data);
      onClose?.();

      navigate(`/courses/${newCourseId}`, {
        state: { course: createdCourse.data },
      });
    } catch (err) {
      setError(err.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit || !editCourseId) return;
    if (
      !window.confirm(
        "Delete this course permanently? This cannot be undone.",
      )
    ) {
      return;
    }
    setError("");
    try {
      setDeleting(true);
      const token = localStorage.getItem("access_token");
      await apiClient(`/api/courses/${editCourseId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      onClose?.();
      onDeleted?.();
      navigate("/courses", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to delete course.");
    } finally {
      setDeleting(false);
    }
  }

  const idSuffix = isEdit && editCourseId ? String(editCourseId) : "new";

  return (
    <div className={asModal ? "create-course create-course--modal" : "create-course"}>
      <form onSubmit={handleSubmit}>
        <div className="create-course__top">
          <legend>
            {isEdit ? "Edit course" : "What is your course?"}
          </legend>
          {asModal && (
            <button
              type="button"
              className="create-course__close"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
        <p>
          {isEdit
            ? "Update the course details below."
            : "Describe your course to help people find it."}
        </p>
        <fieldset>
          <label htmlFor={`course-name-${idSuffix}`}>Course Name:</label>
          <input
            type="text"
            id={`course-name-${idSuffix}`}
            name="name"
            value={courseData.name}
            onChange={handleChange}
            required
            disabled={saving || deleting}
          />
        </fieldset>
        <fieldset>
          <label htmlFor={`course-code-${idSuffix}`}>Course Code:</label>
          <input
            type="text"
            id={`course-code-${idSuffix}`}
            name="code"
            value={courseData.code}
            onChange={handleChange}
            required
            disabled={saving || deleting}
          />
        </fieldset>
        <fieldset>
          <label htmlFor={`course-desc-${idSuffix}`}>Course Description:</label>
          <textarea
            id={`course-desc-${idSuffix}`}
            name="description"
            value={courseData.description}
            onChange={handleChange}
            required={!isEdit}
            disabled={saving || deleting}
          />
        </fieldset>
        {error ? <p className="create-course__error">{error}</p> : null}
        <div className="create-course__actions">
          {asModal && (
            <button
              type="button"
              onClick={onClose}
              className="create-course__secondary"
              disabled={saving || deleting}
            >
              Cancel
            </button>
          )}
          {isEdit && (
            <button
              type="button"
              className="create-course__delete"
              onClick={handleDelete}
              disabled={saving || deleting}
            >
              {deleting ? "Deleting…" : "Delete course"}
            </button>
          )}
          <button type="submit" disabled={saving || deleting || (isEdit && !hasChanges)}>
            {saving
              ? isEdit
                ? "Saving…"
                : "Creating…"
              : isEdit
                ? "Save changes"
                : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
}
