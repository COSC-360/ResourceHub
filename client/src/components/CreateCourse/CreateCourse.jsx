import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import CourseForm from "../CourseForm/CourseForm.jsx";

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
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const previewObjectUrlRef = useRef(null);

  function clearObjectPreview() {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  }

  useEffect(() => {
    if (!isEdit || !initialCourse) return;
    const next = {
      name: initialCourse.name ?? "",
      code: initialCourse.code ?? "",
      description: initialCourse.description ?? "",
    };
    setCourseData(next);
    setBaseline(next);
    clearObjectPreview();
    setSelectedImageFile(null);
    setError("");
  }, [isEdit, initialCourse, editCourseId]);

  useEffect(() => {
    return () => {
      clearObjectPreview();
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (!isEdit || !baseline) return true;
    return (
      trim(courseData.name) !== trim(baseline.name) ||
      trim(courseData.code) !== trim(baseline.code) ||
      trim(courseData.description) !== trim(baseline.description)
    );
  }, [isEdit, baseline, courseData]);

  function handleImageSelect(file) {
    if (!file.type?.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setError("");
    clearObjectPreview();
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setImagePreviewUrl(objectUrl);

    setSelectedImageFile(file);
  }

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
        let updated = null;

        if (Object.keys(updates).length > 0) {
          const payload = await apiClient(`/api/courses/${editCourseId}/update`, {
            method: "PATCH",
            body: updates,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          updated = payload?.data ?? null;
        }

        if (updated) {
          setBaseline({
            name: updated.name ?? course.name,
            code: updated.code ?? course.code,
            description: updated.description ?? course.description,
          });
          clearObjectPreview();
          setSelectedImageFile(null);
        }

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

      let finalCourse = createdCourse.data;
      if (selectedImageFile) {
        try {
          const fd = new FormData();
          fd.append("image", selectedImageFile);
          const imagePayload = await apiClient(`/api/courses/${newCourseId}/updateimage`, {
            method: "PATCH",
            body: fd,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          finalCourse = imagePayload?.data ?? finalCourse;
        } catch (uploadErr) {
          setError(uploadErr.message || "Course created, but image upload failed. You can upload an image later.");
          onCreated?.(createdCourse.data);
          return;
        }
      }

      setCourseData({
        name: "",
        code: "",
        description: "",
      });
      clearObjectPreview();
      setSelectedImageFile(null);
      setImagePreviewUrl("");

      onCreated?.(finalCourse);
      onClose?.();

      navigate(`/courses/${newCourseId}`, {
        state: { course: finalCourse },
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
    <CourseForm
      asModal={asModal}
      title={isEdit ? "Edit course" : "What is your course?"}
      subtitle={
        isEdit
          ? "Update the course details below."
          : "Describe your course to help people find it."
      }
      idSuffix={idSuffix}
      formData={courseData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
      onClose={onClose}
      onCancel={onClose}
      showCancel={asModal}
      canDelete={isEdit}
      onDelete={handleDelete}
      deleting={deleting}
      submitting={saving}
      submitLabel={isEdit ? "Save changes" : "Create Course"}
      submittingLabel={isEdit ? "Saving…" : "Creating…"}
      disableSubmit={isEdit && !hasChanges}
      imageUrl={!isEdit ? imagePreviewUrl : undefined}
      onImageSelect={!isEdit ? handleImageSelect : undefined}
    />
  );
}
