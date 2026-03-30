import React, { useState, useEffect } from "react";
import CreateDiscussion from "../components/CreateDiscussion";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const router = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) router("/auth");
  }, []);
  return (
    <div>
      <CreateDiscussion />
    </div>
  );
};

export default CreatePost;
