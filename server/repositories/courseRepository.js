import { Course } from '../models/course.js';

export const courseRepository = {
    async findById(id) {
        const course = await Course.findById(id);
        return course;
    },

    async findAll() {
        return await Course.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    },

    async save(course) {
        const savedCourse = await Course.create(course);
        return savedCourse;
    },
};

export default courseRepository;
