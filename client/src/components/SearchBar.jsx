import "./css/SearchBar.css"

export function SearchBar(){
    return (
        <div className="searchBarContainer">
            <input id="search" placeholder="Search" className="searchBar" />
            <img src="/src/assets/search-icon.svg" alt="search" className="searchIcon" />
        </div>
    )
}