import { useEffect, useMemo, useState } from "react";
import { timeAgo } from "../../lib/dateUtils";
import VoteControls from "../VoteControls/VoteControls.jsx";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";
import "./ResourceCard.css";

const userCache = new Map();
const courseCache = new Map();

async function getUser(authorId) {
  if (!authorId) return null;
  if (userCache.has(authorId)) return userCache.get(authorId);

  const res = await fetch(`/api/user/getUserById/${authorId}`);
  if (!res.ok) throw new Error("Failed to load author");
  const json = await res.json();
  const user = json?.data ?? json;
  userCache.set(authorId, user);
  return user;
}

async function getCourse(courseId) {
  if (!courseId) return null;
  if (courseCache.has(courseId)) return courseCache.get(courseId);

  // If your backend mount is different, change this path.
  const res = await fetch(`/api/courses/${courseId}`);
  if (!res.ok) throw new Error("Failed to load course");
  const json = await res.json();
  const course = json?.data ?? json;
  courseCache.set(courseId, course);
  return course;
}

export default function ResourceCard({ data }) {
  const [author, setAuthor] = useState(null);
  const [course, setCourse] = useState(null);
  const likes = data?.likes ?? 0;
  const dislikes = data?.dislikes ?? 0;
  const [downloadCount, setDownloadCount] = useState(data?.downloadCount ?? 0);

  useEffect(() => {
    getUser(data?.authorId).then(setAuthor).catch(() => setAuthor(null));
    getCourse(data?.courseId).then(setCourse).catch(() => setCourse(null));
  }, [data?.authorId, data?.courseId]);

  const createdAt = data?.createdAt || data?.updatedAt;
  const created = useMemo(
    () => (createdAt ? timeAgo(new Date(createdAt)) : ""),
    [createdAt],
  );

  if (!data) return null;

  const id = data._id || data.id;
  const name = data.name || "Untitled Resource";
  const description = data.description || "No description.";
  const url = data.url || "#";
  const category = data.category || "Uncategorized";
  const fileCount = data.fileCount ?? 0;
  const authorName = author?.username || "Unknown";
  const courseName = course?.name || course?.coursename || "Unknown Course";

  async function onDownloadClick() {
    // TODO(server): add endpoint to increment download count, e.g. PATCH /api/resources/:id/download
    // await fetch(`/api/resources/${id}/download`, { method: "PATCH" });
    setDownloadCount((n) => n + 1);
  }

  return (
    <article className="resource-card">
      <header className="resource-card__header">
        <ProfileAvatar
          className="resource-card__avatar"
          userId={data.authorId}
          alt={authorName}
        />
        <div className="resource-card__meta">
          <div className="resource-card__line">
            <span className="resource-card__course">c/{courseName}</span>
            <span className="resource-card__dot">•</span>
            <span className="resource-card__time">{created}</span>
          </div>
          <div className="resource-card__author">{authorName}</div>
        </div>
      </header>

      <h3 className="resource-card__title">{name}</h3>
      <p className="resource-card__description">{description}</p>

      <div className="resource-card__category">#{category}</div>

      <a
        className="resource-card__link"
        href={url}
        target="_blank"
        rel="noreferrer"
        download
        onClick={onDownloadClick}
      >
        Open / Download
      </a>

      <footer className="resource-card__footer">
        <VoteControls
          targetId={id}
          targetType="Resource"
          initialUpvotes={likes}
          initialDownvotes={dislikes}
          initialHasUpvote={Boolean(data?.hasUpvote)}
          initialHasDownvote={Boolean(data?.hasDownvote)}
          buttonClassName="resource-card__btn"
          activeClassName="active"
        />
        <span className="resource-card__stat">Files: {fileCount}</span>
        <span className="resource-card__stat">Downloads: {downloadCount}</span>
      </footer>
    </article>
  );
}