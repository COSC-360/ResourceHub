import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../../lib/api-client";
import "../AdminDashboard/AdminDashboard.css";

export function ViewUsers() {
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    faculty: "",
    isAdmin: "both",
  });
  const [allUsers, setAllUsers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    let cancelled = false;

    apiClient("/api/user/admin/users", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        if (cancelled) return;
        setAllUsers(Array.isArray(response?.data) ? response.data : []);
        setLoaded(true);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Could not load users.");
        setLoaded(true);
      });

    return () => {
      cancelled = true;
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

      return true;
    });
  }, [allUsers, filters]);

  const loading = !loaded && !error;

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
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4}>No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id || user.email}>
                  <td>{user.username || "—"}</td>
                  <td>{user.email || "—"}</td>
                  <td>{user.faculty || "—"}</td>
                  <td>{user.isAdmin ? "Yes" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewUsers;