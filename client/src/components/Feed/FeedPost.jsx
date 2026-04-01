import React, { useState } from "react";
import { apiClient } from "../../lib/api-client";
import "./Feed.css";
import defaultProfile from "../../assets/profile.svg";

export const FeedPost = ({ post_props }) => {
  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        await apiClient(`/api/discussion/${post_props._id}`, {
          method: "PATCH",
          body: {
            title: formData.title ? formData.title : post_props.title,
            content: formData.content ? formData.content : post_props.comment,
          },
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
    <div className="post">
      <img
        src={post_props.pfp ? post_props.post_image : defaultProfile}
        alt="profile photo"
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
            <fieldset>
              <label htmlFor="edited_title">Edit Title:</label>
              <input
                type="text"
                defaultValue={post_props.title}
                name="title"
                onChange={handleChange}
              />
            </fieldset>
          ) : (
            <h1 className="post-title">{post_props.title}</h1>
          )}

          {edit ? (
            <fieldset>
              <label htmlFor="edited_comment">Edit Comment:</label>
              <input
                type="text"
                defaultValue={post_props.comment}
                name="content"
                onChange={handleChange}
              />
            </fieldset>
          ) : (
            <p>{post_props.comment}</p>
          )}

          {edit && <span className="error">{error}</span>}

          {edit ? <input type="submit" className="edit" value="Post" /> : null}
        </form>
        {post_props.post_image ? (
          <img src={post_props.post_image} alt="attached image" />
        ) : null}
        <div className="post-footer">
          <i className="bi bi-arrow-up"></i>
          <p>{post_props.up_votes}</p>
          <i className="bi bi-arrow-down"></i>
          <p>{post_props.down_votes}</p>
          <i className="bi bi-chat"></i>
          <p>{post_props.replies}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedPost;
