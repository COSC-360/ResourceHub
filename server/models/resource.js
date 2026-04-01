import mongoose from "mongoose";
/*
Represents a resource shared within a course, containing properties such as:
    courseId: The ID of the course the resource belongs to
    authorId: The ID of the user who shared the resource
    name: The name of the resource
    description: A brief description of the resource
    url: The URL where the resource can be accessed
    category: An optional category or tag for the resource (e.g., "lecture notes", "assignment solutions")
    likes: cached, The number of likes the resource has received
    dislikes: cached, The number of dislikes the resource has received
    fileCount: cached, The number of files associated with the resource (if any)
    downloadCount: cached, The number of times the resource has been downloaded
*/
const ResourceSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    category: { type: String, default: "" },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    fileCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export const ResourceModel = mongoose.model("Resource", ResourceSchema);