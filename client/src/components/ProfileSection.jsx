import "./css/ProfileSection.css"

export function ProfileSection({userType}){
    return (
        <>
            <div className="profileContainer">
                {userType === "admin" && (
                    <a href="admin.jsx">
                        <button className="adminPanel">Admin Panel</button>
                    </a>
                )}
                {(userType === "admin" || userType === "user") && (
                    <button className="profile"><img src="/src/assets/profile.svg" alt="profile" className="icon" /></button>
                )}
            </div>
            {!userType && (
                <div className="authButtons">
                    <button className="signIn">Sign In</button>
                    <button className="register">Register</button>
                </div>
            )}
        </>
    )
}