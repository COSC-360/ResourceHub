import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { displayFaculty, fetchUserById } from "../../lib/userUtils";
import { createdAtFromObjectId, timeAgo } from "../../lib/dateUtils";
import { apiClient } from "../../lib/api-client";
import AuthContext from "../../AuthContext.jsx";
import VoteControls from "../VoteControls/VoteControls.jsx";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";
import {
  courseDiscussionPath,
  coursePath,
  LOGIN_ROUTE,
} from "../../constants/RouteConstants.jsx";
import "./DiscussionCard.css";
import {
  LIMITS,
  trimStr,
  validateDiscussionEdit,
} from "../../lib/formValidation.js";

export default function DiscussionCard({
  data,
  isReply = false,
  depth = 0,
  onReplyClick,
  onDiscussionUpdated,
}) {
  const { user: sessionUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [localPatch, setLocalPatch] = useState(null);
  const fileInputRef = useRef(null);

  const discussionId = data?._id || data?.id;

  const merged = useMemo(() => {
    if (!data) return null;
    return localPatch ? { ...data, ...localPatch } : data;
  }, [data, localPatch]);

  const authorId =
    typeof data?.authorId === "object"
      ? data?.authorId?._id || data?.authorId?.id
      : data?.authorId;
  const populatedAuthor = typeof data?.authorId === "object" ? data.authorId : null;
  const courseId =
    typeof data?.courseId === "object"
      ? data?.courseId?._id || data?.courseId?.id
      : data?.courseId;
  const courseCode =
    data?.courseCode ||
    data?.coursecode ||
    data?.course?.code ||
    data?.courseId?.code ||
    data?.courseId?.coursecode ||
    "";
  const hasImage = Boolean(
    merged && (merged.hasImage || merged.image?.contentType),
  );
  const replyHref =
    discussionId && courseId ? courseDiscussionPath(courseId, discussionId) : null;

  const postedAt =
    merged?.createdAt ||
    data?.createdAt ||
    createdAtFromObjectId(discussionId);
  const timeStr = useMemo(() => {
    return postedAt ? timeAgo(new Date(postedAt)) : "";
  }, [postedAt]);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (populatedAuthor) {
        setUser({
          username: populatedAuthor.username || "Unknown User",
          faculty: populatedAuthor.faculty || "",
        });
        return;
      }

      if (!authorId) {
        setUser(null);
        return;
      }

      try {
        const fetchedUser = await fetchUserById(authorId);
        if (!cancelled) setUser(fetchedUser);
      } catch {
        if (!cancelled) setUser(null);
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [authorId, populatedAuthor]);

  const username = user?.username || populatedAuthor?.username || "Unknown User";
  const faculty = displayFaculty(user?.faculty ?? populatedAuthor?.faculty);

  const isAuthor = Boolean(merged?.isAuthor);
  const isAdmin = Boolean(sessionUser?.admin);
  const canEditPost = isAuthor || isAdmin;
  const isDeleted = Boolean(merged?.deleted);
  const bodyText = merged?.content ?? merged?.comment ?? "";
  const titleText = merged?.title ?? "";

  function toggleEdit() {
    if (isDeleted) return;
    setError("");
    if (!editing) {
      setDraft({
        title: titleText,
        content: bodyText,
      });
      setFile(null);
      setRemoveImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setEditing(true);
    } else {
      setEditing(false);
    }
  }

  function handleDraftChange(e) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    if (!selectedFile.type?.startsWith("image/")) {
      e.target.value = "";
      setError("Only image files are allowed.");
      setFile(null);
      return;
    }
    setError("");
    setFile(selectedFile);
    if (removeImage) setRemoveImage(false);
  }

  function resetFile() {
    if (file && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
    if (!file) setRemoveImage(true);
  }

  function handleDelete() {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate(LOGIN_ROUTE);
          return;
        }
        await apiClient(`/api/discussion/${discussionId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setEditing(false);
        const del = {
          deleted: true,
          title: "[deleted]",
          content: "[deleted]",
        };
        setLocalPatch((prev) => ({ ...(prev || {}), ...del }));
        onDiscussionUpdated?.(del);
      } catch (err) {
        setError(err.message || "Delete failed");
      }
    })();
  }

  function handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    const editErr = validateDiscussionEdit({
      isReply,
      hadTitle: Boolean(titleText),
      draftTitle: draft.title,
      originalTitle: titleText,
      draftContent: draft.content,
      originalContent: bodyText,
    });
    if (editErr) {
      setError(editErr);
      return;
    }
    const nextTitle = trimStr(draft.title) || trimStr(titleText);
    const nextContent = trimStr(draft.content) || trimStr(bodyText);
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate(LOGIN_ROUTE);
          return;
        }
        const fd = new FormData();
        fd.append("title", nextTitle);
        fd.append("content", nextContent);
        fd.append("updatedImage", file ? true : removeImage);
        if (file || removeImage) fd.append("file", file);

        const json = await apiClient(`/api/discussion/${discussionId}`, {
          method: "PATCH",
          body: fd,
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = json?.data ?? json;
        setEditing(false);
        setFile(null);
        setRemoveImage(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setLocalPatch((prev) => ({ ...(prev || {}), ...payload }));
        onDiscussionUpdated?.(payload);
      } catch (err) {
        const msg = err.message || "";
        if (msg.includes("Unauthorized") || msg.includes("No access token")) {
          alert("Access token expired please login and try again!");
        } else {
          setError(msg);
        }
      }
    })();
  }

  if (!data) return null;

  const classPrefix = isReply ? "discussion-card--reply" : "discussion-card";
  const depthClass = depth > 0 ? `discussion-card--depth-${Math.min(depth, 4)}` : "";

  function handleCardClick(event) {
    if (editing) return;
    if (event.target.closest("a, button, input, textarea, select, label, form")) return;
    if (replyHref) navigate(replyHref);
  }

  function handleKeyDown(event) {
    if (editing) return;
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (replyHref) navigate(replyHref);
    }
  }

  return (
    <article
      className={`${classPrefix} ${depthClass}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role={replyHref ? "link" : undefined}
      tabIndex={replyHref ? 0 : undefined}
    >
      <div className="discussion-card__header">
        <ProfileAvatar
          userId={authorId}
          alt={username}
          className="discussion-card__avatar"
        />

        <div className="discussion-card__meta">
          <div className="discussion-card__user-info">
            {!isReply && courseId && (
              <Link
                to={coursePath(courseId)}
                className="discussion-card__forum"
                onClick={(event) => event.stopPropagation()}
              >
                c/{courseCode || "course"}
              </Link>
            )}
            <span className="discussion-card__username">{username}</span>
            <span className="discussion-card__faculty">{faculty}</span>
            <span className="discussion-card__time">{timeStr}</span>
            {merged.edited && <span className="discussion-card__edited">edited</span>}
            {canEditPost && !isDeleted && (
              <div
                className="discussion-card__actions"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={editing ? "discussion-card__action-cancel" : "discussion-card__action-edit"}
                  onClick={toggleEdit}
                >
                  {editing ? (
                    <>
                      <i className="bi bi-x" /> Cancel
                    </>
                  ) : (
                    <>
                      <i className="bi bi-pencil-square" /> Edit
                    </>
                  )}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="discussion-card__action-delete"
                    onClick={handleDelete}
                  >
                    <i className="bi bi-trash3-fill" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isDeleted ? (
        <p className="discussion-card__deleted">This post has been deleted</p>
      ) : editing ? (
        <form className="discussion-card__edit-form" onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          {(!isReply || titleText) && (
            <div className="discussion-card__field">
              <label htmlFor={`edit-title-${discussionId}`}>Title</label>
              <input
                id={`edit-title-${discussionId}`}
                name="title"
                type="text"
                value={draft.title}
                onChange={handleDraftChange}
                maxLength={LIMITS.DISCUSSION_TITLE_MAX}
              />
            </div>
          )}
          <div className="discussion-card__field">
            <label htmlFor={`edit-content-${discussionId}`}>Content</label>
            <textarea
              id={`edit-content-${discussionId}`}
              name="content"
              rows={4}
              value={draft.content}
              onChange={handleDraftChange}
              maxLength={LIMITS.DISCUSSION_CONTENT_MAX}
            />
          </div>
          <div className="discussion-card__field">
            <label htmlFor={`edit-file-${discussionId}`}>
              {hasImage ? "Update image:" : "Attach an image:"}
            </label>
            <input
              id={`edit-file-${discussionId}`}
              ref={fileInputRef}
              type="file"
              name="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {editing && (file || hasImage) && !removeImage && (
            <div className="discussion-card__image-preview">
              <img
                src={
                  file
                    ? URL.createObjectURL(file)
                    : `/api/discussion/${discussionId}/image`
                }
                alt=""
                width={100}
              />
              <button type="button" className="discussion-card__remove-image" onClick={resetFile}>
                <i className="bi bi-trash3-fill" /> Remove image
              </button>
            </div>
          )}
          {error ? <p className="discussion-card__error">{error}</p> : null}
          <button type="submit" className="discussion-card__save">
            Save
          </button>
        </form>
      ) : (
        <>
          {titleText ? <h3 className="discussion-card__title">{titleText}</h3> : null}
          <p className="discussion-card__content">{bodyText}</p>

          {hasImage && discussionId && (
            <img
              src={`/api/discussion/${discussionId}/image`}
              alt="Discussion image"
              className="discussion-card__image"
            />
          )}
        </>
      )}

      <div className="discussion-card__footer">
        <VoteControls
          targetId={discussionId}
          targetType="Discussion"
          initialUpvotes={merged.upvotes ?? merged.up_votes ?? 0}
          initialDownvotes={merged.downvotes ?? merged.down_votes ?? 0}
          initialHasUpvote={Boolean(merged.hasUpvote)}
          initialHasDownvote={Boolean(merged.hasDownvote)}
          buttonClassName="discussion-card__vote"
          activeClassName="active"
        />
        {typeof onReplyClick === "function" ? (
          <button
            className="discussion-card__reply"
            title="Reply"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReplyClick(data);
            }}
          >
            <i className="bi bi-chat"></i>
            <span>{merged.replies ?? 0}</span>
          </button>
        ) : replyHref ? (
          <Link
            className="discussion-card__reply"
            title="Reply"
            to={replyHref}
            onClick={(event) => event.stopPropagation()}
          >
            <i className="bi bi-chat"></i>
            <span>{merged.replies ?? 0}</span>
          </Link>
        ) : (
          <button
            className="discussion-card__reply"
            title="Reply"
            type="button"
            disabled
            onClick={(event) => event.stopPropagation()}
          >
            <i className="bi bi-chat"></i>
            <span>{merged.replies ?? 0}</span>
          </button>
        )}
      </div>
    </article>
  );
}