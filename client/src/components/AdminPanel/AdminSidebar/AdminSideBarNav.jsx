import { NavLink } from "react-router-dom";
import {
  ADMIN_ANALYTICS_ROUTE,
  ADMIN_COURSES_ROUTE,
  ADMIN_ROUTE,
  ADMIN_USERS_ROUTE,
} from "../../../constants/RouteConstants.jsx";

function AdminSideBarNav() {
  return (
    <ul className="nav">
      <li>
        <NavLink to={ADMIN_ROUTE} end className={({ isActive }) => (isActive ? "active-link" : "")}>
          Admin Dashboard
        </NavLink>
      </li>

      <li>
        <NavLink
          to={ADMIN_USERS_ROUTE}
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          View Users
        </NavLink>
      </li>

      <li>
        <NavLink
          to={ADMIN_COURSES_ROUTE}
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          All Courses
        </NavLink>
      </li>

      <li>
        <NavLink
          to={ADMIN_ANALYTICS_ROUTE}
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Analytics
        </NavLink>
      </li>
    </ul>
  );
}

export default AdminSideBarNav;
