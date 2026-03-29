import React, { useState, useEffect } from "react";
import FeedPost from "../components/FeedPost";
import CreateDiscussion from "./CreateDiscussion";

const Feed = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleNewDiscussion = (newDiscussion) => {
    // Refresh the discussion feed or add the new discussion to the list
    const transformedDiscussion = {
      username: newDiscussion.username,
      timeline: newDiscussion.timestamp,
      faculty: newDiscussion.faculty,
      comment: newDiscussion.content,
      up_votes: newDiscussion.upvotes || 0,
      down_votes: newDiscussion.downvotes || 0,
      replies: newDiscussion.replies || 0,
      _id: newDiscussion._id,
    };
    setDiscussions((prev) => [transformedDiscussion, ...prev]);
  };

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/discussion");
        if (!response.ok) {
          throw new Error("Failed to fetch discussions");
        }
        const result = await response.json();
        const discussions = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];
        console.log(result);
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
    <div>
      <CreateDiscussion onDiscussionCreated={handleNewDiscussion} />
      {discussions.map((obj) => (
        <FeedPost post_props={obj} key={obj._id} />
      ))}
    </div>
  );
};

export default Feed;
