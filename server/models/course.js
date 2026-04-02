import mongoose from "mongoose";

/*
Represents a course in the system, containing properties such as:
    name: The name of the course
    code: A unique code for the course (e.g., "COSC360")
    description: A brief description of the course
    image: An optional image representing the course
    memberCount: cached, The number of members enrolled in the course
    postCount: cached, The number of posts associated with the course
*/

const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // can't have two COSC221 courses, that would cause the end of the world
    description: { type: String, default: "" },
    image: { type: String, default: null }, // since multer will store the image as a URL or file path
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export const Course = mongoose.model("Course", CourseSchema);
