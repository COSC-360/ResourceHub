import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FeedPost } from "../FeedPost";

export function SearchResults() {
    const location = useLocation();
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            const term = new URLSearchParams(location.search).get("term");
            if (!term || !term.trim()) {
                setResults([]);
                return;
            }

            //TODO: Make a common api for all routes instead of making the call within the react components
            const res = await fetch(`/api/common/search?term=${encodeURIComponent(term)}`);
            const data = await res.json();

            const discussions =
                data?.searchResults?.discussions ||
                data?.discussions ||
                [];

            const transformedData = discussions.map((discussion) => ({
                username: discussion.username,
                timeline: discussion.timestamp,
                faculty: discussion.faculty,
                comment: discussion.content,
                up_votes: discussion.upvotes,
                down_votes: discussion.downvotes,
                replies: discussion.replies,
                _id: discussion._id,
            }));

            setResults(transformedData);
        };
        fetchResults();
    }, [location.search]);


    return (
        <div>
            <h1>Search Results</h1>
            {results.map((obj) => (
                <FeedPost post_props={obj} key={obj._id} />
            ))}
        </div>
    )
}

export default SearchResults;