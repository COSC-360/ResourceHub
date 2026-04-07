import React, { useState, useRef, useEffect } from "react";
import "./AuthForms.css";
import defaultAvatar from "../../assets/profile.svg";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";

const InformationForm = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ bio: "" });
  const present = file || formData.bio;
  const fileCurrentRef = useRef(null);

  const router = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetFile = () => {
    if (file && fileCurrentRef.current) {
      fileCurrentRef.current = "";
    }
    setFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!present) router("/");
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) router("/auth/register");
        const data = new FormData();
        data.append("bio", formData.bio);
        data.append("file", file);
        data.append("faculty", formData.faculty);
        const response = await apiClient("/api/user/updateProfile", {
          method: "PATCH",
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        localStorage.removeItem("first_time");
        router("/");
      } catch (err) {
        console.log(err);
      }
    })();
  };

  useEffect(() => {
    const status = localStorage.getItem("first_time");
    if (!status) router("/");
  }, [formData, file, router]);

  return (
    <div className="auth-form-page">
      <form className="auth-form-card" onSubmit={handleSubmit}>
        <div className="avatar_wrapper">
          <img
            src={file ? URL.createObjectURL(file) : defaultAvatar}
            className="avatar_preview"
          />
          <input
            type="file"
            className="file_upload"
            name="file"
            onChange={handleFileChange}
          />
        </div>
        <label htmlFor="file" className="file_label">
          Click on the image to add a profile photo
        </label>
        {file && (
          <button className="remove_photo" type="button" onClick={resetFile}>
            Remove Photo
          </button>
        )}
        <label htmlFor="bio">Bio:</label>
        <textarea
          className="text"
          name="bio"
          onChange={handleChange}
          value={formData.bio}
        />
        <label htmlFor="bio">Faculty:</label>
        <textarea
          className="text"
          name="faculty"
          onChange={handleChange}
          value={formData.faculty}
        />
        <input
          type="submit"
          className="submit"
          value={present ? "Submit" : "Skip for now"}
        />
      </form>
    </div>
  );
};

export default InformationForm;
