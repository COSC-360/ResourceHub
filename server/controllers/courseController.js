import * as courseService from '../services/courseService.js';
import mongoose from 'mongoose';
import { CourseCodeAlreadyExistsError } from '../errors/courseErrors.js';

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
        // 1. extract course data from the request body
        const { name, code, description } = req.body;
        console.log('Received course data:', { name, code, description });

        // 2. validate the course data (basic validation)
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Course name is required and must be a string' });
        }

        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Course code is required and must be a string' });
        }

        const course = {
            name: name.trim(),
            code: code.trim(),
            description: typeof description === "string" ? description.trim() : "",
        };

        const createdCourse = await courseService.create(course);
        return res.status(201).json({ data: createdCourse });
    } catch (error) {
        if (error instanceof CourseCodeAlreadyExistsError) {
            return res.status(409).json({ error: error.message });
        }

        // Handles unique-index collisions even if two requests pass pre-check simultaneously
        if (error?.code === 11000 && error?.keyPattern?.code) {
            return res.status(409).json({ error: "Course with this code already exists" });
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
        //    extract the updated course data from the request body
        const { name, code, description } = req.body;

        // 2. validate the course id (must be a valid MongoDB ObjectId)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid course id" });
        }

        // 3. validate the updated course data (basic validation)
        // - at least one field must be provided for update
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function updateImage(req, res) {
    //empty
}

export async function deleteCourse(req, res) {
    //empty
}

export async function join(req, res) {
    //empty
}

export async function leave(req, res) {
    //empty
}

export async function getDiscussions(req, res) {
    //empty
}

export async function getResources(req, res) {
    //empty
}

export async function getMembers(req, res) {
    //empty
}