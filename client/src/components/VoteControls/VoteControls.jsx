import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";

export default function VoteControls({
  targetId,
  targetType, // "Discussion" | "Resource"
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialHasUpvote = false,
  initialHasDownvote = false,
  buttonClassName = "",
  activeClassName = "active",
}) {
  const navigate = useNavigate();
  const [voteState, setVoteState] = useState(() => ({
    targetId,
    upvotes: Number(initialUpvotes) || 0,
    downvotes: Number(initialDownvotes) || 0,
    hasUpvote: Boolean(initialHasUpvote),
    hasDownvote: Boolean(initialHasDownvote),
  }));
  const [voteBusy, setVoteBusy] = useState(false);

  const current =
    String(voteState.targetId) === String(targetId)
      ? voteState
      : {
          targetId,
          upvotes: Number(initialUpvotes) || 0,
          downvotes: Number(initialDownvotes) || 0,
          hasUpvote: Boolean(initialHasUpvote),
          hasDownvote: Boolean(initialHasDownvote),
        };

  const updateCurrentState = (next) => {
    setVoteState({
      targetId,
      upvotes: next.upvotes,
      downvotes: next.downvotes,
      hasUpvote: next.hasUpvote,
      hasDownvote: next.hasDownvote,
    });
  };

  const handleUpvote = async () => {
    if (voteBusy) return;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate(LOGIN_ROUTE);
      setVoteBusy(true);

      const wasUp = current.hasUpvote;
      const wasDown = current.hasDownvote;
      const next = {
        upvotes: current.upvotes,
        downvotes: current.downvotes,
        hasUpvote: current.hasUpvote,
        hasDownvote: current.hasDownvote,
      };

      if (wasUp || wasDown) {
        await apiClient("/api/vote/remove", {
          method: "DELETE",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (wasDown) {
          next.downvotes = Math.max(0, next.downvotes - 1);
          next.hasDownvote = false;
        }
        if (wasUp) {
          next.upvotes = Math.max(0, next.upvotes - 1);
          next.hasUpvote = false;
        }
      }

      if (!wasUp) {
        await apiClient("/api/vote/up", {
          method: "POST",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
        next.upvotes += 1;
        next.hasUpvote = true;
      }

      updateCurrentState(next);
    } catch (err) {
      console.error("Upvote failed:", err);
    } finally {
      setVoteBusy(false);
    }
  };

  const handleDownvote = async () => {
    if (voteBusy) return;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate(LOGIN_ROUTE);
      setVoteBusy(true);

      const wasUp = current.hasUpvote;
      const wasDown = current.hasDownvote;
      const next = {
        upvotes: current.upvotes,
        downvotes: current.downvotes,
        hasUpvote: current.hasUpvote,
        hasDownvote: current.hasDownvote,
      };

      if (wasUp || wasDown) {
        await apiClient("/api/vote/remove", {
          method: "DELETE",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (wasUp) {
          next.upvotes = Math.max(0, next.upvotes - 1);
          next.hasUpvote = false;
        }
        if (wasDown) {
          next.downvotes = Math.max(0, next.downvotes - 1);
          next.hasDownvote = false;
        }
      }

      if (!wasDown) {
        await apiClient("/api/vote/down", {
          method: "POST",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
        next.downvotes += 1;
        next.hasDownvote = true;
      }

      updateCurrentState(next);
    } catch (err) {
      console.error("Downvote failed:", err);
    } finally {
      setVoteBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`${buttonClassName} ${current.hasUpvote ? activeClassName : ""}`.trim()}
        onClick={handleUpvote}
        disabled={voteBusy}
      >
        <i className="bi bi-arrow-up"></i>
        <span>{current.upvotes}</span>
      </button>

      <button
        type="button"
        className={`${buttonClassName} ${current.hasDownvote ? activeClassName : ""}`.trim()}
        onClick={handleDownvote}
        disabled={voteBusy}
      >
        <i className="bi bi-arrow-down"></i>
        <span>{current.downvotes}</span>
      </button>
    </>
  );
}
