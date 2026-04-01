import React, { use, useState } from "react";
import axios from "axios";
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
    async function deleteRequest() {
      const token = localStorage.getItem("access_token");
      const response = await axios.delete(
        `http://localhost:3000/api/discussion/${post_props._id}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status !== 200) {
        console.log("Response failed: " + response.data);
        setError(response.data);
        return;
      }
      setEdit(false);
      return;
    }
    deleteRequest();
    window.location.reload();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    async function submitForm() {
      const token = localStorage.getItem("access_token");
      const response = await axios.patch(
        `http://localhost:3000/api/discussion/${post_props._id}`,
        {
          title: formData.title,
          content: formData.content,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(response.data);
      if (response.status === 403) {
        alert("Access token expired please login and try again!");
        return;
      }
      if (!response.status === 200) {
        setError(response.data);
        return;
      }
      setEdit(false);
      return;
    }
    submitForm();
    window.location.reload();
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
