import { useState, useRef } from "react";
import defaultProfile from "../../assets/profile.svg";
import "./Comment.css";
import { apiClient } from "../../lib/api-client";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";

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
    setLoading(true);
    setError("");
    try {
      (async () => {
        const token = localStorage.getItem("access_token");
        const data = new FormData();
        if (!token) {
          router(LOGIN_ROUTE);
          return;
        }
        data.append("content", `@${parentUsername} ${formData.content}`);
        if (!parentid)
          throw new Error("Cannot post comment without reference.");
        data.append("parentid", parentid);
        if (file) data.append("file", file);
        await apiClient(`/api/discussion`, {
          method: "POST",
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        onSubmit();
      })();
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
        <img
          src={`http://localhost:3000/api/user/getProfilePhoto/${userid}`}
          className="pfp"
          onError={(e) => {
            e.target.src = defaultProfile;
          }}
        />
        <textarea
          className="text"
          onChange={handleChange}
          value={formData.content}
          name="content"
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
              <img src={URL.createObjectURL(file)} className="preview" />
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
