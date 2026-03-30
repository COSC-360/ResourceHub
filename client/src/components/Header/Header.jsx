import { SearchBar } from "../SearchBar/SearchBar"
import { ProfileSection } from "../ProfileSection/ProfileSection"
import { Logo } from "../Logo/Logo"
import "./Header.css"
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

/* userType undefined = unregistered
userType "user" = registered
userType "admin" = registered */
export function Header({userType}){
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
                    <ProfileSection userType={userType}/>
                </div>
            </div>
        </>
    )
}

export default Header;