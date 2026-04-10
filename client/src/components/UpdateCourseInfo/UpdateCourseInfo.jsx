import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CourseForm from "../CourseForm/CourseForm.jsx";
import "./UpdateCourseInfo.css";
import { coursePath } from "../../constants/RouteConstants.jsx";
import { validateCourseFields } from "../../lib/formValidation.js";

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default function UpdateCourseInfo({ asModal = false, onClose, onUpdated, courseId: courseIdProp, initialCourse }) {
  const navigate = useNavigate();
  const { courseId: routeCourseId } = useParams();
  const courseId = courseIdProp || routeCourseId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [initial, setInitial] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    let active = true;

    async function loadCourse() {
      if (!courseId) {
        setError("Missing course id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const course = initialCourse
          ? initialCourse
          : (await apiClient(`/api/courses/${courseId}`, { method: "GET" }))?.data;

        const next = {
          name: course?.name ?? "",
          code: course?.code ?? "",
          description: course?.description ?? "",
        };

        if (!active) return;
        setInitial(next);
        setForm(next);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Failed to load course.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      active = false;
    };
  }, [courseId, initialCourse]);

  const hasChanges = useMemo(() => {
    return (
      trim(form.name) !== trim(initial.name) ||
      trim(form.code) !== trim(initial.code) ||
      trim(form.description) !== trim(initial.description)
    );
  }, [form, initial]);

  function onChange(e) {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleCancel() {
    if (asModal) {
      onClose?.();
      return;
    }
    if (courseId) {
      navigate(coursePath(courseId), { replace: true });
    } else {
      navigate(-1);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!courseId) {
      setError("Missing course id.");
      return;
    }

    const cleaned = {
      name: trim(form.name),
      code: trim(form.code),
      description: trim(form.description),
    };

    if (!cleaned.name) return setError("Course name is required.");
    if (!cleaned.code) return setError("Course code is required.");

    const fieldErr = validateCourseFields(
      cleaned.name,
      cleaned.code,
      cleaned.description,
    );
    if (fieldErr) return setError(fieldErr);

    const updates = {};
    if (cleaned.name !== trim(initial.name)) updates.name = cleaned.name;
    if (cleaned.code !== trim(initial.code)) updates.code = cleaned.code;
    if (cleaned.description !== trim(initial.description)) {
      updates.description = cleaned.description;
    }

    if (Object.keys(updates).length === 0) {
      setError("No changes to save.");
      return;
    }

    try {
      setSaving(true); // FIX: was missing
      const token = localStorage.getItem("access_token");
      const payload = await apiClient(`/api/courses/${courseId}/update`, {
        method: "PATCH",
        body: updates,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const updatedCourse = payload?.data ?? null;
      onUpdated?.(updatedCourse);

      if (asModal) onClose?.();
      else navigate(coursePath(courseId), { replace: true });
    } catch (err) {
      setError(err.message || "Failed to update course.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="update-course-page">Loading...</div>;
  }

  return (
    <CourseForm
      asModal={asModal}
      title="Update Course Info"
      subtitle="Update the course details below."
      idSuffix={courseId || "update"}
      formData={form}
      onChange={onChange}
      onSubmit={onSubmit}
      error={error}
      onClose={onClose}
      onCancel={handleCancel}
      showCancel
      submitting={saving}
      submitLabel="Save Changes"
      submittingLabel="Saving..."
      disableSubmit={!hasChanges}
    />
  );
}
