import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export const CourseModel = mongoose.model("Course", CourseSchema);