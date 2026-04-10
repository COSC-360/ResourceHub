import * as commonService from "../services/commonService.js";
import * as voteService from "../services/voteService.js";

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

