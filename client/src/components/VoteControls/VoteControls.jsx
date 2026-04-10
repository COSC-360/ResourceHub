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
  const propsState = {
    targetId,
    upvotes: Number(initialUpvotes) || 0,
    downvotes: Number(initialDownvotes) || 0,
    hasUpvote: Boolean(initialHasUpvote),
    hasDownvote: Boolean(initialHasDownvote),
  };

  const [voteState, setVoteState] = useState(() => ({
    ...propsState,
  }));
  const [voteBusy, setVoteBusy] = useState(false);

  const sameTarget = String(voteState.targetId) === String(targetId);
  const current = !sameTarget
    ? propsState
    : {
        targetId,
        upvotes:
          !voteBusy && voteState.upvotes !== propsState.upvotes
            ? propsState.upvotes
            : voteState.upvotes,
        downvotes:
          !voteBusy && voteState.downvotes !== propsState.downvotes
            ? propsState.downvotes
            : voteState.downvotes,
        hasUpvote: voteState.hasUpvote,
        hasDownvote: voteState.hasDownvote,
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

  const computeOptimisticUpvoteState = (state) => {
    if (state.hasUpvote) {
      return {
        ...state,
        upvotes: Math.max(0, state.upvotes - 1),
        hasUpvote: false,
      };
    }

    if (state.hasDownvote) {
      return {
        ...state,
        upvotes: state.upvotes + 1,
        downvotes: Math.max(0, state.downvotes - 1),
        hasUpvote: true,
        hasDownvote: false,
      };
    }

    return {
      ...state,
      upvotes: state.upvotes + 1,
      hasUpvote: true,
    };
  };

  const computeOptimisticDownvoteState = (state) => {
    if (state.hasDownvote) {
      return {
        ...state,
        downvotes: Math.max(0, state.downvotes - 1),
        hasDownvote: false,
      };
    }

    if (state.hasUpvote) {
      return {
        ...state,
        upvotes: Math.max(0, state.upvotes - 1),
        downvotes: state.downvotes + 1,
        hasUpvote: false,
        hasDownvote: true,
      };
    }

    return {
      ...state,
      downvotes: state.downvotes + 1,
      hasDownvote: true,
    };
  };

  const handleUpvote = async () => {
    if (voteBusy) return;
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate(LOGIN_ROUTE);

      const previous = { ...current };
      const optimistic = computeOptimisticUpvoteState(previous);
      updateCurrentState(optimistic);
      setVoteBusy(true);

      const wasUp = previous.hasUpvote;
      const wasDown = previous.hasDownvote;

      if (wasUp || wasDown) {
        await apiClient("/api/vote/remove", {
          method: "DELETE",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!wasUp) {
        await apiClient("/api/vote/up", {
          method: "POST",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      updateCurrentState(current);
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

      const previous = { ...current };
      const optimistic = computeOptimisticDownvoteState(previous);
      updateCurrentState(optimistic);
      setVoteBusy(true);

      const wasUp = previous.hasUpvote;
      const wasDown = previous.hasDownvote;

      if (wasUp || wasDown) {
        await apiClient("/api/vote/remove", {
          method: "DELETE",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (!wasDown) {
        await apiClient("/api/vote/down", {
          method: "POST",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      updateCurrentState(current);
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
