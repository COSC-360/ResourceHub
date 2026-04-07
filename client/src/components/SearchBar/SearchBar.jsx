import { useNavigate } from 'react-router-dom';
import "./SearchBar.css"

export function SearchBar(){
    const navigate = useNavigate();

    async function search(e){
        e.preventDefault();
        const input = document.getElementById("search");
        const term = input.value;             
        if(!term.trim()) return;
        navigate(`/search?term=${encodeURIComponent(term)}`);
        input.value = "";
    }

    return (
            <form id="searchForm" className="searchBarContainer" onSubmit={search}>
                <img src="/src/assets/search-icon.svg" alt="search" className="searchIcon" />
                <input id="search" placeholder="Search" className="searchBar" />
                <button type="submit" className="searchButton">Search</button>
            </form>
    )
}

export default SearchBar;