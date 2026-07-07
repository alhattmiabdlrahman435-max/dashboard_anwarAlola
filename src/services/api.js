const API_BASE = ""; // Relative URL since dashboard runs on same host or is proxied

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("auth_token");

  const headers = {
    "Accept": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If body is not FormData or string, stringify it and set Content-Type to JSON
  if (options.body && !(options.body instanceof FormData)) {
    if (typeof options.body === "object") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle binary/file downloads (Excel templates, export files, PDFs, etc.)
  const contentType = response.headers.get("content-type");
  if (
    contentType &&
    (contentType.includes("spreadsheetml") ||
      contentType.includes("octet-stream") ||
      contentType.includes("pdf") ||
      contentType.includes("csv") ||
      contentType.includes("vnd.ms-excel"))
  ) {
    return response; // Return raw response so the browser/calling code can read as blob
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: "PUT", body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
};
