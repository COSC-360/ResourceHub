import * as commonService from "../services/commonService.js"

export function search(req, res) {
    const searchTerm = req.body;

    if(!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()){
        res.status(400).json({ error: "Id is required" });
        return;
    }
    
    const results = commonService.search(searchTerm);
    res.json({ searchResults: results });
}
