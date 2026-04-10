import { Link, useLocation } from "react-router-dom";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";
import "./Breadcrumbs.css";

function formatLabel(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Path segments that look like opaque ids (numeric, UUID, ObjectId, etc.) — hidden in breadcrumbs. */
function isLikelyRouteIdSegment(segment) {
  if (!segment) return false;
  if (/^\d+$/.test(segment)) return true;
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return true;
  }
  if (/^[a-f0-9]{24}$/i.test(segment)) return true;
  if (
    segment.length >= 16 &&
    /^[a-z0-9]+$/i.test(segment) &&
    /[0-9]/.test(segment) &&
    /[a-z]/i.test(segment)
  ) {
    return true;
  }
  return false;
}

function buildBreadcrumbItems(pathnames) {
  const items = [];
  for (let i = 0; i < pathnames.length; i++) {
    const segment = pathnames[i];
    if (isLikelyRouteIdSegment(segment)) continue;
    const routeTo = "/" + pathnames.slice(0, i + 1).join("/");
    items.push({ segment, routeTo, pathIndex: i });
  }
  return items;
}

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);
  const crumbItems = buildBreadcrumbItems(pathnames);

  const isHomePage = pathnames.length === 0;

  return (
    <div className={isHomePage ? "breadcrumbs home-page" : "breadcrumbs has-crumbs"}>
      {isHomePage ? (
        <span className="current">Home</span>
      ) : (
        <>
          <Link to={HOMEROUTE}>Home</Link>
          {crumbItems.map(({ segment, routeTo, pathIndex }, index) => {
            const isLast = index === crumbItems.length - 1;
            const onDiscussionsRoute = pathnames.includes("discussions");
            const showAsCurrent =
              isLast &&
              (pathIndex === pathnames.length - 1 ||
                segment !== "courses" ||
                onDiscussionsRoute);

            return (
              <span key={routeTo}>
                <span className="separator"> / </span>
                {showAsCurrent ? (
                  <span className="current">{formatLabel(segment)}</span>
                ) : (
                  <Link to={routeTo}>{formatLabel(segment)}</Link>
                )}
              </span>
            );
          })}
        </>
      )}
    </div>
  );
}