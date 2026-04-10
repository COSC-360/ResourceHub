import { useEffect, useRef, useState } from "react";
import { apiClient } from "../../lib/api-client";
import "./CourseImageMenu.css";

function DotsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="course-image-menu__icon">
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
    </svg>
  );
}

export default function CourseImageMenu({ courseId, onUpdated, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function uploadImage(file) {
    if (!courseId || !file) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("You must be logged in to upload an image.");
      return;
    }

    const fd = new FormData();
    fd.append("image", file);

    setUploading(true);
    setError("");
    try {
      const payload = await apiClient(`/api/courses/${courseId}/updateimage`, {
        method: "PATCH",
        body: fd,
        headers: { Authorization: `Bearer ${token}` },
      });

      onUpdated?.(payload?.data ?? null);
      setOpen(false);
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="course-image-menu" ref={menuRef}>
      <button
        type="button"
        className="course-image-menu__button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Course image actions"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled || uploading}
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="course-image-menu__dropdown" role="menu">
          <button
            type="button"
            className="course-image-menu__item"
            role="menuitem"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
          {error ? <p className="course-image-menu__error">{error}</p> : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              if (!file.type?.startsWith("image/")) {
                setError("Only image files are allowed.");
                return;
              }
              void uploadImage(file);
            }}
          />
        </div>
      )}
    </div>
  );
}