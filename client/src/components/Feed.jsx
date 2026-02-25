import React from "react";
import FeedPost from "../components/FeedPost";

const feed = () => {
  const details = {
    username: "User1234",
    timeline: "2 days ago",
    faculty: "Computer Science",
    comment:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna.",
    up_votes: 200,
    down_votes: 550,
    replies: 100,
  };

  const detail2 = {
    username: "User4",
    timeline: "6 days ago",
    faculty: "Psychology Science",
    comment:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna.",
    up_votes: 200,
    down_votes: 550,
    replies: 100,
  };

  const detailArray = [details, detail2];

  return (
    <div>
      {detailArray.map((obj, index) => (
        <FeedPost post_props={obj} key={index} />
      ))}
    </div>
  );
};

export default feed;
