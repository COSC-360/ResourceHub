import { useNavigate } from 'react-router-dom';
import { searchPathWithTerm } from '../../constants/RouteConstants.jsx';
import "./SearchBar.css"

export function SearchBar(){
    const navigate = useNavigate();

    async function search(e){
        e.preventDefault();
        const input = document.getElementById("search");
        const term = input.value;             
        if(!term.trim()) return;
        navigate(searchPathWithTerm(term));
        input.value = "";
    }

    return (
            <form id="searchForm" className="searchBarContainer" onSubmit={search}>
                <button type="submit" className="searchIconButton" aria-label="Search">
                    <img src="/src/assets/search-icon.svg" alt="" className="searchIcon" />
                </button>
                <input id="search" placeholder="Search" className="searchBar" />
            </form>
    )
}

export default SearchBar;