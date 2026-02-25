import { useState } from 'react'

function SideBar() {
    const [active, setActive] = useState("home")
    const [loggedIn, setLoggedIn] = useState(false)

    return(
      <>
       <div className="sidebar" style={{ width: "260px", height: "100vh", backgroundColor: "#B646eb"}}>
      <h2 className="logo" style={{ color: "white"}}>Sidebar</h2>
      <ul className="nav">
        <li style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
          className={active === "home" ? "active" : ""}
          onClick={() => setActive("home")}>
          Home
        </li>
        <li style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }} 
          className={active === "courseDiscussions" ? "active" : ""}
          onClick={() => setActive("courseDiscussions")} >
          Course Discussions
        </li>
        <li style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
          className={active === "courseResources" ? "active" : ""}
          onClick={() => setActive("courseResources")} >
          Course Resources
        </li>
        <li style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
          className={active === "popular" ? "active" : ""}
          onClick={() => setActive("popular")} >
          Popular
        </li>
        <li style={{ cursor: "pointer", pointerEvents: "auto", userSelect: "none" }}
          className={active === "startDiscussion" ? "active" : ""}
          onClick={() => setActive("startDiscussion")} >
          Start Discussion
        </li>
      </ul>
      <div className="sidebar-footer" style={{ width: "260px", height: "10%", borderColor: "black", borderWidth:"2px"}}>
        {loggedIn ? (<button className="logout-btn" onClick={() => setLoggedIn(false)}>
            Logout
          </button>
        ) : ( <button className="login-btn" onClick={() => setLoggedIn(true)} >
            Login
          </button>
        )}
      </div>
    </div>
    </>  
    )
}

export default SideBar;

//sidebar should be one component, footer and nav should be separate components that we import.