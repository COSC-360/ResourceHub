import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { timeAgo } from "../../lib/dateUtils";
import { handleVote } from "../../lib/voteUtils";
import { fetchUserById } from "../../lib/userUtils";
import defaultProfile from "../../assets/profile.svg";
import "./DiscussionCard.css";

export default function DiscussionCard({ data, isReply = false, depth = 0 }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [upvotes, setUpvotes] = useState(data.upvotes ?? 0);
    const [downvotes, setDownvotes] = useState(data.downvotes ?? 0);
    const [hasUpvote, setHasUpvote] = useState(data.hasUpvote ?? false);
    const [hasDownvote, setHasDownvote] = useState(data.hasDownvote ?? false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const timeStr = useMemo(
        () => timeAgo(new Date(data.createdAt || data.updatedAt)),
        [data.createdAt, data.updatedAt]
    );

    useEffect(() => {
        fetchUserById(data.authorId).then(setUser).catch(console.error);
    }, [data.authorId]);

    const handleUpvote = async () => {
        setIsLoading(true);
        try {
            await handleVote(data._id, "Discussion", "up", hasUpvote, hasDownvote);
            setUpvotes((prev) => prev + (hasUpvote ? -1 : 1));
            setHasUpvote(!hasUpvote);
            if (hasDownvote) {
                setDownvotes((prev) => prev - 1);
                setHasDownvote(false);
            }
        } catch (err) {
            if (err.message === "Not authenticated") {
                navigate("/login");
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownvote = async () => {
        setIsLoading(true);
        try {
            await handleVote(data._id, "Discussion", "down", hasDownvote, hasUpvote);
            setDownvotes((prev) => prev + (hasDownvote ? -1 : 1));
            setHasDownvote(!hasDownvote);
            if (hasUpvote) {
                setUpvotes((prev) => prev - 1);
                setHasUpvote(false);
            }
        } catch (err) {
            if (err.message === "Not authenticated") {
                navigate("/login");
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    const classPrefix = isReply ? "discussion-card--reply" : "discussion-card";
    const depthClass = depth > 0 ? `discussion-card--depth-${Math.min(depth, 4)}` : "";

    return (
        <article className={`${classPrefix} ${depthClass}`}>
            <div className="discussion-card__header">
                <img
                    src={`/api/user/getProfilePhoto/${data.authorId}`}
                    alt={user.username}
                    className="discussion-card__avatar"
                    onError={(e) => (e.target.src = defaultProfile)}
                />

                <div className="discussion-card__meta">
                    <div className="discussion-card__user-info">
                        {!isReply && <span className="discussion-card__forum">c/</span>}
                        <span className="discussion-card__username">{user.username}</span>
                        <span className="discussion-card__time">{timeStr}</span>
                        {user.faculty && (
                            <span className="discussion-card__faculty">{user.faculty}</span>
                        )}
                        {data.edited && <span className="discussion-card__edited">edited</span>}
                    </div>
                </div>

                {data.isAuthor && (
                    <div className="discussion-card__actions">
                        {/* TODO: Edit/Delete buttons */}
                    </div>
                )}
            </div>

            {data.title && (
                <h3 className="discussion-card__title">{data.title}</h3>
            )}

            <p className="discussion-card__content">{data.content}</p>

            {data.hasImage && (
                <img
                    src={`/api/discussion/${data._id}/image`}
                    alt="Discussion image"
                    className="discussion-card__image"
                />
            )}

            <div className="discussion-card__footer">
                <button
                    className={`discussion-card__vote ${hasUpvote ? "active" : ""}`}
                    onClick={handleUpvote}
                    disabled={isLoading}
                    title="Upvote"
                >
                    <i className="bi bi-arrow-up"></i>
                    <span>{upvotes}</span>
                </button>

                <button
                    className={`discussion-card__vote ${hasDownvote ? "active" : ""}`}
                    onClick={handleDownvote}
                    disabled={isLoading}
                    title="Downvote"
                >
                    <i className="bi bi-arrow-down"></i>
                    <span>{downvotes}</span>
                </button>

                <button className="discussion-card__reply" title="Reply">
                    <i className="bi bi-chat"></i>
                    <span>{data.replies ?? 0}</span>
                </button>
            </div>

            {error && <div className="discussion-card__error">{error}</div>}
        </article>
    );
}