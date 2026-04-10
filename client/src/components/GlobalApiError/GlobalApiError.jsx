import { useEffect, useState } from "react";
import { subscribeApiError } from "../../lib/api-error-bus";
import "./GlobalApiError.css";

export default function GlobalApiError() {
  const [error, setError] = useState(null);

  useEffect(() => {
    return subscribeApiError((e) => setError(e));
  }, []);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(id);
  }, [error]);

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