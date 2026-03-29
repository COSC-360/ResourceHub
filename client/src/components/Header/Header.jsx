import { SearchBar } from "../SearchBar/SearchBar"
import { ProfileSection } from "../ProfileSection/ProfileSection"
import { Logo } from "../Logo/Logo"
import "./Header.css"

/* userType undefined = unregistered
userType "user" = registered
userType "admin" = registered */
export function Header({userType}){
    return (
        <>
            <div className="headerDiv">
                <div className="logoDiv">
                    <Logo />
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