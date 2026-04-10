import * as courseService from '../services/courseService.js';
import mongoose from 'mongoose';
import { CourseCodeAlreadyExistsError } from '../errors/courseErrors.js';
import * as discussionService from '../services/discussionService.js';
import { getIO } from "../socket.js";

export async function getById(req, res) {
    try {
        // 1. extract the course id from the request parameters (in URL)
        const { id } = req.params;

        // 2. validate the course id (must be a valid MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid course id" });
        }

        // 3. call the course service to get the course by id
        const course = await courseService.getById(id);

        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        return res.status(200).json({ data: course });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function create(req, res) {
  try {
    const { name, code, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Course name is required and must be a string" });
    }
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Course code is required and must be a string" });
    }

    // get logged-in user id from token middleware
    const creatorUserId = req.user?.id || req.user?._id || req.user?.userId;
    if (!creatorUserId) {
      return res.status(401).json({ error: "Unauthorized: missing user id in token" });
    }

    const course = {
      name: name.trim(),
      code: code.trim(),
      description: typeof description === "string" ? description.trim() : "",
    };

    // IMPORTANT: pass creatorUserId
    const createdCourse = await courseService.create(course, creatorUserId);

    console.log("Emitting course:created to courses:lobby", createdCourse._id);

    getIO().to("courses:lobby").emit("course:created", {
    course: createdCourse,
    });

    return res.status(201).json({ data: createdCourse });
  } catch (error) {
    if (error instanceof CourseCodeAlreadyExistsError) {
      return res.status(409).json({ error: error.message });
    }

    if (error?.code === 11000 && error?.keyPattern?.code) {
      return res.status(409).json({ error: "Course with this code already exists" });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
}

export async function getAll(req, res) {
    const courses = await courseService.getAll();
    return res.status(200).json({ data: courses });
}

export async function update(req, res) {
    try {
        // 1. extract the course id from the request parameters (in URL)
        const { id } = req.params;

        // 2. validate the course id (must be a valid MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid course id" });
        }

        //    extract the updated course data from the request body
        //    some fields may be optional, but at least one must be provided for update
        const allowedFields = ['name', 'code', 'description'];
        const updates = {};

        for (const field of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "At least one field (name, code, description) must be provided for update" });
        }

        // 3. validate the updated course data (basic validation)
        // - at least one field must be provided for update
        if ("name" in updates) {
            if (typeof updates.name !== 'string' || updates.name.trim() === '') {
                return res.status(400).json({ error: 'Invalid course name' });
            }
            updates.name = updates.name.trim();
        }

        if ("code" in updates) {
            if (typeof updates.code !== 'string' || updates.code.trim() === '') {
                return res.status(400).json({ error: 'Invalid course code' });
            }
            updates.code = updates.code.trim();
        }

        if ("description" in updates) {
            if (typeof updates.description !== 'string') {
                return res.status(400).json({ error: 'Invalid course description' });
            }
            updates.description = updates.description.trim();
        }

        // 4. call the course service to update the course
        const updatedCourse = await courseService.update(id, updates);

        if (!updatedCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        return res.status(200).json({ data: updatedCourse });
    } catch (error) {
        if (error instanceof CourseCodeAlreadyExistsError) {
            return res.status(409).json({ error: error.message });
        }
        if (error?.code === 11000 && error?.keyPattern?.code) {
            return res.status(409).json({ error: "Course with this code already exists" });
        }
        return res.status(500).json({ error: error.message });
    }
}

export async function updateImage(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid course id" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const updatedCourse = await courseService.updateImage(id, imageUrl);

        if (!updatedCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        return res.status(200).json({ data: updatedCourse });
    } catch (error) {
        if (error?.message === "Only image files are allowed") {
            return res.status(400).json({ error: error.message });
        }
        if (error?.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "Image too large (max 5MB)" });
        }
        return res.status(500).json({ error: error.message });
    }
}

export async function deleteCourse(req, res) {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid course id" });
        }

        const deletedCourse = await courseService.deleteCourse(id);

        if (!deletedCourse) {
            return res.status(404).json({ error: "Course not found" });
        }

        return res.status(200).json({ data: deletedCourse });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function getDiscussions(req, res) {
    /**
     * takes the course id from the request parameters, validates it, and retrieves all discussions for that course from the database.
     * it uses discussionService to get the discussions, and returns them in the response.
     */
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid course id" });
    }

    const discussions = await discussionService.getAllDiscussionsByCourse(id);
    return res.status(200).json({ data: discussions });
}

export async function getResources(_req, _res) {
    //empty
}

export async function getMembers(_req, _res) {
    //empty
}