import { useState, useEffect, useMemo } from "react";
import { fetchUserById } from "../../lib/userUtils";
import { timeAgo } from "../../lib/dateUtils";
import VoteControls from "../VoteControls/VoteControls.jsx";
import defaultProfile from "../../assets/profile.svg";
import "./DiscussionCard.css";

export default function DiscussionCard({ data, isReply = false, depth = 0 }) {
  const [user, setUser] = useState(null);

  const discussionId = data?._id || data?.id;
  const hasImage = Boolean(data?.hasImage || data?.image?.contentType);

  const timeStr = useMemo(
    () => timeAgo(new Date(data?.createdAt || data?.updatedAt || Date.now())),
    [data?.createdAt, data?.updatedAt]
  );

  useEffect(() => {
    if (!data?.authorId) return;
    fetchUserById(data.authorId).then(setUser).catch(() => setUser(null));
  }, [data?.authorId]);

  const username = user?.username || "Unknown User";
  const faculty = user?.faculty || "None";

  if (!data || !user) return null;

  const classPrefix = isReply ? "discussion-card--reply" : "discussion-card";
  const depthClass = depth > 0 ? `discussion-card--depth-${Math.min(depth, 4)}` : "";

  return (
    <article className={`${classPrefix} ${depthClass}`}>
      <div className="discussion-card__header">
        <img
          src={`/api/user/getProfilePhoto/${data.authorId}`}
          alt={username}
          className="discussion-card__avatar"
          onError={(e) => (e.currentTarget.src = defaultProfile)}
        />

        <div className="discussion-card__meta">
          <div className="discussion-card__user-info">
            {!isReply && <span className="discussion-card__forum">c/</span>}
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

        <button className="discussion-card__reply" title="Reply">
          <i className="bi bi-chat"></i>
          <span>{data.replies ?? 0}</span>
        </button>
      </div>
    </article>
  );
}