import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";

const DiscussionSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  image: { type: String, default: null },
  content: { type: String, required: true },
  username: { type: String, required: true },
  faculty: { type: String, default: "None" },
  authorId: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  replies: { type: Number, default: 0 },
  parentid: { type: String },
});

export const Discussion = mongoose.model("Discussion", DiscussionSchema);
