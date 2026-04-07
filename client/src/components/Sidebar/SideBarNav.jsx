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
          to="/course-discussions"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Course Discussions
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/course-resources"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Course Resources
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/my-courses"
          end
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          My Courses
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/my-courses/add"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          All Courses
        </NavLink>
      </li>

      <li>
        <NavLink
          to="/start-discussion"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Start Discussion
        </NavLink>
      </li>
    </ul>
  );
}

export default SideBarNav;