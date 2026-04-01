import * as courseService from '../services/courseService.js';
import mongoose from 'mongoose';

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

export function create(req, res) {
    const { id, name, code, description, image } = req.body;

    if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Course name is required and must be a string' });
        return;
    }

    if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Course code is required and must be a string' });
        return;
    }

    if (!description || typeof description !== 'string') {
        res.status(400).json({ error: 'Course description is required and must be a string' });
        return;
    }
    console.log('Received course data:', { id, name, code, description, image });

    const course = {
        id,
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        image: image ?? null,
    };

    const createdCourse = courseService.create(course);
    res.status(201).json({ data: createdCourse });
}

export function getAll(req, res) {
  const courses = courseService.getAll();
  res.status(200).json({ data: courses });
}