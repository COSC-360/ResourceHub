import { useState } from "react";
import { apiClient } from "../../lib/api-client";
import "../CreateDiscussion/CreateDiscussion.css";
import noImage from "../../assets/no-image.png";
import {
  LIMITS,
  trimStr,
  validateDiscussionCreate,
} from "../../lib/formValidation.js";

const CreateDiscussion = ({
  courseId,
  onDiscussionCreated,
  embedded = false,
  buttonLabel = "New Discussion",
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(embedded);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!selectedFile.type?.startsWith("image/")) {
      e.target.value = "";
      setError("Only image files are allowed.");
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!courseId) {
      setError(
        "A course is required. Open a course page to create a discussion there.",
      );
      return;
    }

    const createErr = validateDiscussionCreate(
      formData.title,
      formData.content,
    );
    if (createErr) {
      setError(createErr);
      return;
    }

    const titleOut = trimStr(formData.title);
    const contentOut = trimStr(formData.content);

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", titleOut);
      data.append("content", contentOut);
      if (file) data.append("file", file);

      const token = localStorage.getItem("access_token");
      const result = await apiClient(`/api/courses/${courseId}/discussions`, {
        method: "POST",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(true);
      setFormData({ title: "", content: "" });
      setFile(null);

      const newData = result.data || result;
      if (onDiscussionCreated) onDiscussionCreated(newData);

      if (!embedded) setOpen(false);
    } catch (err) {
      setError(err.message || "Failed to create discussion");
    } finally {
      setLoading(false);
    }
  };

  if (!embedded) {
    return (
      <div className="create-discussion-container">
        {!open ? (
          <button
            type="button"
            className="submit-btn create-discussion-toggle"
            onClick={() => setOpen(true)}
          >
            {buttonLabel}
          </button>
        ) : null}

        {open && (
          <div className="create-discussion-card">
            <h2>Create a Discussion</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Discussion posted successfully!</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                  maxLength={LIMITS.DISCUSSION_TITLE_MAX}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Discussion Content</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows="6"
                  disabled={loading}
                  maxLength={LIMITS.DISCUSSION_CONTENT_MAX}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="file">Attach an image:</label>
                <input type="file" id="file" name="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
              </div>

              {file && (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  width={100}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = noImage;
                  }}
                />
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Posting..." : "Post Discussion"}
              </button>

              <button
                type="button"
                className="submit-btn create-discussion-cancel"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="create-discussion-container">
      <div className="create-discussion-card">
        <h2>Create a Discussion</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">Discussion posted successfully!</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
              maxLength={LIMITS.DISCUSSION_TITLE_MAX}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Discussion Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              disabled={loading}
              maxLength={LIMITS.DISCUSSION_CONTENT_MAX}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Posting..." : "Post Discussion"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDiscussion;
