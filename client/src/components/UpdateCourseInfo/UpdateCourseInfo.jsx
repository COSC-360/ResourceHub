import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import "./UpdateCourseInfo.css";

const trim = (v) => (typeof v === "string" ? v.trim() : "");

export default function UpdateCourseInfo() {
    const navigate = useNavigate();
    const { courseId } = useParams(); // matches route: /courses/:courseId/update

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [initial, setInitial] = useState({
        name: "",
        code: "",
        description: "",
    });

    const [form, setForm] = useState({
        name: "",
        code: "",
        description: "",
    });

    useEffect(() => {
        let active = true;

        async function loadCourse() {
            if (!courseId) {
                setError("Missing course id.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                // same pattern as CoursePage.jsx
                const payload = await apiClient(`/api/courses/${courseId}`, {
                    method: "GET",
                });

                const course = payload?.data; // controller returns { data: course }

                const next = {
                    name: course?.name ?? "",
                    code: course?.code ?? "",
                    description: course?.description ?? "",
                };

                if (!active) return;
                setInitial(next);
                setForm(next); // prefill inputs
            } catch (err) {
                if (!active) return;
                setError(err.message || "Failed to load course.");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadCourse();
        return () => {
            active = false;
        };
    }, [courseId]);

    const hasChanges = useMemo(() => {
        return (
            trim(form.name) !== trim(initial.name) ||
            trim(form.code) !== trim(initial.code) ||
            trim(form.description) !== trim(initial.description)
        );
    }, [form, initial]);

    function onChange(e) {
        const { name, value } = e.target;
        setError("");
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();

        if (!courseId) {
            setError("Missing course id.");
            return;
        }

        const cleaned = {
            name: trim(form.name),
            code: trim(form.code),
            description: trim(form.description),
        };

        if (!cleaned.name) {
            setError("Course name is required.");
            return;
        }
        if (!cleaned.code) {
            setError("Course code is required.");
            return;
        }

        const updates = {};
        if (cleaned.name !== trim(initial.name)) updates.name = cleaned.name;
        if (cleaned.code !== trim(initial.code)) updates.code = cleaned.code;
        if (cleaned.description !== trim(initial.description)) {
            updates.description = cleaned.description;
        }

        if (Object.keys(updates).length === 0) {
            setError("No changes to save.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await apiClient(`/api/courses/${courseId}/update`, {
                method: "PATCH",
                body: updates,
            });

            navigate(`/courses/${courseId}`, { replace: true });
        } catch (err) {
            setError(err.message || "Failed to update course.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="update-course-page">
                <div className="update-course-card">
                    <h1 className="update-course-title">Update Course Info</h1>
                    <p>Loading course details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="update-course-page">
            <div className="update-course-card">
                <h1 className="update-course-title">Update Course Info</h1>

                <form className="update-course-form" onSubmit={onSubmit}>
                    <label className="update-course-label" htmlFor="name">
                        Course Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        className="update-course-input"
                        type="text"
                        value={form.name}
                        onChange={onChange}
                        placeholder="e.g. Software Engineering"
                        required
                    />

                    <label className="update-course-label" htmlFor="code">
                        Course Code
                    </label>
                    <input
                        id="code"
                        name="code"
                        className="update-course-input"
                        type="text"
                        value={form.code}
                        onChange={onChange}
                        placeholder="e.g. COSC499"
                        required
                    />

                    <label className="update-course-label" htmlFor="description">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        className="update-course-textarea"
                        rows={5}
                        value={form.description}
                        onChange={onChange}
                        placeholder="Optional course description"
                    />

                    {error ? <p className="update-course-error">{error}</p> : null}

                    <div className="update-course-actions">
                        <button
                            type="button"
                            className="update-course-btn update-course-btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="update-course-btn update-course-btn-primary"
                            disabled={saving || !hasChanges}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
