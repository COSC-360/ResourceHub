import mongoose from "mongoose";

/*
Represents a course membership, linking a user to a course. 
It includes properties like:
    courseId: The ID of the course the user is enrolled in
    userId: The ID of the user who is a member of the course
    role: The role of the user in the course (e.g., 'student', 'instructor')
    joinedAt: Timestamp of when the user joined the course
*/

const MembershipSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "instructor"],
    default: "student",
  },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Ensure a user can only have one membership per course
MembershipSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export const Membership = mongoose.model("Membership", MembershipSchema);