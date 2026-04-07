import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api-client";

export default function CourseMembershipButton({ courseId, onMembershipChanged }) {
  const navigate = useNavigate();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      const token = localStorage.getItem("access_token");
      if (!token || !courseId) {
        if (active) setLoading(false);
        return;
      }

      try {
        const res = await apiClient(`/api/memberships/me/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setIsMember(!!res.isMember);
      } catch {
        // ignore status failures
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStatus();
    return () => {
      active = false;
    };
  }, [courseId]);

  async function onClick() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const nextIsMember = !isMember;

    // optional optimistic UI
    setIsMember(nextIsMember);
    onMembershipChanged?.({ isMember: nextIsMember });

    setLoading(true);
    try {
      let res;
      if (nextIsMember) {
        res = await apiClient(`/api/memberships/${courseId}/join`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await apiClient(`/api/memberships/${courseId}/leave`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // authoritative server state
      setIsMember(Boolean(res?.isMember));
      onMembershipChanged?.({
        isMember: Boolean(res?.isMember),
        memberCount: typeof res?.memberCount === "number" ? res.memberCount : undefined,
      });
    } catch {
      // rollback optimistic
      setIsMember(!nextIsMember);
      onMembershipChanged?.({ isMember: !nextIsMember });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="course-header__join" onClick={onClick} disabled={loading}>
      {loading ? "Loading..." : isMember ? "Leave" : "Join"}
    </button>
  );
}