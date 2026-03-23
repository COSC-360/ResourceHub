import { Routes, Route, Navigate } from "react-router-dom";
import "./components/FeedPost";
import "./App.css";
import Header from "./components/Header/Header";
import CreateCourse from "./components/CreateCourse";
import CoursePage from "./components/CoursePage";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="header-area">
      <Header />
      <div className="sidebar-area">
        <Sidebar />
        <div className="feed-area">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/create-course" element={<CreateCourse />} />
            <Route path="/courses/:courseId" element={<CoursePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
