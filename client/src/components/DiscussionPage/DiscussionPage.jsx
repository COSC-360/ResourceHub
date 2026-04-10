import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DiscussionCard from "../Cards/DiscussionCard.jsx";
import Replies from "./Replies.jsx";
import Reply from "./Reply.jsx";
import { apiClient } from "../../lib/api-client";

export default function DiscussionPage({ discussionId: discussionIdProp }) {
  const params = useParams();
  const discussionId = discussionIdProp || params.discussionId;

  const [discussion, setDiscussion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRootReply, setShowRootReply] = useState(false);
  const [threadVersion, setThreadVersion] = useState(0);

  useEffect(() => {
    if (!discussionId) return;

    let active = true;

    async function loadDiscussionPage() {
      try {
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const discussionJson = await apiClient(`/api/discussion/${discussionId}`, { headers });

        if (!active) return;

        setDiscussion(discussionJson?.data ?? discussionJson);
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load discussion");
          setDiscussion(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadDiscussionPage();

    return () => {
      active = false;
    };
  }, [discussionId]);

  function resolveCourseId(courseValue) {
    if (!courseValue) return "";
    if (typeof courseValue === "object") return courseValue._id || courseValue.id || "";
    return String(courseValue);
  }

  const rootCourseId = resolveCourseId(discussion?.courseId);

  function handleRootReplySubmitted() {
    setShowRootReply(false);
    setThreadVersion((prev) => prev + 1);
    setDiscussion((prev) => {
      if (!prev) return prev;
      const currentReplies = Number(prev.replies ?? 0);
      return { ...prev, replies: currentReplies + 1 };
    });
  }

  return (
    <div className="discussion-page">
      {isLoading && <div className="discussion-page__status">Loading discussion...</div>}
      {error && <div className="discussion-page__status discussion-page__status--error">{error}</div>}

      {!isLoading && !error && discussion && (
        <DiscussionCard
          key={discussionId}
          data={discussion}
          onReplyClick={() => setShowRootReply((prev) => !prev)}
        />
      )}

      {!isLoading && !error && discussion && showRootReply && rootCourseId && (
        <Reply
          courseId={rootCourseId}
          parentId={discussionId}
          onSubmitted={handleRootReplySubmitted}
          onCancel={() => setShowRootReply(false)}
        />
      )}

      {!isLoading && !error && discussion && (
        <section className="discussion-page__replies" aria-label="Replies">
          <h2>Replies</h2>
          {Number(discussion?.replies ?? 0) > 0 ? (
            <Replies
              key={`${discussionId}-${threadVersion}`}
              parentId={discussionId}
              depth={1}
              expectedCount={Number(discussion?.replies ?? 0)}
              defaultExpanded
              showToggleLabel={false}
            />
          ) : (
            <p>No replies yet.</p>
          )}
        </section>
      )}
    </div>
  );
}