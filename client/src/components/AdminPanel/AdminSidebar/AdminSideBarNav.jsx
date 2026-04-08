import { NavLink } from "react-router-dom";

function AdminSideBarNav() {
  return (
    <ul className="nav">
      <li>
        <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active-link" : "")}>
          Admin Dashboard
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/admin/users"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          View Users
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/admin/courses"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          All Courses
        </NavLink>
      </li>
    </ul>
  );
}

export default AdminSideBarNav;
