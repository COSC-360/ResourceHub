import * as resourceService from "../services/resource.service.js";
import { pushNewResourceNotification } from "../services/notificationPush.js";

export async function get(req, res) {
    try {
        const { id } = req.params;
        const resource = await resourceService.get(id);

        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        return res.json(resource);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function getAll(req, res) {
    try {
        const courseIds = (req.query.courseIds ?? "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        const data = courseIds.length
            ? await resourceService.findByIds(courseIds)
            : await resourceService.findAll();

        return res.json({ data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function create(req, res) {
    try {
        const data = req.body;
        const newResource = await resourceService.create(data);
        void pushNewResourceNotification(newResource);
        return res.status(201).json(newResource);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export async function update(req, res) {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedResource = await resourceService.update(id, data);
        return res.json(updatedResource);
    } catch (error) {
        if (error.message === "Resource not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}

export async function remove(req, res) {
    try {
        const { id } = req.params;
        await resourceService.remove(id);
        return res.status(204).send();
    } catch (error) {
        if (error.message === "Resource not found") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: error.message });
    }
}