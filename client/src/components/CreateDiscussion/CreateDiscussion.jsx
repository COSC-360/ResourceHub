import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "../CreateDiscussion/CreateDiscussion.css";

const CreateDiscussion = ({ onDiscussionCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending POST request to /api/discussion");
      const token = localStorage.getItem("access_token");
      const result = await apiClient("/api/discussion", {
        method: "POST",
        body: {
          title: formData.title,
          content: formData.content,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Post created successfully:", result);
      setSuccess(true);
      setFormData({
        title: "",
        content: "",
      });

      if (onDiscussionCreated) {
        const newData = result.data || result;
        console.log("Passing to parent:", newData);
        onDiscussionCreated(newData);
      } else {
        setTimeout(() => router("/"), 1500);
      }
    } catch (err) {
      console.error("Error creating discussion:", err);
      setError(err.message || "Failed to create discussion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-discussion-container">
      <div className="create-discussion-card">
        <h2>Create a Discussion</h2>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">Discussion posted successfully!</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter discussion title"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Discussion Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your discussion here..."
              rows="6"
              disabled={loading}
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
