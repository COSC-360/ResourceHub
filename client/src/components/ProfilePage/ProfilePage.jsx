import { useContext, useEffect, useState } from "react";
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

  useEffect(() => {
    if (!t) return;
    let cancelled = false;
    apiClient("/api/user/getUserById", {
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
  }, [t]);

  const loading = Boolean(t) && fetchedForToken !== t;
  if (!t) {
    return (
      <div className="profile-page">
        <p>Sign in to view your profile.</p>
        <Link to="/login">Log in</Link>
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
      const { data } = await apiClient("/api/user/updateProfile", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${t}` },
        body: { username, email, bio: draft.bio },
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
            src={defaultAvatar}
            alt=""
            width={96}
            height={96}
          />
          {editing && (
            <span className="profile-photo-note">Photo upload — later</span>
          )}
        </div>

        {editing ? (
          <div className="profile-form">
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
