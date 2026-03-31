export async function apiClient(url, options = {}){
  const { method = "GET", body, headers: customHeaders = {} } = options;

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const userId = localStorage.getItem("userId");
  if (userId) {
    headers["X-User-Id"] = userId;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}