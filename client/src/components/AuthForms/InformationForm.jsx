import { useState, useRef, useEffect } from "react";
import "./AuthForms.css";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { HOMEROUTE, REGISTER_ROUTE } from "../../constants/RouteConstants.jsx";
import { validateProfileTextFields } from "../../lib/formValidation.js";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";
import {
  CUSTOM_FACULTY_VALUE,
  FACULTY_OPTIONS,
  facultyValueFromSelection,
} from "../../lib/facultyOptions.js";

const InformationForm = () => {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ bio: "" });
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [customFaculty, setCustomFaculty] = useState("");
  const [error, setError] = useState(null);
  const facultyValue = facultyValueFromSelection(selectedFaculty, customFaculty);
  const present = file || formData.bio.trim() || facultyValue;
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

  const handleFacultySelect = (e) => {
    setError(null);
    setSelectedFaculty(e.target.value);
  };

  const handleCustomFacultyChange = (e) => {
    setError(null);
    setCustomFaculty(e.target.value);
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
    const textErr = validateProfileTextFields(facultyValue, formData.bio);
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
        data.append("faculty", facultyValue);
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
          <ProfileAvatar file={file} fit="contain" className="avatar_preview" />
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
            <select
              className="information-form__textarea information-form__textarea--short"
              id="faculty"
              name="faculty"
              onChange={handleFacultySelect}
              value={selectedFaculty}
            >
              <option value="">Select your faculty</option>
              {FACULTY_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
              <option value={CUSTOM_FACULTY_VALUE}>Custom</option>
            </select>

            {selectedFaculty === CUSTOM_FACULTY_VALUE && (
              <>
                <label htmlFor="faculty-custom">Custom faculty</label>
                <input
                  className="information-form__textarea information-form__textarea--short"
                  id="faculty-custom"
                  name="facultyCustom"
                  onChange={handleCustomFacultyChange}
                  value={customFaculty}
                  maxLength={200}
                  placeholder="Enter your faculty"
                />
              </>
            )}
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
