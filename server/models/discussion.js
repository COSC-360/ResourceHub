import mongoose from "mongoose";

/*
Represents a discussion post within a course, allowing users to create threads and reply to them.
It includes properties like:
    courseId: The ID of the course the discussion belongs to
    authorId: The ID of the user who created the discussion
    image: An optional image URL associated with the discussion
    title: An optional title for the discussion
    content: The main content of the discussion post
    edited: A boolean indicating whether the post has been edited
    upvotes: The number of upvotes the discussion has received, cached. votes are stored in the Vote collection and this field is updated accordingly.
    downvotes: The number of downvotes the discussion has received, cached. votes are stored in the Vote collection and this field is updated accordingly.
    replies: The number of replies to this discussion, cached. This field is updated whenever a new reply is added.
    parentId: If this discussion is a reply, this field references the parent discussion's ID. Otherwise, it is null.
*/

const DiscussionSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coursename: { type: String, ref: "Course" },
    coursecode: { type: String, ref: "Course" },
    username: { type: String, ref: "User" },
    pfp: { type: Buffer, ref: "User" },
    faculty: { type: String, ref: "User", default: "None" },
    image: {
      data: { type: Buffer, default: null },
      contentType: { type: String, default: null },
    },
    deleted: { type: Boolean, default: false },
    title: { type: String, default: null },
    content: { type: String, required: true },
    edited: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      default: null,
    },
    forum: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
); // Automatically adds createdAt and updatedAt fields

DiscussionSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.image;
    return ret;
  },
});

export const Discussion = mongoose.model("Discussion", DiscussionSchema);
