import React, { useState, useRef } from "react";
import { apiClient } from "../../lib/api-client";
import "./Feed.css";
import defaultProfile from "../../assets/profile.svg";
import Comment from "../Comment/Comment";

export const FeedPost = ({ post_props, depth }) => {
  const [edit, setEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [commentBox, showCommentBox] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const [numComments, setNumComments] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const fetchComments = () => {
    setShowComments(!showComments);
    if (post_props.replies <= 0 || showComments) return;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const discussions = await apiClient(
          `/api/discussion/replies/${post_props._id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        const transformedData = discussions.map((discussion) => ({
          username: discussion.username,
          title: discussion.title,
          timeline: discussion.updatedAt,
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
        }));
        setComments(transformedData);
        setNumComments(comments.length);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
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
        window.location.reload();
      } catch (err) {
        setError(err.message || "Delete failed");
      }
    })();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const data = new FormData();
        data.append(
          "title",
          formData.title ? formData.title : post_props.title,
        );
        data.append(
          "content",
          formData.content ? formData.content : post_props.comment,
        );
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
        <img
          src={post_props.pfp ? post_props.post_image : defaultProfile}
          alt="profile photo"
          className="pfp"
        />
        <div className="post-container">
          <div className="post-header">
            <h2 className="username">{post_props.username}</h2>
            <p className="details">• {post_props.timeline}</p>
            <p className="details">• {post_props.faculty}</p>
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
                />
              </div>
            ) : (
              <p>{post_props.comment}</p>
            )}

            {edit && (
              <div className="form-group">
                <label htmlFor="file">
                  {post_props.hasImage ? "Update image:" : "Attach an image:"}
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

          <div className="post-footer">
            <button className="footer_button">
              <i className="bi bi-arrow-up"></i>
              <p>{post_props.up_votes}</p>
            </button>
            <button className="footer_button">
              <i className="bi bi-arrow-down"></i>
              <p>{post_props.down_votes}</p>
            </button>
            <button
              className="footer_button"
              onClick={() => showCommentBox(!commentBox)}
            >
              <i className="bi bi-chat"></i>
              <p>{post_props.replies}</p>
            </button>
          </div>
        </div>
      </div>

      {commentBox && (
        <Comment
          parentUsername={post_props.username}
          parentid={post_props._id}
          onSubmit={() => {
            showCommentBox(false);
            window.location.reload();
          }}
        />
      )}

      {post_props.replies > 0 && (
        <button onClick={fetchComments}>
          {!showComments ? "Show Replies" : "Show Less"}
        </button>
      )}

      {showComments &&
        comments.map((obj) => (
          <FeedPost post_props={obj} key={obj._id} depth={depth + 1} />
        ))}
    </div>
  );
};

export default FeedPost;
