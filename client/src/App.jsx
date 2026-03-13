import "./components/FeedPost";
import "./App.css";
import Feed from "./components/Feed";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar";

function App() {
  return (
  <div className="header-area">
      <Header />

      <div className="sidebar-area">
        <Sidebar />
        <div className="feed-area">
          <Feed />
        </div>
      </div>
    </div>
  );
}

export default App;
