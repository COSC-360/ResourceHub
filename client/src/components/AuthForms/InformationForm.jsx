import { useState, useRef, useEffect } from "react";
import "./AuthForms.css";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { HOMEROUTE, REGISTER_ROUTE } from "../../constants/RouteConstants.jsx";
import { validateProfileTextFields } from "../../lib/formValidation.js";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";

const InformationForm = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ bio: "", faculty: "" });
  const [error, setError] = useState(null);
  const present = file || formData.bio.trim() || formData.faculty.trim();
  const fileCurrentRef = useRef(null);

  const router = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(null);
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
    setError(null);
    if (!present) {
      router(HOMEROUTE);
      return;
    }
    const textErr = validateProfileTextFields(formData.faculty, formData.bio);
    if (textErr) {
      setError(textErr);
      return;
    }
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router(REGISTER_ROUTE);
          return;
        }
        const data = new FormData();
        data.append("bio", formData.bio);
        if (file) data.append("file", file);
        data.append("faculty", formData.faculty);
        await apiClient("/api/user/updateProfile", {
          method: "PATCH",
          body: data,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.removeItem("first_time");
        router(HOMEROUTE);
      } catch (err) {
        setError(
          err instanceof Error && err.message
            ? err.message
            : "Could not save your profile.",
        );
      }
    })();
  };

  useEffect(() => {
    const status = localStorage.getItem("first_time");
    if (!status) router(HOMEROUTE);
  }, [formData, file, router]);

  return (
    <div className="auth-form-page">
      <form className="auth-form-card information-form" onSubmit={handleSubmit}>
        {error ? (
          <p className="auth-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="avatar_wrapper">
          <ProfileAvatar file={file} className="avatar_preview" />
          <input
            type="file"
            className="file_upload"
            name="file"
            accept="image/*"
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

        <section
          className="information-form__text-section"
          aria-labelledby="information-form-text-heading"
        >
          <h2 className="information-form__section-title" id="information-form-text-heading">
            Profile details
          </h2>

          <div className="information-form__field">
            <label htmlFor="bio">Bio</label>
            <textarea
              className="information-form__textarea"
              id="bio"
              name="bio"
              onChange={handleChange}
              value={formData.bio}
              maxLength={2000}
              rows={4}
              placeholder="A few words about you, your interests, or how you use ResourceHub…"
            />
          </div>

          <div className="information-form__field">
            <label htmlFor="faculty">Faculty</label>
            <textarea
              className="information-form__textarea information-form__textarea--short"
              id="faculty"
              name="faculty"
              onChange={handleChange}
              value={formData.faculty}
              maxLength={200}
              rows={2}
              placeholder="e.g. Computer Science, Engineering…"
            />
          </div>
        </section>
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
