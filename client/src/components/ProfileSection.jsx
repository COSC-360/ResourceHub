export function ProfileSection({userType}){
    return (
        <>
            {userType === "admin" && (
                <>
                    <a href="admin.jsx">
                        <button>Admin Panel</button>
                    </a>
                </> 
            )}
            {(userType === "admin" || userType === "user") && (
                <>
                    <button>Avatar Placeholder</button>
                </>
            )}
            {!userType && (
                <>
                    <button>Sign In</button>
                    <button>Register</button>
                </>
            )}
        </>
    )
}