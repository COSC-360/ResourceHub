import "./ProfileHeader.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../AuthContext.jsx";

export function ProfileHeader({ userType }) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userid = localStorage.getItem("userid");

  const menuItems = [
    { id: "profile", label: "Profile", onSelect: () => navigate("/profile") },
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

    return (
        <>
            <div className="profileContainer">
                {userType === "admin" && (
                    <Link to="/admin">
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
                            <img
                                src={`http://localhost:3000/api/user/getProfilePhoto/${userid}`}
                                alt="profile"
                                className="icon"
                                onError={(e) => (e.target.src = "/src/assets/profile.svg")}
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
                    <Link to="/login"><button className="signIn">Log In</button></Link>
                    <Link to="/register"><button className="register">Register</button></Link>
                </div>
            )}
          </div>
        )}
      </div>
      {!userType && (
        <div className="authButtons">
          <Link to="/auth/login">
            <button className="signIn">Log In</button>
          </Link>
          <Link to="/auth/register">
            <button className="register">Register</button>
          </Link>
        </div>
      )}
    </>
  );
}
