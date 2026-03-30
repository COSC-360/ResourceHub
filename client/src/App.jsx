import { Routes, Route, Outlet } from "react-router-dom";
import "./components/Feed/FeedPost.jsx";
import "./App.css";
import Header from "./components/Header/Header.jsx";
import SearchResults from "./components/SearchResults/SearchResults.jsx";
import CoursePage from "./components/CoursePage/CoursePage.jsx";
import Feed from "./pages/Feed/Feed.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import AuthPage from "./pages/AuthPage.jsx";
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
        <Route path="/search" element={<SearchResults />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
        <Route path="/create" element={<CreatePost />} />
      </Route>
      {/* not found page renders differently */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
