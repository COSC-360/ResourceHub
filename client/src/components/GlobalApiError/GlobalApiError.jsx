import { useEffect, useState } from "react";
import { subscribeApiError } from "../../lib/api-error-bus";
import "./GlobalApiError.css";

export default function GlobalApiError() {
  const [error, setError] = useState(null);

  useEffect(() => {
    return subscribeApiError((e) => setError(e));
  }, []);

  if (!error) return null;

  return (
    <div className="global-api-error" role="alert">
      <div>
        <strong>API Error {error.status ?? ""}</strong>
        <div>{error.message || "Unknown error"}</div>
      </div>
      <button onClick={() => setError(null)} aria-label="Dismiss error">✕</button>
    </div>
  );
}