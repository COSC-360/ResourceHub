import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../AuthContext.jsx";
import { apiClient } from "../../lib/api-client";
import defaultAvatar from "../../assets/profile.svg";
import "./ProfilePage.css";

function token() {
  return localStorage.getItem("access_token");
}

export function ProfilePage() {
  const { user } = useContext(AuthContext);
  const t = user?.access_token ?? token();

  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState(null);
  const [fetchedForToken, setFetchedForToken] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ username: "", email: "", bio: "" });
  const [saveErr, setSaveErr] = useState(null);
  const [file, setFile] = useState(null);
  const userid = localStorage.getItem("userid");
  const fileRef = useRef(null);

  const resetFile = () => {
    if (file && fileRef.current) {
      fileRef.current = "";
    }
    setFile(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    if (!t) return;
    let cancelled = false;
    apiClient(`/api/user/getUserById/${userid}`, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data);
          setErr(null);
          setFetchedForToken(t);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setErr(e.message || "Could not load profile");
          setFetchedForToken(t);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [t, userid]);

  const loading = Boolean(t) && fetchedForToken !== t;
  if (!t) {
    return (
      <div className="profile-page">
        <p>Sign in to view your profile.</p>
        <Link to="/auth/login">Log in</Link>
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
    setDraft({
      username: profile.username ?? "",
      email: profile.email ?? "",
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
      formData.append("bio", draft.bio);
      formData.append("file", file);
      const { data } = await apiClient("/api/user/updateProfile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}` },
        body: formData,
      });
      setProfile(data);
      setEditing(false);
    } catch (e) {
      setSaveErr(e.message || "Save failed");
    }
  };

  return (
    <div className="profile-page">
      <h1>Your profile</h1>

      <section className="profile-card">
        <div className="profile-photo-row">
          {/* Placeholder until image storage is decided */}
          <img
            className="profile-avatar"
            src={
              editing && file
                ? URL.createObjectURL(file)
                : `http://localhost:3000/api/user/getProfilePhoto/${userid}`
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
    </div>
  );
}

export default ProfilePage;
