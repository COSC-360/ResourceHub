function SideBarFooter({ loggedIn, setLoggedIn }) {
  return (
    <div
      className="sidebar-footer"
      style={{
        width: "260px",
        height: "10%",
        borderColor: "black",
        borderWidth: "2px",
      }}
    >
      {loggedIn ? (
        <button className="logout-btn" onClick={() => setLoggedIn(false)}>
          Logout
        </button>
      ) : (
        <button className="login-btn" onClick={() => setLoggedIn(true)}>
          Login
        </button>
      )}
    </div>
  );
}

export default SideBarFooter;