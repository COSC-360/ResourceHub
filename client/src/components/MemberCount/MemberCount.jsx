export default function MemberCount({ count = 0, className = "" }) {
  return (
    <span className={className} aria-label="member count">
      {count} members
    </span>
  );
}