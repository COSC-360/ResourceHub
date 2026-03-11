import "./SearchBar.css"

export function SearchBar(){
    async function search(e){
        e.preventDefault();
        const input = document.getElementById("search");
        const term = input.value;             
        if(!term.trim()) return;
        //TODO: Make a common api for all routes instead of making the call within the react components
        const res = await fetch(`/api/common/search?term=${encodeURIComponent(term)}`);
        const data = await res.json();
        const p = document.getElementById("temp");
        const results = data.searchResults || [];
        if (results.length !== 0) {
            p.textContent = results.join(", ");
        } else {
            p.textContent = "No results found";
        }
       
    }

    return (
        <div className="searchBarContainer">
            <form id="searchForm" onSubmit={search}>
                <img src="/src/assets/search-icon.svg" alt="search" className="searchIcon" />
                <input id="search" placeholder="Search" className="searchBar" />
            </form>
            <div id="temporaryResults">
                <p id="temp"></p>
            </div>
        </div>
    )
}