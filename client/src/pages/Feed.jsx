import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedPost from "../components/FeedPost";
import CreateDiscussion from "../components/CreateDiscussion";
import "./css/FeedPage.css";

const feed = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const token = localStorage.getItem("access_token");
        setLoading(true);
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

export default feed;
