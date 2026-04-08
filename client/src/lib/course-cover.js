export const DEFAULT_COURSE_COVER = "/assets/ubco-campus.jpg";

export function resolveCourseImageSrc(raw) {
    if (raw == null || typeof raw !== "string") return "";
    const s = raw.trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    return s.startsWith("/") ? s : `/${s}`;
}
