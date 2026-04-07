import { apiClient } from "./api-client";

export async function handleVote(targetId, targetType, voteType, hasVote, hasOtherVote) {
    const token = localStorage.getItem("access_token");
    if (!token) {
        throw new Error("Not authenticated");
    }

    // Remove existing vote if switching or toggling off
    if (hasVote || hasOtherVote) {
        await apiClient("/api/vote/remove", {
            method: "DELETE",
            body: { targetType, targetId },
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // Add new vote if not already voted this way
    if (!hasVote) {
        const endpoint = voteType === "up" ? "/api/vote/up" : "/api/vote/down";
        await apiClient(endpoint, {
            method: "POST",
            body: { targetType, targetId },
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}