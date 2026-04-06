import { Course } from '../models/course.js';

export const courseRepository = {
    async findById(id) {
        const course = await Course.findById(id);
        return course;
    },

    async findAll() {
        /**
         * Retreives all courses from the database, sorted by creation date (newest first).
         * @returns {Promise<Array>} An array of course objects.
         */
        return await Course.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    },

    async findByCode(code) {
        const course = await Course.findOne({ code: code });
        return course;
    },

    async save(course) {
        console.log('Saving course:', course);
        const savedCourse = await Course.create(course);
        return savedCourse;
    },
};

export default courseRepository;
