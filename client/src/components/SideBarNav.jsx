import { useNavigate } from "react-router-dom";
import Button from "./Button";

function SideBarNav({ active, setActive }) {
  const navigate = useNavigate();

  function handleHomeClick() {
    setActive("home");
    navigate("/");
  }

  function handleCreateCourseClick() {
    setActive("createCourse");
    navigate("/create-course");
  }

  return (
    <ul className="nav">
      <li
        style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
        className={active === "home" ? "active" : ""}
        onClick={handleHomeClick}
      >
        Home
      </li>

      <li
        style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
        className={active === "courseDiscussions" ? "active" : ""}
        onClick={() => setActive("courseDiscussions")}
      >
        Course Discussions
      </li>

      <li
        style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
        className={active === "courseResources" ? "active" : ""}
        onClick={() => setActive("courseResources")}
      >
        Course Resources
      </li>

      <li
        style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
        className={active === "popular" ? "active" : ""}
        onClick={() => setActive("popular")}
      >
        {/* Formerly this is popular but we have changed the back end to be users courses so Im just changing the word */}
        My Courses
      </li>

      <li
        style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
        className={active === "startDiscussion" ? "active" : ""}
        onClick={() => setActive("startDiscussion")}
      >
        Start Discussion
      </li>

      {/* Create Course Button, brings up CreateCourse.jsx */}
      <li>
        <Button
          active={active === "createCourse"}
          onClick={handleCreateCourseClick}
        >
          Create Course
        </Button>
      </li>
    </ul>
  );
}

export default SideBarNav;