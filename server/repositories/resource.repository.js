import { Resource } from "../models/resource.js";

export async function get(id) {
    return await Resource.findById(id);
}

export async function findAll() {
    return await Resource.find().sort({ createdAt: -1 });
}

// ids = courseIds
export async function findByIds(ids) {
    return await Resource.find({ courseId: { $in: ids } }).sort({ createdAt: -1 });
}

export async function create(resourceData) {
    return await Resource.create(resourceData);
}

export async function update(id, updatedData) {
    return await Resource.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
}

export async function remove(id) {
    return await Resource.findByIdAndDelete(id);
}