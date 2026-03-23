import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./components/FeedPost";
import "./App.css";
import Header from "./components/Header/Header";
import CreateCourse from "./components/CreateCourse";
import CoursePage from "./components/CoursePage";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import NotFound from "./components/NotFoundPage/NotFound";

function MainLayout() {
  return (
    <div className="app-layout">
        <Header />
        <div className="body-layout">
          <Sidebar />
          <main className="main-content">
            <Outlet />
          </main>
        </div> 
        {/* Footer here if that ever gets added idk tbh */}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Feed />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
