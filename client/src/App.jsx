import { Routes, Route, Navigate } from "react-router-dom";
import "./components/FeedPost";
import "./App.css";
import Header from "./components/Header/Header";
import CreateCourse from "./components/CreateCourse";
import CoursePage from "./components/CoursePage";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import NotFound from "./components/NotFoundPage/NotFound";

function App() {
  return (
  <div className="header-area">
      <Header />
      <Routes>
        <Route path="/" element={<CreateCourse />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

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
