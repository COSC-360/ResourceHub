import { useState } from "react";
import { apiClient } from "../../lib/api-client";
import "./Reply.css";
import { LIMITS, validateReplyContent } from "../../lib/formValidation.js";

function normalizeCourseId(courseId) {
  if (!courseId) return "";
  if (typeof courseId === "object") return courseId._id || courseId.id || "";
  return String(courseId);
}

export default function Reply({ courseId, parentId, onSubmitted, onCancel }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resolvedCourseId = normalizeCourseId(courseId);

  async function handleSubmit(event) {
    event.preventDefault();

    const replyErr = validateReplyContent(content);
    if (replyErr) {
      setError(replyErr);
      return;
    }
    const trimmed = content.trim();

    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Log in to reply.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("content", trimmed);
      formData.append("parentid", parentId);

      const json = await apiClient(`/api/discussion/course/${resolvedCourseId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setContent("");
      onSubmitted?.(json?.data ?? json);
    } catch (err) {
      setError(err.message || "Failed to submit reply.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="reply" onSubmit={handleSubmit}>
      <textarea
        className="reply__input"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a reply..."
        rows={3}
        maxLength={LIMITS.DISCUSSION_CONTENT_MAX}
      />

      {error && <p className="reply__error">{error}</p>}

      <div className="reply__actions">
        <button type="submit" className="reply__button" disabled={isSubmitting || !resolvedCourseId}>
          {isSubmitting ? "Posting..." : "Post reply"}
        </button>
        <button type="button" className="reply__button reply__button--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
