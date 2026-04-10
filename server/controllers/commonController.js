import * as commonService from "../services/commonService.js";
import * as voteService from "../services/voteService.js";
import mongoose from "mongoose";

const SEARCH_ALLOWED_TYPES = new Set(["discussion", "course"]);

function parseCsv(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
            .filter(Boolean);
    }

    if (typeof value !== "string") return [];

    const raw = value.trim();
    if (!raw) return [];

    if (raw.startsWith("[") && raw.endsWith("]")) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((item) => String(item).trim())
                    .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
                    .filter(Boolean);
            }
        } catch {
            // fall through to CSV parsing
        }
    }

    return raw
        .split(/[\n,]/)
        .map((item) => item.trim())
        .map((item) => item.replace(/^['"]+|['"]+$/g, ""))
        .filter(Boolean);
}

function hasInvalidObjectId(ids = []) {
    return ids.some((id) => !mongoose.Types.ObjectId.isValid(id));
}

function parseSearchTypes(value) {
    const parsed = parseCsv(value).map((item) => item.toLowerCase());
    if (parsed.length === 0) return ["discussion", "course"];

    const types = parsed.filter((type) => SEARCH_ALLOWED_TYPES.has(type));
    if (types.length === 0) return null;
    return types;
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

    const courseIds = parseCsv(req.query.courseIds);
    if (courseIds.length && hasInvalidObjectId(courseIds)) {
        return res.status(400).json({
            error: "Invalid courseIds. Use comma-separated Mongo ObjectIds.",
        });
    }

    const types = parseSearchTypes(req.query.types);
    if (!types) {
        return res.status(400).json({ error: "Invalid types query param" });
    }

    try {
        const results = await commonService.search({
            term: searchTerm,
            courseIds,
            types,
            sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
            page: parsePositiveInt(req.query.page, 1),
            limit: Math.min(parsePositiveInt(req.query.limit, 20), 100),
            deleted: parseBoolean(req.query.deleted),
            edited: parseBoolean(req.query.edited),
            hasReplies: parseBoolean(req.query.hasReplies),
            topLevelOnly: parseBoolean(req.query.topLevelOnly) ?? true,
        });

        return res.json({ searchResults: results });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ error: message });
    }
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

