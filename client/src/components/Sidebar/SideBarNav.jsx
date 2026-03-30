import { Link, useLocation } from "react-router-dom";

function SideBarNav() {
  const location = useLocation();
  return (
    <ul className="nav">
      <li className={location.pathname === "/" ? "active" : ""}>
        <Link to="/">Home</Link>
      </li>

      <li className={location.pathname === "/course-discussions" ? "active" : ""}>
        <Link to="/course-discussions">Course Discussions</Link>
      </li>

      <li className={location.pathname === "/course-resources" ? "active" : ""}>
        <Link to="/course-resources">Course Resources</Link>
      </li>

      <li className={location.pathname === "/my-courses" ? "active" : ""}>
        {/* Formerly this is popular but we have changed the back end to be users courses so Im just changing the word */}
        <Link to="/my-courses">My Courses</Link>
      </li>

      <li className={location.pathname === "/start-discussion" ? "active" : ""}>
        <Link to="/start-discussion">Start Discussion</Link>
      </li>
    </ul>
  );
}

export default SideBarNav;