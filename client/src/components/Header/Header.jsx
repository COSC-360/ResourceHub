import { useContext } from "react";
import { SearchBar } from "../SearchBar/SearchBar"
import { ProfileSection } from "../ProfileSection/ProfileSection"
import { Logo } from "../Logo/Logo"
import "./Header.css"
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import AuthContext from "../../AuthContext.jsx";

/* userType undefined = unregistered
userType "user" = registered
userType "admin" = registered */
export function Header(){
    const { user } = useContext(AuthContext);

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
                    <ProfileSection userType={user ? "user" : undefined}/>
                </div>
            </div>
        </>
    )
}

export default Header;