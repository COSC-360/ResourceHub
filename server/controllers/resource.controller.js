import * as resourceService from './resource.service.js';

export function get(req, res) {
    const { id } = req.params;
    const resource = resourceService.get(id);
    res.json(resource);
}

export function create(req, res) {
    const data = req.body;
    const newResource = resourceService.create(data);
    res.status(201).json(newResource);
}

export function update(req, res) {
    const { id } = req.params;
    const data = req.body;
    const updatedResource = resourceService.update(id, data);
    res.json(updatedResource);
}

export function remove(req, res) {
    const { id } = req.params;
    resourceService.remove(id);
    res.status(204).send();
}