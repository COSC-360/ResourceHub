import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DiscussionCard from "../Cards/DiscussionCard.jsx";
import Replies from "./Replies.jsx";
import Reply from "./Reply.jsx";
import { apiClient } from "../../lib/api-client";
import { coursePath } from "../../constants/RouteConstants.jsx";
import { socket } from "../../socket";
import "./DiscussionPage.css";

export default function DiscussionPage({ discussionId: discussionIdProp }) {
  const params = useParams();
  const discussionId = discussionIdProp || params.discussionId;
  const routeCourseId = params.courseId;

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

  useEffect(() => {
    if (!discussionId) return;

    socket.emit("joinDiscussion", discussionId);

    async function refreshRootDiscussion() {
      try {
        const token = localStorage.getItem("access_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const discussionJson = await apiClient(`/api/discussion/${discussionId}`, { headers });
        setDiscussion(discussionJson?.data ?? discussionJson);
      } catch {
        /* keep existing discussion on transient errors */
      }
    }

    function handleReplyCreated(payload) {
      if (String(payload?.parentId) !== String(discussionId)) return;
      void refreshRootDiscussion();
    }

    function handleReplyDeleted(payload) {
      if (String(payload?.parentId) !== String(discussionId)) return;
      void refreshRootDiscussion();
    }

    function handleVoteUpdated(payload) {
      const tid = payload?.targetId?._id ?? payload?.targetId;
      if (String(tid) !== String(discussionId)) return;
      setDiscussion((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          upvotes: payload.upvotes,
          downvotes: payload.downvotes,
          score: payload.score,
        };
      });
    }

    function handlePostUpdated(payload) {
      const post = payload?.post;
      if (!post) return;
      const pid = post._id ?? post.id;
      if (String(pid) !== String(discussionId)) return;
      setDiscussion((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          title: post.title ?? prev.title,
          content: post.content ?? prev.content,
          edited: post.edited ?? prev.edited,
          hasImage: post.hasImage ?? prev.hasImage,
          deleted: post.deleted ?? prev.deleted,
        };
      });
    }

    function handlePostDeleted(payload) {
      const pid = payload?.postId?._id ?? payload?.postId;
      if (String(pid) !== String(discussionId)) return;
      if (payload.softDeleted) {
        setDiscussion((prev) =>
          prev
            ? {
                ...prev,
                deleted: true,
                title: "[deleted]",
                content: "[deleted]",
              }
            : prev,
        );
      } else {
        setDiscussion(null);
        setError("This discussion was removed.");
      }
    }

    socket.on("reply:created", handleReplyCreated);
    socket.on("reply:deleted", handleReplyDeleted);
    socket.on("vote:updated", handleVoteUpdated);
    socket.on("post:updated", handlePostUpdated);
    socket.on("post:deleted", handlePostDeleted);

    return () => {
      socket.emit("leaveDiscussion", discussionId);
      socket.off("reply:created", handleReplyCreated);
      socket.off("reply:deleted", handleReplyDeleted);
      socket.off("vote:updated", handleVoteUpdated);
      socket.off("post:updated", handlePostUpdated);
      socket.off("post:deleted", handlePostDeleted);
    };
  }, [discussionId]);

  function resolveCourseId(courseValue) {
    if (!courseValue) return "";
    if (typeof courseValue === "object") return courseValue._id || courseValue.id || "";
    return String(courseValue);
  }

  const rootCourseId = resolveCourseId(discussion?.courseId);
  const backCourseId = routeCourseId || rootCourseId;

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
      {backCourseId ? (
        <div className="discussion-page__back">
          <Link to={coursePath(backCourseId)} className="discussion-page__back-link">
            ← Back to course
          </Link>
        </div>
      ) : null}
      {isLoading && <div className="discussion-page__status">Loading discussion...</div>}
      {error && <div className="discussion-page__status discussion-page__status--error">{error}</div>}

      {!isLoading && !error && discussion && (
        <DiscussionCard
          key={discussionId}
          data={discussion}
          onDiscussionUpdated={(patch) =>
            setDiscussion((prev) => (prev ? { ...prev, ...patch } : prev))
          }
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