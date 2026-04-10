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
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [hasUpvote, setHasUpvote] = useState(initialHasUpvote);
  const [hasDownvote, setHasDownvote] = useState(initialHasDownvote);

  const [prevFromProps, setPrevFromProps] = useState(() => ({
    targetId,
    initialUpvotes,
    initialDownvotes,
    initialHasUpvote,
    initialHasDownvote,
  }));

  if (
    prevFromProps.targetId !== targetId ||
    prevFromProps.initialUpvotes !== initialUpvotes ||
    prevFromProps.initialDownvotes !== initialDownvotes ||
    prevFromProps.initialHasUpvote !== initialHasUpvote ||
    prevFromProps.initialHasDownvote !== initialHasDownvote
  ) {
    setPrevFromProps({
      targetId,
      initialUpvotes,
      initialDownvotes,
      initialHasUpvote,
      initialHasDownvote,
    });
    setUpvotes(initialUpvotes);
    setDownvotes(initialDownvotes);
    setHasUpvote(initialHasUpvote);
    setHasDownvote(initialHasDownvote);
  }

  const handleUpvote = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate(LOGIN_ROUTE);

      if (hasUpvote || hasDownvote) {
        await apiClient("/api/vote/remove", {
          method: "DELETE",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (hasDownvote) {
          setHasDownvote(false);
        }
      }

      if (!hasUpvote) {
        await apiClient("/api/vote/up", {
          method: "POST",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasUpvote(true);
      } else {
        setHasUpvote(false);
      }
    } catch (err) {
      console.error("Upvote failed:", err);
    }
  };

  const handleDownvote = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate(LOGIN_ROUTE);

      if (hasUpvote || hasDownvote) {
        await apiClient("/api/vote/remove", {
          method: "DELETE",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (hasUpvote) {
          setHasUpvote(false);
        }
      }

      if (!hasDownvote) {
        await apiClient("/api/vote/down", {
          method: "POST",
          body: { targetType, targetId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasDownvote(true);
      } else {
        setHasDownvote(false);
      }
    } catch (err) {
      console.error("Downvote failed:", err);
    }
  };

  return (
    <>
      <button
        className={`${buttonClassName} ${hasUpvote ? activeClassName : ""}`.trim()}
        onClick={handleUpvote}
      >
        <i className="bi bi-arrow-up"></i>
        <span>{upvotes}</span>
      </button>

      <button
        className={`${buttonClassName} ${hasDownvote ? activeClassName : ""}`.trim()}
        onClick={handleDownvote}
      >
        <i className="bi bi-arrow-down"></i>
        <span>{downvotes}</span>
      </button>
    </>
  );
}
