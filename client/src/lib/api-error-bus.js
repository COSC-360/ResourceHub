const apiErrorBus = new EventTarget();

export function publishApiError(error) {
  apiErrorBus.dispatchEvent(new CustomEvent("api-error", { detail: error }));
}

export function subscribeApiError(handler) {
  const wrapped = (e) => handler(e.detail);
  apiErrorBus.addEventListener("api-error", wrapped);
  return () => apiErrorBus.removeEventListener("api-error", wrapped);
}