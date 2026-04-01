import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedPost from "../components/Feed/FeedPost";
import axios from "axios";
import { apiClient } from "../lib/api-client";
import "./css/FeedPage.css";

const Feed = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useNavigate();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const result = await axios.get(`http://localhost:3000/api/discussion`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const discussions = result.data;
        const transformedData = discussions.map((discussion) => ({
          username: discussion.username,
          title: discussion.title,
          timeline: discussion.timestamp,
          faculty: discussion.faculty,
          comment: discussion.content,
          up_votes: discussion.upvotes,
          down_votes: discussion.downvotes,
          replies: discussion.replies,
          _id: discussion._id,
          isAuthor: discussion.isAuthor,
          edited: discussion.edited,
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
        <i className="bi bi-plus" />
        New Discussion
      </button>

      {discussions.map((obj) => (
        <FeedPost post_props={obj} key={obj._id} />
      ))}
    </div>
  );
};

export default Feed;
