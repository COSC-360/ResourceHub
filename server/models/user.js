import mongoose from "mongoose";

/*
Represents a user in the system, containing properties such as:
    username: The unique username of the user
    email: The unique email address of the user
    password: The hashed password of the user
    bio: A brief biography or description of the user
    posts: cached, The number of posts created by the user
    comments: cached, The number of comments made by the user
    faculty: The faculty or department the user belongs to (e.g., "Engineering")
    pfp: An optional profile picture URL (from multer) for the user
*/

const UserSchema = new mongoose.Schema({
  username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  password: { type: String, required: true }, // it's hashed
  bio: {
      type: String,
      default: "",
    },
  posts: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  faculty: {
      type: String,
      default: "",
    },
  pfp: {
      type: String,
      default: null,
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export const User = mongoose.model("User", UserSchema);

