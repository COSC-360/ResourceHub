import { useState } from "react";
import SideBarNav from "./SideBarNav";
import "./css/Sidebar.css";

function SideBar() {
  const [active, setActive] = useState("home");

  return (
    <aside className="sidebar">

      <SideBarNav active={active} setActive={setActive} />

      {/* <SideBarFooter loggedIn={loggedIn} setLoggedIn={setLoggedIn} /> */}
      {/* If we would like to add a footer it is set up but I now see we have login function in the header */}
    </aside>
  );
}

export default SideBar;