import { NavLink } from "react-router-dom";
import {
  COURSE_ADD_ROUTE,
  COURSES_ROUTE,
  HOMEROUTE,
} from "../../constants/RouteConstants.jsx";

function SideBarNav() {
  return (
    <ul className="nav">
      <li>
        <NavLink to={HOMEROUTE} end className={({ isActive }) => (isActive ? "active-link" : "")}>
          Home
        </NavLink>
      </li>

      <li>
        <NavLink
          to={COURSES_ROUTE}
          end
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          My Courses
        </NavLink>
      </li>

      <li>
        <NavLink
          to={COURSE_ADD_ROUTE}
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          All Courses
        </NavLink>
      </li>
    </ul>
  );
}

export default SideBarNav;