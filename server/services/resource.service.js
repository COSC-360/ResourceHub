import { Resource } from '../models/resource.js';
import * as resourceRepository from './resource.repository.js';

export function get(id) {
    const data = resourceRepository.get(id);
    return new Resource(data);
}

export function create(data) {
    const newResource = new Resource(data);
    return resourceRepository.create(newResource);
}

export function update(id, data) {
    const existingData = resourceRepository.get(id);
    if (!existingData) {
        throw new Error('Resource not found');
    }
    const updatedResource = new Resource({ ...existingData, ...data });
    return resourceRepository.update(id, updatedResource);
}

export function remove(id) {
    resourceRepository.remove(id);
}