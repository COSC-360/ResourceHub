import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./components/FeedPost";
import "./App.css";
import Header from "./components/Header/Header";
import CreateCourse from "./components/CreateCourse";
import SearchResults from "./components/SearchResults/SearchResults";
import CoursePage from "./components/CoursePage";
import Feed from "./components/Feed";
import Sidebar from "./components/Sidebar";
import NotFound from "./components/NotFoundPage/NotFound";

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
        <Route path="/search" element={<SearchResults />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
      </Route>
      
      {/* not found page renders differently */}
      <Route path="*" element={<NotFound />} /> 
    </Routes>
  );
}

export default App;
