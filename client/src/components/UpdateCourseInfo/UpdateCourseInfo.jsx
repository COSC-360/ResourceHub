import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "./UpdateCourseInfo.css";

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default function UpdateCourseInfo({ asModal = false, onClose, onUpdated, courseId: courseIdProp, initialCourse }) {
  const navigate = useNavigate();
  const { courseId: routeCourseId } = useParams();
  const courseId = courseIdProp || routeCourseId;
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [initial, setInitial] = useState({
    name: "",
    code: "",
    description: "",
    image: "",
  });

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    image: "",
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
          image: course?.image ?? "",
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

  async function uploadImage(file) {
    if (!courseId || !file) return;

    const fd = new FormData();
    fd.append("image", file);

    setUploadingImage(true);
    setError("");

    try {
      const payload = await apiClient(`/api/courses/${courseId}/updateimage`, {
        method: "PATCH",
        body: fd,
      });

      const updatedCourse = payload?.data;
      const nextImage = updatedCourse?.image ?? "";

      setInitial((prev) => ({ ...prev, image: nextImage }));
      setForm((prev) => ({ ...prev, image: nextImage }));
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function onImageChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    await uploadImage(file);
  }

  function handleCancel() {
    if (asModal) {
      onClose?.();
      return;
    }
    if (courseId) {
      navigate(`/courses/${courseId}`, { replace: true });
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
      else navigate(`/courses/${courseId}`, { replace: true });
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
    <div className={asModal ? "update-course update-course--modal" : "update-course"}>
      <div className="update-course-card">
        <h1 className="update-course-title">Update Course Info</h1>

        {form.image ? (
          <img
            src={form.image}
            alt="Course"
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 16 }}
          />
        ) : null}

        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="update-course-btn update-course-btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? "Uploading..." : "Upload / Change Image"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            hidden
          />
        </div>

        <form className="update-course-form" onSubmit={onSubmit}>
          <label className="update-course-label" htmlFor="name">
            Course Name
          </label>
          <input
            id="name"
            name="name"
            className="update-course-input"
            type="text"
            value={form.name}
            onChange={onChange}
            required
          />

          <label className="update-course-label" htmlFor="code">
            Course Code
          </label>
          <input
            id="code"
            name="code"
            className="update-course-input"
            type="text"
            value={form.code}
            onChange={onChange}
            required
          />

          <label className="update-course-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="update-course-textarea"
            rows={5}
            value={form.description}
            onChange={onChange}
          />

          {error ? <p className="update-course-error">{error}</p> : null}

          <div className="update-course-actions">
            <button
              type="button"
              className="update-course-btn update-course-btn-secondary"
              onClick={handleCancel}
              disabled={saving || uploadingImage}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="update-course-btn update-course-btn-primary"
              disabled={saving || uploadingImage || !hasChanges}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
