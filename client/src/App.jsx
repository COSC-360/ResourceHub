import { useContext } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import "./components/Feed/FeedPost.jsx";
import "./App.css";
import Header from "./components/Header/Header.jsx";
import SearchResults from "./components/SearchResults/SearchResults.jsx";
import CoursePage from "./components/CoursePage/CoursePage.jsx";
import Feed from "./pages/Feed.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import AdminSidebar from "./components/AdminPanel/AdminSidebar/AdminSidebar.jsx";
import LoginForm from "./components/AuthForms/LoginForm.jsx";
import SignupForm from "./components/AuthForms/SignupForm.jsx";
import InformationForm from "./components/AuthForms/InformationForm.jsx";
import NotFound from "./components/NotFoundPage/NotFound.jsx";
import MyCoursesPage from "./components/MyCoursesPage/MyCoursesPage.jsx";
import AddMyCoursePage from "./components/AddMyCoursePage/AddMyCourse.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import ProfilePage from "./components/ProfilePage/ProfilePage.jsx";
import AdminDashboard from "./components/AdminPanel//AdminDashboard/AdminDashboard.jsx";
import CreateCourse from "./components/CreateCourse/CreateCourse.jsx";
import UpdateCourseInfo from "./components/UpdateCourseInfo/UpdateCourseInfo.jsx";
import NotAuthorized from "./components/NotAuthorized/NotAuthorized.jsx";
import AuthContext from "./AuthContext.jsx";
import GlobalApiError from "./components/GlobalApiError/GlobalApiError";
import ViewUsers from "./components/AdminPanel/ViewUsers/ViewUsers.jsx";
import ViewCourses from "./components/AdminPanel/ViewCourses/ViewCourses.jsx";

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

function AdminLayout() {
  return (
    <div className="app-layout">
      <Header />
      <div className="body-layout">
        <AdminSidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      {/* Footer here if that ever gets added idk tbh */}
    </div>
  );
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const admin = user?.admin;

  return admin ? children : <NotAuthorized />;
}

function App() {
  return (
    <>
      <GlobalApiError />
      <Routes>
        {/* Main layout route, routes inside get rendered within the Outlet in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Feed />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/courses/:courseId" element={<CoursePage />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/my-courses/add" element={<AddMyCoursePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<SignupForm />} />
          <Route path="/information" element={<InformationForm />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* redirect /courses to home */}
          <Route path="/courses" element={<Navigate to="/" replace />} />
        </Route>

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ViewUsers />} />
          <Route path="/admin/courses" element={<ViewCourses />} />
        </Route>

        <Route path="/courses/create" element={<CreateCourse />} />
        <Route
          path="/courses/:courseId/update"
          element={
            <AdminRoute>
              <UpdateCourseInfo />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
