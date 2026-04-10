import * as commonService from "../services/commonService.js";
import * as voteService from "../services/voteService.js";

function parseCsv(value) {
    if (!value || typeof value !== "string") return [];

    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function parseBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;

    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes"].includes(normalized)) return true;
    if (["0", "false", "no"].includes(normalized)) return false;
    return undefined;
}

function parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
}

export async function search(req, res) {
    const searchTerm = req.query.term;

    if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
        res.status(400).json({ error: "Search term is required" });
        return;
    }

    const results = await commonService.search({
        term: searchTerm,
        courseIds: parseCsv(req.query.courseIds),
        sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
        page: parsePositiveInt(req.query.page, 1),
        limit: Math.min(parsePositiveInt(req.query.limit, 20), 100),
        deleted: parseBoolean(req.query.deleted),
        edited: parseBoolean(req.query.edited),
        hasReplies: parseBoolean(req.query.hasReplies),
        topLevelOnly: parseBoolean(req.query.topLevelOnly) ?? true,
    });
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

        const userId = req.user?.id ?? null;

        const data = await commonService.feed({
            types,
            courseId,
            courseIds,
            sort,
            limit,
        });

        const enriched = await Promise.all(
            data.map(async (item) => {
                const doc = item?.data;

                // read image from the original mongoose doc first
                const hasImage = Boolean(
                    (typeof doc?.image === "string" && doc.image.trim()) ||
                    doc?.image?.contentType ||
                    doc?.hasImage
                );

                const base =
                    doc?.toJSON?.() ??
                    doc?.toObject?.() ??
                    doc ??
                    {};

                const { image: _image, ...raw } = base;
                const id = (raw?._id && String(raw._id)) || raw?.id;

                if (item.type === "discussion") {
                    return {
                        ...item,
                        data: {
                            ...raw,
                            hasImage,
                            hasUpvote: userId ? await voteService.hasUpvote(id, userId, "Discussion") : false,
                            hasDownvote: userId ? await voteService.hasDownvote(id, userId, "Discussion") : false,
                        },
                    };
                }

                if (item.type === "resource") {
                    return {
                        ...item,
                        data: {
                            ...raw,
                            hasUpvote: userId ? await voteService.hasUpvote(id, userId, "Resource") : false,
                            hasDownvote: userId ? await voteService.hasDownvote(id, userId, "Resource") : false,
                        },
                    };
                }

                return { ...item, data: raw };
            })
        );

        return res.status(200).json({ data: enriched });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

