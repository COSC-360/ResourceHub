import { Routes, Route, Navigate } from "react-router-dom";
import "./components/FeedPost";
import "./App.css";
import Header from "./components/Header";
import CreateCourse from "./components/CreateCourse";
import CoursePage from "./components/CoursePage";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<CreateCourse />} />
        <Route path="/courses/:courseId" element={<CoursePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
