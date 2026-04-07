import * as commonService from "../services/commonService.js";

export async function search(req, res) {
    console.log("request received");
    const searchTerm = req.query.term;

    if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
        res.status(400).json({ error: "Search term is required" });
        return;
    }

    const results = await commonService.search(searchTerm);
    res.json({ searchResults: results });
}

export async function feed(req, res) {
    try {
        const allowedTypes = new Set(["discussion", "resource", "course"]);
        const rawTypes = (req.query.types ?? "discussion,resource,course")
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        const types = rawTypes.filter((t) => allowedTypes.has(t));
        if (types.length === 0) {
            return res.status(400).json({ error: "Invalid types query param" });
        }

        const courseId = req.query.courseId?.trim() || null;
        const courseIds = (req.query.courseIds ?? "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        const sort = (req.query.sort ?? "newest").toLowerCase() === "oldest" ? "oldest" : "newest";
        const limit = Math.max(1, Math.min(Number(req.query.limit ?? 20), 100));

        const data = await commonService.feed({
            types,
            courseId,
            courseIds,
            sort,
            limit,
        });

        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

