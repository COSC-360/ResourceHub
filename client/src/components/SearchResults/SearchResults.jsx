import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FeedPost } from "../Feed/FeedPost";
import { apiClient } from "../../lib/api-client";

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

      try {
        const data = await apiClient(
          `/api/common/search?term=${encodeURIComponent(term)}`,
          {
            method: "GET",
          },
        );

        const discussions =
          data?.searchResults?.discussions || data?.discussions || [];

        const transformedData = discussions.map((discussion) => ({
          username: discussion.username,
          title: discussion.title,
          timeline: discussion.timestamp,
          faculty: discussion.faculty,
          comment: discussion.content,
          up_votes: discussion.upvotes,
          down_votes: discussion.downvotes,
          replies: discussion.replies,
          _id: discussion._id,
          isAuthor: discussion.isAuthor,
          edited: discussion.edited,
        }));

        setResults(transformedData);
      } catch (error) {
        console.error("Search API error", error);
        setResults([]);
      }
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
  );
}

export default SearchResults;
