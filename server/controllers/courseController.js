import * as courseService from '../services/courseService.js';

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