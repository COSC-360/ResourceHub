import "./ProfileHeader.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../AuthContext.jsx";
import {
  ADMIN_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  REGISTER_ROUTE,
} from "../../constants/RouteConstants.jsx";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";

export function ProfileHeader({ userType }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(
    () => localStorage.getItem("profilePhotoVersion") ?? "",
  );
  const menuRef = useRef(null);
  const userid = localStorage.getItem("userid");

  const menuItems = [
    { id: "profile", label: "Profile", onSelect: () => navigate(PROFILE_ROUTE) },
    { id: "logout", label: "Logout", onSelect: () => logout() },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const syncPhotoVersion = () => {
      setPhotoVersion(localStorage.getItem("profilePhotoVersion") ?? "");
    };

    window.addEventListener("profile-photo-updated", syncPhotoVersion);
    window.addEventListener("storage", syncPhotoVersion);

    return () => {
      window.removeEventListener("profile-photo-updated", syncPhotoVersion);
      window.removeEventListener("storage", syncPhotoVersion);
    };
  }, []);

  return (
    <>
      <div className="profileContainer">
        {userType === "admin" && (
          <Link to={ADMIN_ROUTE}>
            <button className="adminPanel">Admin Panel</button>
          </Link>
        )}
        {(userType === "admin" || userType === "user") && (
          <div className="profileMenuWrapper" ref={menuRef}>
            <button
              type="button"
              className="profile"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-controls="profile-dropdown-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              <ProfileAvatar
                userId={userid}
                version={photoVersion}
                alt="profile"
                className="icon"
              />
            </button>
            {menuOpen && (
              <div
                id="profile-dropdown-menu"
                className="profileMenu"
                role="menu"
              >
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="profileMenuItem"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      item.onSelect();
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {!userType && (
        <div className="authButtons">
          <Link to={LOGIN_ROUTE}>
            <button className="signIn">Log In</button>
          </Link>
          <Link to={REGISTER_ROUTE}>
            <button className="register">Register</button>
          </Link>
        </div>
      )}
    </>
  );
}
