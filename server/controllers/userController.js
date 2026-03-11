import * as userService from "../services/userService.js"

export function getUserById(req, res) {
    const id = req.body;

    if (!id || typeof id !== "string" || !id.trim()) {
        res.status(400).json({ error: "Id is required" });
        return;
    }

    const user = userService.getUserById(id.trim());
    res.json({ data: user });
}

export function updateProfile(req, res) {
    const id = req.body.id;
    const body = req.body.data;

    if(id || typeof id !== "string" || !id.trim()){
        res.status(400).json({ error: "Id is required" });
        return;
    }

    const user = userService.updateProfile(id, body);
    res.json({ data: user });
}