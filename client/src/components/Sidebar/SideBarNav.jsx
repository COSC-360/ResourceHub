import { NavLink } from "react-router-dom";

function SideBarNav() {
  return (
    <ul className="nav">
      <li>
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active-link" : "")}>
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/courses"
          end
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          My Courses
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/courses/add"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          All Courses
        </NavLink>
      </li>
    </ul>
  );
}

export default SideBarNav;