import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/api-client";
import "../AdminDashboard/AdminDashboard.css";
import "./ViewUsers.css";

export function ViewUsers() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    faculty: "",
    isAdmin: "both",
    enabled: "enabled",
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [toggleInFlightByUser, setToggleInFlightByUser] = useState({});
  const [pendingToggle, setPendingToggle] = useState(null);

  const loadUsers = async (cancelledRef) => {
    const accessToken = localStorage.getItem("access_token");
    const response = await apiClient("/api/user/admin/users", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (cancelledRef?.current) return;
    setAllUsers(Array.isArray(response?.data) ? response.data : []);
    setLoaded(true);
    setError(null);
  };

  useEffect(() => {
    const cancelledRef = { current: false };

    loadUsers(cancelledRef).catch((err) => {
      if (cancelledRef.current) return;
      setError(err.message || "Could not load users.");
      setLoaded(true);
    });

    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const handleFilterChange = (field) => (event) => {
    setFilters((current) => ({ ...current, [field]: event.target.value }));
  };

  const filteredUsers = useMemo(() => {
    const nameQuery = filters.name.trim().toLowerCase();
    const emailQuery = filters.email.trim().toLowerCase();
    const facultyQuery = filters.faculty.trim().toLowerCase();

    return allUsers.filter((user) => {
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const faculty = String(user.faculty || "").toLowerCase();

      if (nameQuery && !username.includes(nameQuery)) return false;
      if (emailQuery && !email.includes(emailQuery)) return false;
      if (facultyQuery && !faculty.includes(facultyQuery)) return false;
      if (filters.isAdmin === "true" && !user.isAdmin) return false;
      if (filters.isAdmin === "false" && user.isAdmin) return false;
      if (filters.enabled === "enabled" && !(user.enabled ?? true)) return false;
      if (filters.enabled === "disabled" && (user.enabled ?? true)) return false;

      return true;
    });
  }, [allUsers, filters]);

  const loading = !loaded && !error;

  const handleToggleEnabled = (userId, username, nextEnabled) => {
    setPendingToggle({
      userId,
      username: username || "Unknown",
      nextEnabled,
    });
  };

  const confirmToggleEnabled = async () => {
    if (!pendingToggle) return;

    const { userId, nextEnabled } = pendingToggle;
    const accessToken = localStorage.getItem("access_token");
    if (!userId || !accessToken) return;

    setToggleInFlightByUser((current) => ({ ...current, [userId]: true }));
    try {
      const response = await apiClient(`/api/user/admin/users/${userId}/enabled`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { enabled: nextEnabled },
      });

      const updatedUser = response?.data;
      if (!updatedUser) return;

      setAllUsers((current) =>
        current.map((user) => (user._id === userId ? updatedUser : user)),
      );
    } catch (err) {
      setError(err.message || "Could not update user state.");
    } finally {
      setToggleInFlightByUser((current) => ({ ...current, [userId]: false }));
      setPendingToggle(null);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>View Users</h1>

      {loading && <p>Loading users...</p>}
      {!loading && error && <p>{error}</p>}

      {!error && loaded && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Faculty</th>
              <th>Admin</th>
              <th>Enabled</th>
            </tr>
            <tr>
              <th>
                <input
                  type="text"
                  value={filters.name}
                  onChange={handleFilterChange("name")}
                  placeholder="Filter username"
                />
              </th>
              <th>
                <input
                  type="text"
                  value={filters.email}
                  onChange={handleFilterChange("email")}
                  placeholder="Filter email"
                />
              </th>
              <th>
                <input
                  type="text"
                  value={filters.faculty}
                  onChange={handleFilterChange("faculty")}
                  placeholder="Filter faculty"
                />
              </th>
              <th>
                <select
                  value={filters.isAdmin}
                  onChange={handleFilterChange("isAdmin")}
                >
                  <option value="both">Both</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </th>
              <th>
                <select
                  value={filters.enabled}
                  onChange={handleFilterChange("enabled")}
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                  <option value="both">Both</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user._id || user.email}
                  className="admin-table-row-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const id = user._id ?? user.id;
                    if (id) navigate(`/profile/${id}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const id = user._id ?? user.id;
                      if (id) navigate(`/profile/${id}`);
                    }
                  }}
                >
                  <td>{user.username || "—"}</td>
                  <td>{user.email || "—"}</td>
                  <td>{user.faculty || "—"}</td>
                  <td>{user.isAdmin ? "Yes" : "No"}</td>
                  <td>
                    {(() => {
                      const isEnabled = user.enabled ?? true;
                      const buttonClass = isEnabled
                        ? "user-toggle-btn user-toggle-btn-disable"
                        : "user-toggle-btn user-toggle-btn-enable";
                      return (
                    <button
                      className={buttonClass}
                      type="button"
                      disabled={Boolean(toggleInFlightByUser[user._id])}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEnabled(user._id, user.username, !isEnabled);
                      }}
                    >
                      {isEnabled ? "Disable" : "Enable"}
                    </button>
                      );
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {pendingToggle && (
        <div className="confirm-dialog-overlay" role="dialog" aria-modal="true">
          <div className="confirm-dialog-card">
            <p>
              Are you sure you want to {pendingToggle.nextEnabled ? "enable" : "disable"} user{" "}
              {pendingToggle.username}?
            </p>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="confirm-dialog-cancel"
                onClick={() => setPendingToggle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-dialog-confirm"
                onClick={confirmToggleEnabled}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewUsers;