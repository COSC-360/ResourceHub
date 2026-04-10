import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserById } from "../../lib/userUtils";
import { timeAgo } from "../../lib/dateUtils";
import VoteControls from "../VoteControls/VoteControls.jsx";
import defaultProfile from "../../assets/profile.svg";
import "./DiscussionCard.css";

export default function DiscussionCard({
  data,
  isReply = false,
  depth = 0,
  onReplyClick,
}) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const discussionId = data?._id || data?.id;
  const authorId =
    typeof data?.authorId === "object"
      ? data?.authorId?._id || data?.authorId?.id
      : data?.authorId;
  const populatedAuthor = typeof data?.authorId === "object" ? data.authorId : null;
  const courseId =
    typeof data?.courseId === "object"
      ? data?.courseId?._id || data?.courseId?.id
      : data?.courseId;
  const courseCode =
    data?.courseCode ||
    data?.coursecode ||
    data?.course?.code ||
    data?.courseId?.code ||
    data?.courseId?.coursecode ||
    "";
  const hasImage = Boolean(data?.hasImage || data?.image?.contentType);
  const replyHref =
    discussionId && courseId ? `/courses/${courseId}/discussions/${discussionId}` : null;

  const createdAt = data?.createdAt || data?.updatedAt;
  const timeStr = useMemo(() => {
    return createdAt ? timeAgo(new Date(createdAt)) : "";
  }, [createdAt]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (populatedAuthor) {
        setUser({
          username: populatedAuthor.username || "Unknown User",
          faculty: populatedAuthor.faculty || "",
        });
        return;
      }

      if (!authorId) {
        setUser(null);
        return;
      }

      try {
        const fetchedUser = await fetchUserById(authorId);
        if (!cancelled) setUser(fetchedUser);
      } catch {
        if (!cancelled) setUser(null);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [authorId, populatedAuthor]);

  const username = user?.username || populatedAuthor?.username || "Unknown User";
  const faculty = user?.faculty || populatedAuthor?.faculty || "";

  if (!data) return null;

  const classPrefix = isReply ? "discussion-card--reply" : "discussion-card";
  const depthClass = depth > 0 ? `discussion-card--depth-${Math.min(depth, 4)}` : "";

  function handleCardClick(event) {
    if (event.target.closest("a, button, input, textarea, select, label")) return;
    if (replyHref) navigate(replyHref);
  }

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (replyHref) navigate(replyHref);
    }
  }

  return (
    <article
      className={`${classPrefix} ${depthClass}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={replyHref ? "link" : undefined}
      tabIndex={replyHref ? 0 : undefined}
    >
      <div className="discussion-card__header">
        <img
          src={authorId ? `/api/user/getProfilePhoto/${authorId}` : defaultProfile}
          alt={username}
          className="discussion-card__avatar"
          onError={(e) => {
            e.currentTarget.src = defaultProfile;
          }}
        />

        <div className="discussion-card__meta">
          <div className="discussion-card__user-info">
            {!isReply && courseId && (
              <Link to={`/courses/${courseId}`} className="discussion-card__forum">
                c/{courseCode || "course"}
              </Link>
            )}
            <span className="discussion-card__username">{username}</span>
            {faculty && <span className="discussion-card__faculty">{faculty}</span>}
            <span className="discussion-card__time">{timeStr}</span>
            {data.edited && <span className="discussion-card__edited">edited</span>}
          </div>
        </div>
      </div>

      {data.title && <h3 className="discussion-card__title">{data.title}</h3>}
      <p className="discussion-card__content">{data.content || data.comment}</p>

      {hasImage && discussionId && (
        <img
          src={`/api/discussion/${discussionId}/image`}
          alt="Discussion image"
          className="discussion-card__image"
        />
      )}

      <div className="discussion-card__footer">
        <VoteControls
          targetId={discussionId}
          targetType="Discussion"
          initialUpvotes={data.upvotes ?? data.up_votes ?? 0}
          initialDownvotes={data.downvotes ?? data.down_votes ?? 0}
          initialHasUpvote={Boolean(data.hasUpvote)}
          initialHasDownvote={Boolean(data.hasDownvote)}
          buttonClassName="discussion-card__vote"
          activeClassName="active"
        />
        {typeof onReplyClick === "function" ? (
          <button
            className="discussion-card__reply"
            title="Reply"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReplyClick(data);
            }}
          >
            <i className="bi bi-chat"></i>
            <span>{data.replies ?? 0}</span>
          </button>
        ) : replyHref ? (
          <Link
            className="discussion-card__reply"
            title="Reply"
            to={replyHref}
            onClick={(event) => event.stopPropagation()}
          >
            <i className="bi bi-chat"></i>
            <span>{data.replies ?? 0}</span>
          </Link>
        ) : (
          <button
            className="discussion-card__reply"
            title="Reply"
            type="button"
            disabled
            onClick={(event) => event.stopPropagation()}
          >
            <i className="bi bi-chat"></i>
            <span>{data.replies ?? 0}</span>
          </button>
        )}
      </div>
    </article>
  );
}