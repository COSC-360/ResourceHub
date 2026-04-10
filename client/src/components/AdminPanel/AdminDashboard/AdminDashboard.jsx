import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/api-client";

export function AdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    let cancelled = false;

    apiClient("/api/user/admin/admins", {
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
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Site administrators</h2>

      {loading && <p>Loading administrators...</p>}
      {!loading && error && <p>{error}</p>}

      {!loading && !error && admins.length === 0 && (
        <p>No administrators found.</p>
      )}

      {!loading && !error && admins.length > 0 && (
        <ul>
          {admins.map((admin) => (
            <li key={admin._id || admin.email}>
              <strong>{admin.username || "Unknown user"}</strong>
              {admin.email ? ` (${admin.email})` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminDashboard;