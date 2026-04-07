import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "../CreateDiscussion/CreateDiscussion.css";

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
  const router = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!courseId) {
      setError("Missing course id.");
      setLoading(false);
      return;
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      if (file) data.append("file", file);

      const token = localStorage.getItem("access_token");
      const result = await apiClient(`/api/discussion/course/${courseId}`, {
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
                <input id="title" name="title" value={formData.title} onChange={handleChange} disabled={loading} />
              </div>

              <div className="form-group">
                <label htmlFor="content">Discussion Content</label>
                <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows="6" disabled={loading} />
              </div>

              <div className="form-group">
                <label htmlFor="file">Attach an image:</label>
                <input type="file" id="file" name="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
              </div>

              {file && <img src={URL.createObjectURL(file)} alt="preview" width={100} />}

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
            <input id="title" name="title" value={formData.title} onChange={handleChange} disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="content">Discussion Content</label>
            <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows="6" disabled={loading} />
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
