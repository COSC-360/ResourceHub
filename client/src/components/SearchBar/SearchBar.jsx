import { useState } from "react";
import "./SearchBar.css";

export function SearchBar() {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState("");

    async function handleSearch(e) {
        e.preventDefault();
        const trimmed = searchTerm.trim();

        if (!trimmed) return;

        try {
            const response = await fetch(
                `http://localhost:3000/api/common/search?searchTerm=${encodeURIComponent(trimmed)}`
            );

            const data = await response.json();

            if (!response.ok) {
                setResults([]);
                setMessage(data.error || "Search failed");
                return;
            }

            if (data.searchResults.length === 0) {
                setResults([]);
                setMessage("No results found");
            } else {
                setResults(data.searchResults);
                setMessage("");
            }

            setSearchTerm("");
        } catch (error) {
            console.error("Search error:", error);
            setResults([]);
            setMessage("Could not connect to server");
        }
    }

    return (
        <div className="searchBarContainer">
            <form id="searchForm" onSubmit={handleSearch}>
                <img src="/src/assets/search-icon.svg" alt="search" className="searchIcon" />
                <input id="search" placeholder="Search" className="searchBar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </form>
            <div id="temporaryResults">
                {message && <p id="temp">{message}</p>}

                {results.map((result, index) => (
                    <p key={index}>{result}</p>
                ))}
            </div>
        </div>
    )
}