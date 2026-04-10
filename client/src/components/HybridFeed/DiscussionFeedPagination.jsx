import "./DiscussionFeedPagination.css";

export default function DiscussionFeedPagination({
  page,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}) {
  return (
    <div className="discussion-feed-pagination" role="navigation" aria-label="Discussion pagination">
      <button
        type="button"
        className="discussion-feed-pagination__button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
      >
        Previous
      </button>

      <span className="discussion-feed-pagination__page">Page {page}</span>

      <button
        type="button"
        className="discussion-feed-pagination__button"
        onClick={onNext}
        disabled={!canGoNext}
      >
        Next
      </button>
    </div>
  );
}