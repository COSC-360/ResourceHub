import { Course } from "../models/course.js";

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const courseRepository = {
    async findById(id) {
        return Course.findById(id);
    },

    async findByIds(ids) {
        return Course.find({ _id: { $in: ids } });
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

    async adjustMemberCount(id, delta) {
        return await Course.findByIdAndUpdate(
            id,
            [
                {
                    $set: {
                        memberCount: {
                            $max: [0, { $add: [{ $ifNull: ["$memberCount", 0] }, delta] }],
                        },
                    },
                },
            ],
            { new: true },
        );
    },

    async setMemberCount(id, count) {
        return await Course.findByIdAndUpdate(
            id,
            { $set: { memberCount: Math.max(0, Number(count) || 0) } },
            { new: true, runValidators: true },
        );
    },

    async incrementMemberCount(id) {
        return await Course.findByIdAndUpdate(
            id,
            { $inc: { memberCount: 1 } },
            { new: true, runValidators: true },
        );
    },

    async decrementMemberCount(id) {
        return await Course.findByIdAndUpdate(
            id,
            { $inc: { memberCount: -1 } },
            { new: true, runValidators: true },
        );
    },

    async findRecent({ scopedCourseIds = null, limit = 20 } = {}) {
        const query =
            Array.isArray(scopedCourseIds) && scopedCourseIds.length
                ? { _id: { $in: scopedCourseIds } }
                : {};

        return Course.find(query).sort({ createdAt: -1, _id: -1 }).limit(limit);
    },

    async search({ term, scopedCourseIds = null, limit = 20, page = 1, sortOrder = "desc" } = {}) {
        const query = {};

        if (Array.isArray(scopedCourseIds) && scopedCourseIds.length) {
            query._id = { $in: scopedCourseIds };
        }

        if (typeof term === "string" && term.trim()) {
            const normalizedTerm = term.trim().slice(0, 120);
            const escapedTerm = escapeRegex(normalizedTerm);
            query.$or = [
                { name: { $regex: escapedTerm, $options: "i" } },
                { code: { $regex: escapedTerm, $options: "i" } },
                { description: { $regex: escapedTerm, $options: "i" } },
            ];
        }

        const direction = sortOrder === "asc" ? 1 : -1;
        const offset = Math.max(0, (Math.max(1, Number(page) || 1) - 1) * (Math.max(1, Number(limit) || 20)));

        return Course.find(query)
            .sort({ createdAt: direction, _id: direction })
            .skip(offset)
            .limit(Math.max(1, Number(limit) || 20));
    },
};

export default courseRepository;
