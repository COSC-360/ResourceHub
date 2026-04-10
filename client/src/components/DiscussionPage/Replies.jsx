import { useEffect, useState } from "react";
import DiscussionCard from "../Cards/DiscussionCard.jsx";
import { apiClient } from "../../lib/api-client";
import Reply from "./Reply.jsx";
import "./Replies.css";

function pluralizeReplies(count) {
	return count === 1 ? "reply" : "replies";
}

export default function Replies({
	parentId,
	depth = 1,
	expectedCount,
	defaultExpanded = false,
	showToggleLabel = true,
}) {
	const [expanded, setExpanded] = useState(Boolean(defaultExpanded));
	const [loaded, setLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [items, setItems] = useState([]);
	const [activeReplyId, setActiveReplyId] = useState(null);

	const safeExpectedCount = Number.isFinite(Number(expectedCount))
		? Math.max(0, Number(expectedCount))
		: undefined;

	async function loadReplies() {
		if (!parentId) return;

		try {
			setIsLoading(true);
			setError("");

			const token = localStorage.getItem("access_token");
			const headers = token ? { Authorization: `Bearer ${token}` } : {};
			const json = await apiClient(`/api/discussion/replies/${parentId}`, { headers });
			const rows = Array.isArray(json) ? json : (json?.data ?? []);

			setItems(rows);
			setLoaded(true);
		} catch (err) {
			setError(err.message || "Failed to load replies");
			setItems([]);
			setLoaded(true);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (!expanded || loaded) return;
		loadReplies();
	}, [expanded, loaded, parentId]);

	function toggleExpanded() {
		setExpanded((prev) => !prev);
	}

	function resolveCourseId(courseValue) {
		if (!courseValue) return "";
		if (typeof courseValue === "object") return courseValue._id || courseValue.id || "";
		return String(courseValue);
	}

	function handleReplyClick(item) {
		const itemId = item?._id || item?.id;
		if (!itemId) return;
		setActiveReplyId((prev) => (prev === itemId ? null : itemId));
	}

	async function handleReplySubmitted() {
		setActiveReplyId(null);
		if (!expanded) setExpanded(true);
		await loadReplies();
	}

	const visibleCount = loaded ? items.length : safeExpectedCount;
	const hasPotentialChildren = (safeExpectedCount ?? 0) > 0 || (loaded && items.length > 0);

	if (!hasPotentialChildren && !loaded) return null;

	return (
		<section className={`replies replies--depth-${Math.min(depth, 6)}`} aria-label="Replies thread">
			<button
				type="button"
				className="replies__toggle"
				onClick={toggleExpanded}
				aria-expanded={expanded}
			>
				<span className="replies__toggle-icon">{expanded ? "−" : "+"}</span>
				{showToggleLabel && (
					<span>
						{visibleCount ?? 0} {pluralizeReplies(visibleCount ?? 0)}
					</span>
				)}
			</button>

			{expanded && (
				<div className="replies__content">
					{isLoading && <p className="replies__status">Loading replies...</p>}
					{!isLoading && error && <p className="replies__status replies__status--error">{error}</p>}
					{!isLoading && !error && loaded && !items.length && (
						<p className="replies__status">No replies yet.</p>
					)}

					{!isLoading && !error && items.map((reply) => {
						const replyId = reply?._id || reply?.id;
						const childCount = Number(reply?.replies ?? 0);
						const courseId = resolveCourseId(reply?.courseId);

						return (
							<div key={replyId} className="replies__item">
								<DiscussionCard
									data={reply}
									isReply
									depth={Math.min(depth, 4)}
									showTitle={false}
									onReplyClick={handleReplyClick}
								/>

								{activeReplyId === replyId && courseId && (
									<Reply
										courseId={courseId}
										parentId={replyId}
										onSubmitted={handleReplySubmitted}
										onCancel={() => setActiveReplyId(null)}
									/>
								)}

								{replyId && childCount > 0 && (
									<Replies
										parentId={replyId}
										depth={depth + 1}
										expectedCount={childCount}
										defaultExpanded={false}
										showToggleLabel
									/>
								)}
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}
