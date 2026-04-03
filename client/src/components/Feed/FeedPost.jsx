import React, { useState, useRef } from "react";
import { apiClient } from "../../lib/api-client";
import "./Feed.css";
import defaultProfile from "../../assets/profile.svg";

export const FeedPost = ({ post_props }) => {
  const [edit, setEdit] = useState(false);
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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

          {edit ? <input type="submit" className="edit" value="Post" /> : null}
        </form>
        {!edit && post_props.hasImage ? (
          <img
            src={`http://localhost:3000/api/discussion/${post_props._id}/image`}
            alt="attached image"
          />
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
