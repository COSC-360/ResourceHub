import { Course } from "../models/course.js";

export const courseRepository = {
    async findById(id) {
        return Course.findById(id);
    },

    async findAll() {
        /**
         * Retreives all courses from the database, sorted by creation date (newest first).
         * @returns {Promise<Array>} An array of course objects.
         */
        return Course.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    },

    async findByCode(code) {
        return Course.findOne({ code });
    },

    async save(course) {
        console.log("Saving course:", course);
        return Course.create(course);
    },

    async update(id, updatedData) {
        return Course.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true, runValidators: true },
        );
    },

    async updateImage(id, imageUrl) {
        return Course.findByIdAndUpdate(
            id,
            { $set: { image: imageUrl } },
            { new: true, runValidators: true },
        );
    },

    async deleteCourse(id) {
        return Course.findByIdAndDelete(id);
    },
};

export default courseRepository;
