<<<<<<< HEAD:client/src/components/CreateDiscussion.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/CreateDiscussion.css";
=======
import { useState } from "react";
import "./CreateDiscussion.css";
import { apiClient } from "../../lib/api-client";
>>>>>>> d1912acce4e735c15ff505f1db2a82380956d555:client/src/components/CreateDiscussion/CreateDiscussion.jsx

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

    // Validate form data
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log(
        "Sending POST request to http://localhost:3000/api/discussion",
      );
<<<<<<< HEAD:client/src/components/CreateDiscussion.jsx
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://localhost:3000/api/discussion",
        {
          title: formData.title,
          content: formData.content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.status === 201) {
        const errorText = await response.data;
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to create discussion: ${response.status} ${errorText}`,
        );
      }

      const result = await response.data;
=======
      const result = await apiClient("/api/discussion", {
        method: "POST",
        body: {
          username: formData.username,
          faculty: formData.faculty,
          content: formData.content,
        },
      });

>>>>>>> d1912acce4e735c15ff505f1db2a82380956d555:client/src/components/CreateDiscussion/CreateDiscussion.jsx
      console.log("Post created successfully:", result);
      setSuccess(true);
      setFormData({
        title: "",
        content: "",
      });
      router("/");
      setTimeout(() => setSuccess(false), 3000);
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
              placeholder="Enter your username"
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
