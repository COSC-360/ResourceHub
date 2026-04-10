import { useEffect } from "react";
import CreateDiscussion from "../components/CreateDiscussion/CreateDiscussion.jsx";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../constants/RouteConstants.jsx";

const CreatePost = () => {
  const router = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) router(LOGIN_ROUTE);
  }, [router]);
  return (
    <div>
      <CreateDiscussion />
    </div>
  );
};

export default CreatePost;
