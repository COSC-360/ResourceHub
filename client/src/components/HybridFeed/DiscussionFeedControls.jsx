import { useMemo, useState } from "react";
import "./DiscussionFeedControls.css";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "updatedAt", label: "Recently updated" },
  { value: "upvotes", label: "Most upvoted" },
  { value: "downvotes", label: "Most downvoted" },
  { value: "replies", label: "Most replies" },
  { value: "score", label: "Best score" },
];

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(values) {
  return Array.isArray(values) ? values.join(", ") : "";
}

export default function DiscussionFeedControls({
  filters,
  onChange,
  onReset,
  showCourseIds = true,
}) {
  const [open, setOpen] = useState(false);

  const courseIdsText = useMemo(() => joinList(filters.courseIds), [filters.courseIds]);
  const authorIdsText = useMemo(() => joinList(filters.authorIds), [filters.authorIds]);
  const populateText = useMemo(() => joinList(filters.populate), [filters.populate]);

  function handleTextChange(name) {
    return (event) => {
      onChange({ [name]: parseList(event.target.value) });
    };
  }

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
          {showCourseIds && (
            <label className="discussion-feed-controls__field">
              Course IDs
              <input
                type="text"
                value={courseIdsText}
                onChange={handleTextChange("courseIds")}
                placeholder="id1, id2, id3"
              />
            </label>
          )}

          <label className="discussion-feed-controls__field">
            Author IDs
            <input
              type="text"
              value={authorIdsText}
              onChange={handleTextChange("authorIds")}
              placeholder="author1, author2"
            />
          </label>

          <label className="discussion-feed-controls__field">
            Populate fields
            <input
              type="text"
              value={populateText}
              onChange={handleTextChange("populate")}
              placeholder="courseId, authorId"
            />
          </label>

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