import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api-client";
import "./AdminDashboard.css";

export function AdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    let cancelled = false;

    apiClient("/api/user/admin/users?isAdmin=true", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        if (cancelled) return;
        setAdmins(Array.isArray(response?.data) ? response.data : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Could not load admin users.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <h2>Site administrators</h2>

      {loading && <p>Loading administrators...</p>}
      {!loading && error && <p>{error}</p>}

      {!loading && !error && admins.length === 0 && (
        <p>No administrators found.</p>
      )}

      {!loading && !error && admins.length > 0 && (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id || admin.email}>
                  <td>{admin.username || "Unknown user"}</td>
                  <td>{admin.email || "—"}</td>
                  <td>{admin.faculty || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;