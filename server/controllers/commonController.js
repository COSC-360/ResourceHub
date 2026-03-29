import * as commonService from "../services/commonService.js"

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
