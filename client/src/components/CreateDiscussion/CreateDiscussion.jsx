import { useState } from "react";
import "./CreateDiscussion.css";
import { apiClient } from "../../lib/api-client";

const CreateDiscussion = ({ onDiscussionCreated }) => {
  const [formData, setFormData] = useState({
    username: "",
    faculty: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    if (
      !formData.username.trim() ||
      !formData.content.trim() ||
      !formData.faculty.trim()
    ) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      console.log(
        "Sending POST request to http://localhost:3000/api/discussion",
      );
      const result = await apiClient("/api/discussion", {
        method: "POST",
        body: {
          username: formData.username,
          faculty: formData.faculty,
          content: formData.content,
        },
      });

      console.log("Post created successfully:", result);
      setSuccess(true);
      setFormData({
        username: "",
        faculty: "",
        content: "",
      });

      if (onDiscussionCreated) {
        const newData = result.data || result;
        console.log("Passing to parent:", newData);
        onDiscussionCreated(newData);
      }

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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="faculty">Faculty</label>
            <select
              id="faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select a faculty</option>
              <option value="Engineering">Engineering</option>
              <option value="Science">Science</option>
              <option value="Arts">Arts</option>
              <option value="Business">Business</option>
              <option value="Medicine">Medicine</option>
              <option value="Law">Law</option>
            </select>
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
