export function timeAgo(date, currentDate = new Date()) {
    if (!date || !currentDate) return "Undefined";

    const seconds = Math.floor((currentDate - date) / 1000);

    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

export function createdAtFromObjectId(value) {
    if (!value) return null;
    const id = String(value);
    if (!/^[a-f\d]{24}$/i.test(id)) return null;

    const seconds = parseInt(id.slice(0, 8), 16);
    if (!Number.isFinite(seconds)) return null;

    return new Date(seconds * 1000).toISOString();
}