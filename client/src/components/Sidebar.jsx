import { useState } from "react";
import SideBarNav from "./SideBarNav.jsx";
import SideBarFooter from "./SideBarFooter.jsx";

function SideBar() {
  const [active, setActive] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div
      className="sidebar"
      style={{ width: "260px", height: "100vh", backgroundColor: "#B646eb" }}
    >
      <h2 className="logo" style={{ color: "white" }}>
        Sidebar
      </h2>

      <SideBarNav active={active} setActive={setActive} />

      <SideBarFooter loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
    </div>
  );
}

export default SideBar;