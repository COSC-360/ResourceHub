import { SearchBar } from "./SearchBar"
import { ProfileSection } from "./ProfileSection"
import { Logo } from "./Logo"

/* userType undefined = unregistered
userType "user" = registered
userType "admin" = registered */
export function Header({userType}){
    return (
        <>
            <div style={{ backgroundColor: '#b646eb', width: '100%', height: '80px', borderRadius: '10px', display: 'flex', position: 'relative'}}>
                <div style={{alignItems: 'center', width: '20%', display: 'flex'}}>
                    <Logo />
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <SearchBar />
                </div>
                <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', paddingRight: '20px'}}>
                    <ProfileSection userType={userType}/>
                </div>
            </div>
        </>
    )
}