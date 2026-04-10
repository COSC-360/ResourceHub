import { useContext, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AuthContext from "../../AuthContext.jsx";
import { apiClient } from "../../lib/api-client";
import defaultAvatar from "../../assets/profile.svg";
import "./ProfilePage.css";
import {
  courseDiscussionPath,
  LOGIN_ROUTE,
} from "../../constants/RouteConstants.jsx";

function token() {
  return localStorage.getItem("access_token");
}

function resolveCourseId(courseValue) {
  if (!courseValue) return "";
  if (typeof courseValue === "object") {
    return String(courseValue._id ?? courseValue.id ?? "");
  }
  return String(courseValue);
}

function courseCode(courseValue) {
  if (!courseValue) return "";
  if (typeof courseValue === "object" && courseValue.code) {
    return String(courseValue.code);
  }
  return "";
}

function previewText(text, max = 140) {
  if (!text || typeof text !== "string") return "";
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export function ProfilePage() {
  const { user: authUser } = useContext(AuthContext);
  const { userId: routeUserId } = useParams();
  const t = authUser?.access_token ?? token();
  const storedUserId = localStorage.getItem("userid");
  const effectiveUserId = routeUserId ?? storedUserId;
  const viewingOtherUser = Boolean(
    routeUserId && routeUserId !== storedUserId,
  );

  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState(null);
  const [fetchedForToken, setFetchedForToken] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    username: "",
    email: "",
    faculty: "",
    bio: "",
  });
  const [saveErr, setSaveErr] = useState(null);
  const [file, setFile] = useState(null);
  /** Per-user cache-bust token after a successful save (avoids syncing photo version in an effect). */
  const [photoBumpsByUserId, setPhotoBumpsByUserId] = useState({});
  const [activity, setActivity] = useState([]);
  const [activityErr, setActivityErr] = useState(null);
  /** Last `${token}:${effectiveUserId}` for which activity has been loaded. */
  const [activityReadyKey, setActivityReadyKey] = useState(null);
  const fileRef = useRef(null);

  const storagePhotoVersion =
    effectiveUserId === storedUserId
      ? (localStorage.getItem("profilePhotoVersion") ?? "")
      : "";
  const photoVersion =
    (effectiveUserId && photoBumpsByUserId[effectiveUserId]) ??
    storagePhotoVersion;

  const activityKey = t && effectiveUserId ? `${t}:${effectiveUserId}` : null;
  const activityLoading =
    Boolean(activityKey) && activityReadyKey !== activityKey;

  const resetFile = () => {
    if (file && fileRef.current) {
      fileRef.current = "";
    }
    setFile(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!selectedFile.type?.startsWith("image/")) {
      e.target.value = "";
      setSaveErr("Only image files are allowed.");
      setFile(null);
      return;
    }
    setSaveErr(null);
    setFile(selectedFile);
  };

  useEffect(() => {
    if (!t || !effectiveUserId) return;
    let cancelled = false;
    apiClient(`/api/user/getUserById/${effectiveUserId}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data);
          setErr(null);
          setFetchedForToken(`${t}:${effectiveUserId}`);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setErr(e.message || "Could not load profile");
          setFetchedForToken(`${t}:${effectiveUserId}`);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t, effectiveUserId]);

  useEffect(() => {
    if (!t || !effectiveUserId) return;
    let cancelled = false;
    const key = `${t}:${effectiveUserId}`;
    const params = new URLSearchParams({
      authorIds: effectiveUserId,
      limit: "200",
      sortBy: "updatedAt",
      sortOrder: "desc",
      populate: "courseId",
    });
    apiClient(`/api/discussion?${params}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((data) => {
        if (cancelled) return;
        setActivity(Array.isArray(data) ? data : []);
        setActivityErr(null);
        setActivityReadyKey(key);
      })
      .catch((e) => {
        if (cancelled) return;
        setActivityErr(e.message || "Could not load activity");
        setActivity([]);
        setActivityReadyKey(key);
      });
    return () => {
      cancelled = true;
    };
  }, [t, effectiveUserId]);

  const fetchKey = t && effectiveUserId ? `${t}:${effectiveUserId}` : null;
  const loading = Boolean(t) && fetchKey && fetchedForToken !== fetchKey;
  if (!t) {
    return (
      <div className="profile-page">
        <p>Sign in to view your profile.</p>
        <Link to={LOGIN_ROUTE}>Log in</Link>
      </div>
    );
  }
  if (loading) return <div className="profile-page">Loading…</div>;
  if (err)
    return (
      <div className="profile-page">
        <p className="profile-error">{err}</p>
      </div>
    );
  if (!profile) return <div className="profile-page">No profile.</div>;

  const startEdit = () => {
    const fac = profile.faculty;
    const facultyDraft =
      fac && fac !== "None" ? String(fac) : "";
    setDraft({
      username: profile.username ?? "",
      email: profile.email ?? "",
      faculty: facultyDraft,
      bio: profile.bio ?? "",
    });
    setSaveErr(null);
    setEditing(true);
  };

  const save = async () => {
    const username = draft.username.trim();
    const email = draft.email.trim();
    if (!username || !email) {
      setSaveErr("Username and email required.");
      return;
    }
    setSaveErr(null);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("faculty", draft.faculty.trim());
      formData.append("bio", draft.bio);
      if (file) formData.append("file", file);
      if (authUser?.admin && routeUserId) {
        formData.append("targetUserId", routeUserId);
      }
      const { data } = await apiClient("/api/user/updateProfile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}` },
        body: formData,
      });
      setProfile(data);
      const nextVersion = String(Date.now());
      if (effectiveUserId) {
        setPhotoBumpsByUserId((prev) => ({
          ...prev,
          [effectiveUserId]: nextVersion,
        }));
      }
      const isOwnProfile =
        !routeUserId || routeUserId === storedUserId;
      if (isOwnProfile) {
        localStorage.setItem("profilePhotoVersion", nextVersion);
        window.dispatchEvent(new Event("profile-photo-updated"));
      }
      setEditing(false);
    } catch (e) {
      setSaveErr(e.message || "Save failed");
    }
  };

  const profilePhotoSrc = effectiveUserId
    ? `http://localhost:3000/api/user/getProfilePhoto/${effectiveUserId}?v=${encodeURIComponent(photoVersion)}`
    : defaultAvatar;

  const yourDiscussions = activity.filter((d) => !d.parentId);
  const yourComments = activity.filter((d) => Boolean(d.parentId));

  return (
    <div className="profile-page">
      <h1>
        {viewingOtherUser
          ? `${profile.username ?? "User"}'s profile`
          : "Your profile"}
      </h1>

      <section className="profile-card">
        <div className="profile-photo-row">
          {/* Placeholder until image storage is decided */}
          <img
            className="profile-avatar"
            src={
              editing && file
                ? URL.createObjectURL(file)
                : profilePhotoSrc
            }
            alt=""
            width={96}
            height={96}
            onError={(e) => (e.target.src = defaultAvatar)}
          />
        </div>

        {editing ? (
          <div className="profile-form">
            <label htmlFor="file">Change profile photo:</label>
            <input
              type="file"
              name="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileRef}
            />
            {file && <button onClick={resetFile}>Remove photo</button>}
            <label>
              Username:
              <input
                value={draft.username}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, username: e.target.value }))
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
            </label>
            <label>
              Faculty:
              <input
                value={draft.faculty}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, faculty: e.target.value }))
                }
                placeholder="e.g. Engineering"
              />
            </label>
            <label>
              Bio:
              <textarea
                rows={3}
                value={draft.bio}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, bio: e.target.value }))
                }
              />
            </label>
          </div>
        ) : (
          <>
            <p>
              <strong>Username:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Faculty:</strong>{" "}
              {profile.faculty &&
              String(profile.faculty).trim() &&
              profile.faculty !== "None"
                ? profile.faculty
                : "—"}
            </p>
            <p>
              <strong>Bio:</strong> {profile.bio?.trim() || "—"}
            </p>
          </>
        )}
      </section>

      <div className="profile-actions">
        {saveErr && <p className="profile-error">{saveErr}</p>}
        {!editing ? (
          <button type="button" onClick={startEdit}>
            Edit profile
          </button>
        ) : (
          <>
            <button type="button" onClick={save}>
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        )}
      </div>

      <section className="profile-activity" aria-labelledby="profile-activity-heading">
        <h2 id="profile-activity-heading">
          {viewingOtherUser ? "Activity" : "Your activity"}
        </h2>
        {activityLoading && <p className="profile-activity-status">Loading activity…</p>}
        {activityErr && <p className="profile-error">{activityErr}</p>}
        {!activityLoading && !activityErr && (
          <>
            <h3 className="profile-activity-subheading">Discussions</h3>
            {yourDiscussions.length === 0 ? (
              <p className="profile-activity-empty">No discussions yet.</p>
            ) : (
              <ul className="profile-activity-list">
                {yourDiscussions.map((d) => {
                  const cid = resolveCourseId(d.courseId);
                  const code = courseCode(d.courseId);
                  const href = cid
                    ? courseDiscussionPath(cid, d._id)
                    : "#";
                  const title = d.title?.trim() || "(No title)";
                  return (
                    <li key={d._id} className="profile-activity-item">
                      <Link to={href} className="profile-activity-link">
                        {d.deleted ? (
                          <span className="profile-activity-title profile-activity-title--muted">
                            {title} <span className="profile-activity-badge">Deleted</span>
                          </span>
                        ) : (
                          <span className="profile-activity-title">{title}</span>
                        )}
                      </Link>
                      {code ? (
                        <span className="profile-activity-meta">{code}</span>
                      ) : null}
                      <span className="profile-activity-meta">
                        {d.updatedAt
                          ? new Date(d.updatedAt).toLocaleString()
                          : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <h3 className="profile-activity-subheading">Comments</h3>
            {yourComments.length === 0 ? (
              <p className="profile-activity-empty">No comments yet.</p>
            ) : (
              <ul className="profile-activity-list">
                {yourComments.map((d) => {
                  const cid = resolveCourseId(d.courseId);
                  const code = courseCode(d.courseId);
                  const href = cid
                    ? courseDiscussionPath(cid, d._id)
                    : "#";
                  return (
                    <li key={d._id} className="profile-activity-item">
                      <Link to={href} className="profile-activity-link">
                        {d.deleted ? (
                          <span className="profile-activity-preview profile-activity-preview--muted">
                            {previewText(d.content)}{" "}
                            <span className="profile-activity-badge">Deleted</span>
                          </span>
                        ) : (
                          <span className="profile-activity-preview">
                            {previewText(d.content)}
                          </span>
                        )}
                      </Link>
                      {code ? (
                        <span className="profile-activity-meta">{code}</span>
                      ) : null}
                      <span className="profile-activity-meta">
                        {d.updatedAt
                          ? new Date(d.updatedAt).toLocaleString()
                          : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default ProfilePage;
