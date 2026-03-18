import * as commonService from "../services/commonService.js"

export function search(req, res) {
    console.log("request received");
    const searchTerm = req.query.searchTerm;

    if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
        res.status(400).json({ error: "Search term is required" });
        return;
    }
    
    const results = commonService.search(searchTerm);
    res.json({ searchResults: results });
}
