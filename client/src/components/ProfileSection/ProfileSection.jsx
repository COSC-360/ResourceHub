import "./ProfileSection.css";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../AuthContext";

export function ProfileSection({ userType }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setLoggedIn(token ? true : false);
  }, []);

  return (
    <>
      <div className="profileContainer">
        {userType === "admin" && (
          <a href="admin.jsx">
            <button className="adminPanel">Admin Panel</button>
          </a>
        )}
        {(userType === "admin" || userType === "user") && (
          <button className="profile">
            <img src="/src/assets/profile.svg" alt="profile" className="icon" />
          </button>
        )}
      </div>
      {!userType && !loggedIn && (
        <div className="authButtons">
          <button className="signIn" onClick={() => router("/auth")}>
            Sign In
          </button>
        </div>
      )}
      {loggedIn && (
        <div className="authButtons">
          <button className="signIn" onClick={() => logout()}>
            Log out
          </button>
        </div>
      )}
    </>
  );
}
