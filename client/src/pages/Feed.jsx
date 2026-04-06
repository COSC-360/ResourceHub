import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeedPost from "../components/Feed/FeedPost";
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
        const discussions = await apiClient("/api/discussion", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const transformedData = discussions.map((discussion) => ({
          username: discussion.username,
          title: discussion.title,
          timeline: discussion.updatedAt,
          faculty: discussion.faculty,
          comment: discussion.content,
          up_votes: discussion.upvotes,
          down_votes: discussion.downvotes,
          parentid: discussion.parentId,
          replies: discussion.replies,
          _id: discussion._id,
          isAuthor: discussion.isAuthor,
          edited: discussion.edited,
          hasImage: discussion.hasImage,
          hasUpvote: discussion.hasUpvote,
          hasDownvote: discussion.hasDownvote,
          deleted: discussion.deleted,
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
        <FeedPost post_props={obj} key={obj._id} depth={0} />
      ))}
    </div>
  );
};

export default Feed;
