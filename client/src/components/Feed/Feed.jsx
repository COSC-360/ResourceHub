<<<<<<<< HEAD:client/src/pages/Feed.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedPost from "../components/FeedPost";
import CreateDiscussion from "../components/CreateDiscussion";
import "./css/FeedPage.css";
========
import { useState, useEffect } from "react";
import FeedPost from "./FeedPost";
import CreateDiscussion from "../CreateDiscussion/CreateDiscussion";
import { apiClient } from "../../lib/api-client";
>>>>>>>> d1912acce4e735c15ff505f1db2a82380956d555:client/src/components/Feed/Feed.jsx

const Feed = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        setLoading(true);
<<<<<<<< HEAD:client/src/pages/Feed.jsx
        const response = await fetch("http://localhost:3000/api/discussion", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch discussions");
        }
        const result = await response.json();
========
        const result = await apiClient("/api/discussion", {});
>>>>>>>> d1912acce4e735c15ff505f1db2a82380956d555:client/src/components/Feed/Feed.jsx
        const discussions = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        // Transform backend data to match FeedPost component props
        const transformedData = discussions.map((discussion) => ({
          username: discussion.username,
          timeline: discussion.timestamp,
          faculty: discussion.faculty,
          comment: discussion.content,
          up_votes: discussion.upvotes,
          down_votes: discussion.downvotes,
          replies: discussion.replies,
          _id: discussion._id,
          isAuthor: discussion.isAuthor,
        }));

        setDiscussions(transformedData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching discussions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  if (loading) return <div>Loading discussions...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="body">
      <button className="create_post" onClick={() => router("/create")}>
        <i class="bi bi-plus" />
        New Discussion
      </button>
      {discussions.map((obj) => (
        <FeedPost post_props={obj} key={obj._id} />
      ))}
    </div>
  );
};

export default Feed;
