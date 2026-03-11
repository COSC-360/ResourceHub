import fs from 'fs';
import path from 'path';

const resourcesFilePath = path.join(process.cwd(), 'data', 'resources.json');

export function get(id) {
    const resources = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf-8'));
    return resources.find(resource => resource.id === id);
}

export function create(resource) {
    const resources = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf-8'));
    resources.push(resource);
    fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2));
    return resource;
}

export function update(id, updatedResource) {
    const resources = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf-8'));
    const index = resources.findIndex(resource => resource.id === id);
    if (index === -1) {
        throw new Error('Resource not found');
    }
    resources[index] = updatedResource;
    fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2));
    return updatedResource;
}

export function remove(id) {
    const resources = JSON.parse(fs.readFileSync(resourcesFilePath, 'utf-8'));
    const index = resources.findIndex(resource => resource.id === id);
    if (index === -1) {
        throw new Error('Resource not found');
    }
    resources.splice(index, 1);
    fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2));
}