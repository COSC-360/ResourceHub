import { useContext } from "react";
import { SearchBar } from "../SearchBar/SearchBar"
import { ProfileHeader } from "../ProfileHeader/ProfileHeader"
import { Logo } from "../Logo/Logo"
import { useEffect, useState } from "react";
import "./Header.css"
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import AuthContext from "../../AuthContext.jsx";
import Notifications from "../Notifications/Notifications";

/* userType undefined = unregistered
userType "user" = registered
userType "admin" = registered */
export function Header(){
    const { user } = useContext(AuthContext);
    const admin = user?.admin;

    return (
        <>
            <div className="headerDiv">
                <div className="combinedDiv">
                <div className="logoDiv">
                    <Logo />
                </div>
                    <Breadcrumbs />
                </div>
                <div className="searchBarDiv">
                    <SearchBar />
                </div>
                 <div className="buttonDiv">
                    <div className="headerRightSection">
                        <Notifications />
                        <ProfileHeader
                            userType={admin ? "admin" : user ? "user" : undefined}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header;