import { useEffect } from "react";
import CreateDiscussion from "../components/CreateDiscussion/CreateDiscussion.jsx";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const router = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) router("/login");
  }, [router]);
  return (
    <div>
      <CreateDiscussion />
    </div>
  );
};

export default CreatePost;
