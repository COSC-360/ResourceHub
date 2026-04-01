import mongoose from "mongoose";

const DiscussionSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: String, default: null },
  title: { type: String, default: null },
  content: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Discussion", default: null }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export const Discussion = mongoose.model("Discussion", DiscussionSchema);
