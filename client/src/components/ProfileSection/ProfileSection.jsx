import "./ProfileSection.css"
import { Link } from "react-router-dom";

export function ProfileSection({userType}){
    return (
        <>
            <div className="profileContainer">
                {userType === "admin" && (
                    <Link to="/admin">
                        <button className="adminPanel">Admin Panel</button>
                    </Link>
                )}
                {(userType === "admin" || userType === "user") && (
                    <button className="profile"><img src="/src/assets/profile.svg" alt="profile" className="icon" /></button>
                )}
            </div>
            {!userType && (
                <div className="authButtons">
                    <Link to="/auth/login"><button className="signIn">Log In</button></Link>
                    <Link to="/auth/register"><button className="register">Register</button></Link>
                </div>
            )}
        </>
    )
}