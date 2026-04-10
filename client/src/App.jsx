import { useContext } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import "./components/Feed/FeedPost.jsx";
import "./App.css";
import Header from "./components/Header/Header.jsx";
import SearchResults from "./components/SearchResults/SearchResults.jsx";
import CoursePage from "./components/CoursePage/CoursePage.jsx";
import DiscussionPage from "./components/DiscussionPage/DiscussionPage.jsx";
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
import HybridFeed from "./components/HybridFeed/HybridFeed.jsx";
import AdminAnalytics from "./components/AdminPanel/AdminAnalytics/AdminAnalytics.jsx";
import {
  ADMIN_ANALYTICS_ROUTE,
  ADMIN_COURSES_ROUTE,
  ADMIN_ROUTE,
  ADMIN_USERS_ROUTE,
  COURSE_ADD_ROUTE,
  COURSE_CREATE_ROUTE,
  COURSE_DETAIL_ROUTE,
  COURSE_DISCUSSION_ROUTE,
  COURSE_UPDATE_ROUTE,
  CREATE_POST_ROUTE,
  HOMEROUTE,
  INFORMATION_ROUTE,
  LOGIN_ROUTE,
  NOT_FOUND_ROUTE,
  PROFILE_ROUTE,
  PROFILE_USER_ROUTE,
  REGISTER_ROUTE,
  SEARCH_ROUTE,
  COURSES_ROUTE,
} from "./constants/RouteConstants.jsx";

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
          <Route path={HOMEROUTE} element={<HybridFeed />} />
          <Route path={SEARCH_ROUTE} element={<SearchResults />} />
          <Route path={COURSE_DETAIL_ROUTE} element={<CoursePage />} />
          <Route path={COURSE_DISCUSSION_ROUTE} element={<DiscussionPage />} />
          <Route path={CREATE_POST_ROUTE} element={<CreatePost />} />
          <Route path={COURSES_ROUTE} element={<MyCoursesPage />} />
          <Route path={COURSE_ADD_ROUTE} element={<AddMyCoursePage />} />
          <Route path={LOGIN_ROUTE} element={<LoginForm />} />
          <Route path={REGISTER_ROUTE} element={<SignupForm />} />
          <Route path={INFORMATION_ROUTE} element={<InformationForm />} />
          <Route path={PROFILE_ROUTE} element={<ProfilePage />} />
          <Route
            path={PROFILE_USER_ROUTE}
            element={
              <AdminRoute>
                <ProfilePage />
              </AdminRoute>
            }
          />
        </Route>

        <Route
          path={ADMIN_ROUTE}
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path={ADMIN_USERS_ROUTE} element={<ViewUsers />} />
          <Route path={ADMIN_COURSES_ROUTE} element={<ViewCourses />} />
          <Route path={ADMIN_ANALYTICS_ROUTE} element={<AdminAnalytics />} />
        </Route>

        <Route path={COURSE_CREATE_ROUTE} element={<CreateCourse />} />
        <Route
          path={COURSE_UPDATE_ROUTE}
          element={
            <AdminRoute>
              <UpdateCourseInfo />
            </AdminRoute>
          }
        />
        <Route path={NOT_FOUND_ROUTE} element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
