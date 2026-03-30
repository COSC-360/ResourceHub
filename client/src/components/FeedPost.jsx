import React from "react";
import "./css/Feed.css";

const FeedPost = ({ post_props }) => {
  return (
    <div className="post">
      <img src={post_props.pfp} />
      <div className="post-container">
        <div className="post-header">
          <h2 className="username">{post_props.username}</h2>
          <p className="details">• {post_props.timeline}</p>
          <p className="details">• {post_props.faculty}</p>
          {post_props.isAuthor ? (
            <button className="edit">
              <i class="bi bi-pencil-square" />
              Edit
            </button>
          ) : null}
        </div>

        <p>{post_props.comment}</p>

        <img src={post_props.post_image} />

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
