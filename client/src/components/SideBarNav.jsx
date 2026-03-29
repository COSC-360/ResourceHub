function SideBarNav({ active, setActive }) {
  return (
    <ul className="nav">
      <li
        style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
        className={active === "home" ? "active" : ""}
        onClick={() => setActive("home")}
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
    </ul>
  );
}

export default SideBarNav;