import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { apiClient } from "../../lib/api-client";
import "./Feed.css";
import Comment from "../Comment/Comment";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar.jsx";
import { useNavigate } from "react-router-dom";
import { LOGIN_ROUTE } from "../../constants/RouteConstants.jsx";
import { createdAtFromObjectId } from "../../lib/dateUtils";
import { displayFaculty } from "../../lib/userUtils";
import {
  LIMITS,
  trimStr,
  validateDiscussionEdit,
} from "../../lib/formValidation.js";
import { socket } from "../../socket";

export const FeedPost = ({ post_props, depth, expandDown }) => {
  const [edit, setEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [commentBox, showCommentBox] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const [upvotes, setUpvotes] = useState(post_props.up_votes);
  const [hasUpvote, setHasUpvote] = useState(post_props.hasUpvote);
  const [downvotes, setDownvotes] = useState(post_props.down_votes);
  const [hasDownvote, setHasDownvote] = useState(post_props.hasDownvote);
  const [replies, setReplies] = useState(post_props.replies);
  const [username, setUsername] = useState("Unknown User");
  const [faculty, setFaculty] = useState("No Faculty");

  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [deleted, setDeleted] = useState(post_props.deleted);

  const router = useNavigate();
  const seenReplyIdsRef = useRef(new Set());
  const showCommentsRef = useRef(showComments);
  const [postedAt] = useState(
    () =>
      post_props.createdAt ||
      createdAtFromObjectId(post_props._id || post_props.id) ||
      post_props.timeline ||
      null,
  );

  useEffect(() => {
    showCommentsRef.current = showComments;
  }, [showComments]);

  const loadReplies = useCallback(async () => {
    try {
      const auth = localStorage.getItem("access_token");
      const discussions = await apiClient(
        `/api/discussion/replies/${post_props._id}`,
        {
          headers: auth ? { Authorization: `Bearer ${auth}` } : {},
        },
      );
      const rows = Array.isArray(discussions) ? discussions : (discussions?.data ?? []);
      const transformedData = rows.map((discussion) => ({
        username: discussion.username,
        title: discussion.title,
        timeline:
          discussion.createdAt ||
          createdAtFromObjectId(discussion._id || discussion.id),
        createdAt: discussion.createdAt,
        updatedAt: discussion.updatedAt,
        faculty: discussion.faculty,
        comment: discussion.content,
        up_votes: discussion.upvotes,
        down_votes: discussion.downvotes,
        replies: discussion.replies,
        _id: discussion._id,
        isAuthor: discussion.isAuthor,
        parentid: discussion.parentId,
        edited: discussion.edited,
        hasImage: discussion.hasImage,
        hasUpvote: discussion.hasUpvote,
        hasDownvote: discussion.hasDownvote,
        deleted: discussion.deleted,
        authorid: discussion.authorId,
        courseId: discussion.courseId,
      }));
      transformedData.forEach((row) => {
        const id = row._id;
        if (id != null) seenReplyIdsRef.current.add(String(id));
      });
      setComments(transformedData);
      setReplies(transformedData.length);
    } catch (err) {
      console.log(err);
    }
  }, [post_props._id]);

  const fetchComments = () => {
    if (replies <= 0) {
      setShowComments((open) => !open);
      return;
    }
    setShowComments((open) => {
      if (!open) void loadReplies();
      return !open;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
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
  };

  const resetFile = () => {
    if (file && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
    if (!file) setRemoveImage(true);
  };

  const handleDelete = () => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        await apiClient(`/api/discussion/${post_props._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setEdit(false);
        setDeleted(true);
      } catch (err) {
        setError(err.message || "Delete failed");
      }
    })();
  };

  const handleUpvote = () => {
    try {
      (async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router(LOGIN_ROUTE);
          return;
        }
        let result = null;
        if (hasUpvote || hasDownvote) {
          result = await apiClient("/api/vote/remove", {
            body: { targetType: "Discussion", targetId: post_props._id },
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (hasDownvote) {
            setDownvotes(downvotes - 1);
            setHasDownvote(false);
          }
        }
        if (!hasUpvote) {
          result = await apiClient("/api/vote/up", {
            body: { targetType: "Discussion", targetId: post_props._id },
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          setUpvotes(upvotes + 1);
          setHasUpvote(true);
        } else {
          setUpvotes(upvotes - 1);
          setHasUpvote(false);
        }
        console.log(result.data);
      })();
    } catch (error) {
      console.log("Could not vote: " + error);
    }
  };

  const handleDownvote = () => {
    try {
      (async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router(LOGIN_ROUTE);
          return;
        }
        let result = null;
        if (hasUpvote || hasDownvote) {
          result = await apiClient("/api/vote/remove", {
            body: { targetType: "Discussion", targetId: post_props._id },
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (hasUpvote) {
            setUpvotes(upvotes - 1);
            setHasUpvote(false);
          }
        }
        if (!hasDownvote) {
          result = await apiClient("/api/vote/down", {
            body: { targetType: "Discussion", targetId: post_props._id },
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          setDownvotes(downvotes + 1);
          setHasDownvote(true);
        } else {
          setDownvotes(downvotes - 1);
          setHasDownvote(false);
        }
        console.log(result.data);
      })();
    } catch (error) {
      console.log("Could not vote: " + error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const editErr = validateDiscussionEdit({
      isReply: Boolean(post_props.parentid),
      hadTitle: Boolean(post_props.title),
      draftTitle: formData.title,
      originalTitle: post_props.title,
      draftContent: formData.content,
      originalContent: post_props.comment,
    });
    if (editErr) {
      setError(editErr);
      return;
    }
    const nextTitle =
      trimStr(formData.title) || trimStr(post_props.title);
    const nextContent =
      trimStr(formData.content) || trimStr(post_props.comment);
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const data = new FormData();
        data.append("title", nextTitle);
        data.append("content", nextContent);
        data.append("updatedImage", file ? true : removeImage);
        if (file || removeImage) data.append("file", file);

        await apiClient(`/api/discussion/${post_props._id}`, {
          method: "PATCH",
          body: data,
          headers: { Authorization: `Bearer ${token}` },
        });
        setEdit(false);
        window.location.reload();
      } catch (err) {
        const msg = err.message || "";
        if (msg.includes("Unauthorized") || msg.includes("No access token")) {
          alert("Access token expired please login and try again!");
        } else {
          setError(msg);
        }
      }
    })();
  };

  const timeAgo = (date, currentDate) => {
    if (!date || !currentDate) return "Undefined";

    const seconds = Math.floor((currentDate - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? "s" : ""} ago`;
  };

  const date = useMemo(
    () => (postedAt ? timeAgo(new Date(postedAt), new Date()) : "Undefined"),
    [postedAt],
  );

  useEffect(() => {
    if (!expandDown || replies <= 0) return;
    const id = setTimeout(() => {
      void loadReplies();
    }, 0);
    return () => clearTimeout(id);
  }, [expandDown, replies, loadReplies]);

  useEffect(() => {
    const postId = post_props._id;
    if (!postId) return;

    socket.emit("joinDiscussion", postId);

    function matchesParent(payload) {
      return String(payload?.parentId) === String(postId);
    }

    function handleReplyCreated(payload) {
      if (!matchesParent(payload)) return;
      const rid = payload?.reply?._id ?? payload?.reply?.id;
      if (rid != null) {
        const sid = String(rid);
        if (seenReplyIdsRef.current.has(sid)) return;
        seenReplyIdsRef.current.add(sid);
      }
      setReplies((n) => n + 1);
      if (showCommentsRef.current) void loadReplies();
    }

    function handleReplyUpdated(payload) {
      if (!matchesParent(payload)) return;
      if (showCommentsRef.current) void loadReplies();
    }

    function handleReplyDeleted(payload) {
      if (!matchesParent(payload)) return;
      const rid = payload?.replyId?._id ?? payload?.replyId;
      if (rid != null) seenReplyIdsRef.current.delete(String(rid));
      setReplies((n) => Math.max(0, n - 1));
      if (showCommentsRef.current) void loadReplies();
    }

    socket.on("reply:created", handleReplyCreated);
    socket.on("reply:updated", handleReplyUpdated);
    socket.on("reply:deleted", handleReplyDeleted);

    return () => {
      socket.emit("leaveDiscussion", postId);
      socket.off("reply:created", handleReplyCreated);
      socket.off("reply:updated", handleReplyUpdated);
      socket.off("reply:deleted", handleReplyDeleted);
    };
  }, [post_props._id, loadReplies]);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiClient(
          `http://localhost:3000/api/user/getUserById/${post_props.authorid}`,
        );
        setUsername(response.data.username);
        setFaculty(displayFaculty(response.data.faculty));
      } catch (err) {
        console.log(err);
      }
    })();
  }, [post_props.authorid]);

  return (
    <div
      className={
        post_props.parentid
          ? Number(depth) < 4
            ? "thread_container"
            : "thread_container max_depth"
          : "thread_container root"
      }
    >
      <div className="post">
        <ProfileAvatar
          userId={post_props.authorid}
          alt="profile photo"
          className="pfp"
        />

        <div className="post-container">
          {deleted ? (
            <span className="deleted">This post has been deleted</span>
          ) : (
            <>
              <div className="post-header">
                <div>
                  {!post_props.parentid ? (
                    <h2 className="course">c/</h2>
                    // please dont put coursename, coursecode in the discussion model, courseId is there for a reason. 
                    // use course route GET /api/courses/:courseId (see CoursePage.jsx)
                    // to fetch course details when needed instead of storing redundant data in the discussion model.
                    // Consider the fact that course details can be changed. then the discussions would have outdated 
                    // coursename and coursecode.
                    // <h2 className="course">c/{post_props.coursename}</h2> 
                  ) : null}
                  <h2 className="username">{username}</h2>
                </div>
                <p className="details">• {date}</p>
                <p className="details">• {faculty}</p>
                {post_props.edited && <p className="details faded"> edited</p>}
                {post_props.isAuthor ? (
                  <button
                    className={edit ? "cancel" : "edit"}
                    onClick={() => setEdit(!edit)}
                  >
                    {edit ? (
                      <i className="bi bi-x" />
                    ) : (
                      <i className="bi bi-pencil-square" />
                    )}
                    {edit ? "Cancel" : "Edit"}
                  </button>
                ) : null}
                {edit && (
                  <button className="delete" onClick={handleDelete}>
                    <i className="bi bi-trash3-fill" />
                    Delete
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit}>
                {post_props.title && edit ? (
                  <div className="form-group">
                    <label htmlFor="edited_title">Edit Title:</label>
                    <input
                      type="text"
                      defaultValue={post_props.title}
                      name="title"
                      onChange={handleChange}
                      maxLength={LIMITS.DISCUSSION_TITLE_MAX}
                    />
                  </div>
                ) : (
                  <h1 className="post-title">{post_props.title}</h1>
                )}

                {edit ? (
                  <div className="form-group">
                    <label htmlFor="edited_comment">Edit Comment:</label>
                    <input
                      type="text"
                      defaultValue={post_props.comment}
                      name="content"
                      onChange={handleChange}
                      maxLength={LIMITS.DISCUSSION_CONTENT_MAX}
                    />
                  </div>
                ) : (
                  <p>{post_props.comment}</p>
                )}

                {edit && (
                  <div className="form-group">
                    <label htmlFor="file">
                      {post_props.hasImage
                        ? "Update image:"
                        : "Attach an image:"}
                    </label>
                    <input
                      type="file"
                      id="file"
                      ref={fileInputRef}
                      name="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {edit && (file || post_props.hasImage) && !removeImage && (
                  <div>
                    <img
                      src={
                        file
                          ? URL.createObjectURL(file)
                          : post_props.hasImage && !removeImage
                            ? `http://localhost:3000/api/discussion/${post_props._id}/image`
                            : null
                      }
                      alt="preview"
                      width={100}
                    />
                    <button
                      className="remove_image"
                      type="button"
                      onClick={() => resetFile()}
                    >
                      <i className="bi bi-trash3-fill" /> Remove image
                    </button>
                  </div>
                )}

                {edit && <span className="error">{error}</span>}

                {edit ? (
                  <input type="submit" className="edit" value="Post" />
                ) : null}
              </form>
              {!edit && post_props.hasImage ? (
                <img
                  src={`http://localhost:3000/api/discussion/${post_props._id}/image`}
                  alt="attached image"
                />
              ) : null}
            </>
          )}
          <div className="post-footer">
            <button
              className={hasUpvote ? "footer_button green" : "footer_button"}
              onClick={handleUpvote}
            >
              <i className="bi bi-arrow-up"></i>
              <p className="voteButton">{upvotes}</p>
            </button>
            <button
              className={hasDownvote ? "footer_button red" : "footer_button"}
              onClick={handleDownvote}
            >
              <i className="bi bi-arrow-down"></i>
              <p className="voteButton">{downvotes}</p>
            </button>
            <button
              className="footer_button"
              onClick={() => showCommentBox(!commentBox)}
            >
              <i className="bi bi-chat"></i>
              <br></br>
              <p className="voteButton">{replies}</p>
            </button>
          </div>
        </div>
      </div>

      {commentBox && (
        <Comment
          courseId={post_props.courseId?._id || post_props.courseId}
          parentUsername={post_props.username}
          parentid={post_props._id}
          onSubmit={(created) => {
            showCommentBox(false);
            setShowComments(true);
            const cid = created?._id ?? created?.id;
            if (cid != null) {
              const sid = String(cid);
              if (!seenReplyIdsRef.current.has(sid)) {
                seenReplyIdsRef.current.add(sid);
                setReplies((n) => n + 1);
              }
            } else {
              setReplies((n) => n + 1);
            }
            void loadReplies();
          }}
        />
      )}

      {replies > 0 && (
        <button onClick={fetchComments}>
          {!showComments ? "Show Replies" : "Show Less"}
        </button>
      )}

      {showComments &&
        comments.map((obj) => (
          <FeedPost
            post_props={obj}
            key={obj._id}
            depth={depth + 1}
            expandDown={showComments}
          />
        ))}
    </div>
  );
};

export default FeedPost;
