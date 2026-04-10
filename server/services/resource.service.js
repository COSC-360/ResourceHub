import * as resourceRepository from '../repositories/resource.repository.js';

export async function get(id) {
    return await resourceRepository.get(id);
}

export async function findAll() {
    return await resourceRepository.findAll();
}

// ids = courseIds
export async function findByIds(ids) {
    return await resourceRepository.findByIds(ids);
}

export async function create(data) {
    return await resourceRepository.create(data);
}

export async function update(id, data) {
    const existingData = await resourceRepository.get(id);
    if (!existingData) {
        throw new Error("Resource not found");
    }
    return await resourceRepository.update(id, data);
}

export async function remove(id) {
    const existingData = await resourceRepository.get(id);
    if (!existingData) {
        throw new Error("Resource not found");
    }
    return await resourceRepository.remove(id);
}