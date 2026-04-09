import { useState } from "react";
import "./DiscussionFeedControls.css";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "updatedAt", label: "Recently updated" },
  { value: "upvotes", label: "Most upvoted" },
  { value: "downvotes", label: "Most downvoted" },
  { value: "replies", label: "Most replies" },
  { value: "score", label: "Best score" },
];

export default function DiscussionFeedControls({
  filters,
  onChange,
  onReset,
  courseScope = "any",
  onCourseScopeChange,
  disableMyCourses = false,
  hintMessage = "",
}) {
  const [open, setOpen] = useState(false);

  function handleCheckbox(name) {
    return (event) => {
      onChange({ [name]: event.target.checked });
    };
  }

  function handleSelect(name) {
    return (event) => {
      onChange({ [name]: event.target.value });
    };
  }

  return (
    <div className="discussion-feed-controls">
      <div className="discussion-feed-controls__bar">
        <button
          type="button"
          className="discussion-feed-controls__button"
          onClick={() => setOpen((prev) => !prev)}
        >
          <i className="bi bi-funnel" />
          {open ? "Hide filters" : "Show filters"}
        </button>

        <div className="discussion-feed-controls__selects">
          <label>
            Sort
            <select value={filters.sortBy} onChange={handleSelect("sortBy")}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Order
            <select value={filters.sortOrder} onChange={handleSelect("sortOrder")}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>

          {onCourseScopeChange && (
            <label>
              Course scope
              <select
                value={courseScope}
                onChange={(event) => onCourseScopeChange(event.target.value)}
              >
                <option value="any">Any course</option>
                <option value="my" disabled={disableMyCourses}>My courses</option>
              </select>
            </label>
          )}
        </div>

        <button
          type="button"
          className="discussion-feed-controls__button discussion-feed-controls__button--ghost"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      {open && (
        <div className="discussion-feed-controls__panel">
          {hintMessage && <p className="discussion-feed-controls__hint">{hintMessage}</p>}

          <div className="discussion-feed-controls__toggles">
            <label>
              <input
                type="checkbox"
                checked={Boolean(filters.topLevelOnly)}
                onChange={handleCheckbox("topLevelOnly")}
              />
              Top-level only
            </label>

            <label>
              <input
                type="checkbox"
                checked={Boolean(filters.hasReplies)}
                onChange={handleCheckbox("hasReplies")}
              />
              Has replies only
            </label>

            <label>
              <input
                type="checkbox"
                checked={Boolean(filters.deleted)}
                onChange={handleCheckbox("deleted")}
              />
              Deleted only
            </label>

            <label>
              <input
                type="checkbox"
                checked={Boolean(filters.edited)}
                onChange={handleCheckbox("edited")}
              />
              Edited only
            </label>
          </div>
        </div>
      )}
    </div>
  );
}