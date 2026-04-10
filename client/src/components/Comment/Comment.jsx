import { useState, useRef } from "react";
import "./Comment.css";
import { apiClient } from "../../lib/api-client";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";
import { LIMITS, trimStr, validateMaxLength } from "../../lib/formValidation.js";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";
import noImage from "../../assets/no-image.png";

const Comment = ({ onSubmit, parentid, parentUsername, courseId: _courseId }) => {
  const [formData, setFormData] = useState({ content: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const userid = localStorage.getItem("userid");

  const router = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = trimStr(formData.content);
    if (!trimmed && !file) {
      setError("Enter a comment or attach an image.");
      return;
    }
    if (!parentid) {
      setError("Cannot post comment without reference.");
      return;
    }
    const token = localStorage.getItem("access_token");
    if (!token) {
      router(LOGIN_ROUTE);
      return;
    }
    const fullContent = `@${parentUsername} ${trimmed}`.trimEnd();
    const lenErr = validateMaxLength(
      fullContent,
      LIMITS.DISCUSSION_CONTENT_MAX,
      "Comment",
    );
    if (lenErr) {
      setError(lenErr);
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("content", fullContent);
      data.append("parentid", parentid);
      if (file) data.append("file", file);
      const json = await apiClient(`/api/discussion`, {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData({ content: "" });
      onSubmit?.(json?.data ?? json);
    } catch (err) {
      setError(err?.message || "Failed to post comment");
    } finally {
      setLoading(false);
    }
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
    setError("");
    setFile(selectedFile);
  };

  const resetFile = () => {
    if (file && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
  };

  return (
    <form className="container" onSubmit={handleSubmit}>
      <div className="form_body">
        <ProfileAvatar
          userId={userid}
          alt="profile photo"
          className="pfp"
        />
        <textarea
          className="text"
          onChange={handleChange}
          value={formData.content}
          name="content"
          maxLength={LIMITS.DISCUSSION_CONTENT_MAX}
        />
        <input type="submit" />
      </div>
      <div className="form_footer">
        <div className="file_container">
          {error && <span>{error}</span>}
          {loading && <span>loading...</span>}
          <label htmlFor="file">Attach an image:</label>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {file && (
            <div className="preview_container">
              <img
                src={URL.createObjectURL(file)}
                className="preview"
                onError={(event) => {
                  if (event.currentTarget.src !== noImage) {
                    event.currentTarget.src = noImage;
                  }
                }}
              />
              <button
                className="remove_image"
                type="button"
                onClick={() => resetFile()}
              >
                <i className="bi bi-trash3-fill" /> Remove image
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default Comment;
