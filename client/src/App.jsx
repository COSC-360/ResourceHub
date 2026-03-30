import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./components/FeedPost.jsx";
import "./App.css";
import Header from "./components/Header/Header.jsx";
import CreateCourse from "./components/CreateCourse.jsx";
import CoursePage from "./components/CoursePage.jsx";
import Feed from "./pages/Feed.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Authpage from "./pages/AuthPage.jsx";
import NotFound from "./components/NotFoundPage/NotFound.jsx";
import CreatePost from "./pages/CreatePost.jsx";

// Main layout component that includes the header and sidebar,
// and an Outlet for rendering the main content based on the route
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
      {/* Main layout route, routes inside get rendered within the Outlet in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Feed />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
        <Route path="/create" element={<CreatePost />} />
      </Route>
      {/* not found page renders differently */}
      <Route path="/auth" element={<Authpage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
