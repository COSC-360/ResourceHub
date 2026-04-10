import { Link, useLocation } from "react-router-dom";
import { HOMEROUTE } from "../../constants/RouteConstants.jsx";
import "./Breadcrumbs.css";

function formatLabel(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  const isHomePage = pathnames.length === 0;

  return (
    <div className={isHomePage ? "breadcrumbs home-page" : "breadcrumbs has-crumbs"}>
      {isHomePage ? (
        <span className="current">Home</span>
      ) : (
        <>
          <Link to={HOMEROUTE}>Home</Link>
          {pathnames.map((segment, index) => {
            const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
            const isLast = index === pathnames.length - 1;

            return (
              <span key={routeTo}>
                <span className="separator"> / </span>
                {isLast ? (
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