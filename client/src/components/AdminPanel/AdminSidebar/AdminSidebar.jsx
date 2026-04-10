import { useState } from "react";
import AdminSideBarNav from "./AdminSideBarNav";
import "./AdminSidebar.css";

function AdminSidebar() {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="sidebar">
      <AdminSideBarNav active={active} setActive={setActive} />
    </aside>
  );
}

export default AdminSidebar;
