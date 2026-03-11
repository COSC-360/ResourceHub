import { useState } from "react";
import SideBarNav from "./SideBarNav";
import SideBarFooter from "./SideBarFooter";
import "./css/Sidebar.css";

function SideBar() {
  const [active, setActive] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <aside className="sidebar">

      <SideBarNav active={active} setActive={setActive} />

      {/* <SideBarFooter loggedIn={loggedIn} setLoggedIn={setLoggedIn} /> */}
      {/* If we would like to add a footer it is set up but I now see we have login function in the header */}
    </aside>
  );
}

export default SideBar;