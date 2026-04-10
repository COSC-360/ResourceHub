import { apiClient } from "./api-client";

const userCache = new Map();

export function displayFaculty(value, fallback = "No Faculty") {
    const text = value == null ? "" : String(value).trim();
    if (!text) return fallback;

    const lowered = text.toLowerCase();
    if (lowered === "undefined" || lowered === "null" || lowered === "none") {
        return fallback;
    }

    return text;
}

export async function fetchUserById(userId) {
    if (userCache.has(userId)) {
        return userCache.get(userId);
    }

    try {
        const response = await apiClient(`/api/user/getUserById/${userId}`);
        userCache.set(userId, response.data);
        return response.data;
    } catch (err) {
        console.error(`Failed to fetch user ${userId}:`, err);
        return { username: "Unknown User", faculty: "No Faculty" };
    }
}