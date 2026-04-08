import { publishApiError } from "./api-error-bus";

export async function apiClient(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  let body = options.body;
  if (body && !isFormData) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const err = new Error(json?.error || res.statusText || "Request failed");
    err.status = res.status;
    err.payload = json ?? null;

    publishApiError({
      status: err.status,
      message: err.message,
      payload: err.payload,
      path: url,
    });

    throw err;
  }

  return json;
}
