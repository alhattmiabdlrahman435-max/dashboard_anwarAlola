const API_BASE = ""; // Relative URL since dashboard runs on same host or is proxied

export class ApiError extends Error {
  constructor(status, message, errors = null, response = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.response = response;
  }
}

const activeRequests = new Map();
const activeControllers = new Map();

function getRequestKey(endpoint, options) {
  const method = options.method || 'GET';
  const bodyStr = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : '';
  return `${method}:${endpoint}:${bodyStr}`;
}

async function request(endpoint, options = {}) {
  const method = options.method || 'GET';
  const isGet = method.toUpperCase() === 'GET';
  const requestKey = getRequestKey(endpoint, options);

  // 1. Identical Request Deduplication (GET and non-GET duplicate submissions)
  if (activeRequests.has(requestKey)) {
    return activeRequests.get(requestKey);
  }

  // 2. Abort Obsolete GET Requests
  let controller;
  if (isGet) {
    const basePath = endpoint.split('?')[0];
    if (activeControllers.has(basePath)) {
      activeControllers.get(basePath).abort();
    }
    controller = new AbortController();
    activeControllers.set(basePath, controller);
    options = { ...options, signal: controller.signal };
  }

  const fetchPromise = (async () => {
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

    let response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (err) {
      if (err.name === 'AbortError' || (controller && controller.signal.aborted)) {
        // Clean up from active maps immediately
        activeRequests.delete(requestKey);
        if (isGet) {
          const basePath = endpoint.split('?')[0];
          if (activeControllers.get(basePath) === controller) {
            activeControllers.delete(basePath);
          }
        }
        throw err; // Propagate AbortError naturally
      }
      throw new ApiError(0, "فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة لاحقاً.", null, null);
    }

    // Clean up active controller for this basePath
    if (isGet) {
      const basePath = endpoint.split('?')[0];
      if (activeControllers.get(basePath) === controller) {
        activeControllers.delete(basePath);
      }
    }

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
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Non-JSON error response
      }

      // Auto-logout on 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem("auth_token");
        window.dispatchEvent(new Event("api-unauthorized"));
      }

      let msg = errorData.message || "";
      if (!msg) {
        if (response.status === 400) {
          msg = "طلب غير صالح. يرجى التحقق من البيانات المرسلة.";
        } else if (response.status === 401) {
          msg = "غير مصرح. انتهت الجلسة أو يجب تسجيل الدخول.";
        } else if (response.status === 403) {
          msg = "غير مسموح لك بإجراء هذه العملية.";
        } else if (response.status === 404) {
          msg = "المورد المطلوب غير موجود.";
        } else if (response.status === 409) {
          msg = "حدث تعارض في البيانات. قد يكون السجل مضافاً بالفعل.";
        } else if (response.status === 422) {
          msg = "البيانات المدخلة غير صالحة.";
        } else if (response.status === 429) {
          msg = "طلبات كثيرة جداً. يرجى المحاولة لاحقاً بعد دقيقة.";
        } else if (response.status >= 500) {
          msg = "خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.";
        } else {
          msg = `فشلت العملية (رمز الخطأ: ${response.status})`;
        }
      }

      // Format validation errors (422) as a clean list of bullet points
      if (response.status === 422 && errorData.errors) {
        const details = Object.values(errorData.errors)
          .flat()
          .map(e => `• ${e}`)
          .join("\n");
        if (details) {
          msg = `${msg}\n${details}`;
        }
      }

      throw new ApiError(response.status, msg, errorData.errors, response);
    }

    return response.json();
  })();

  activeRequests.set(requestKey, fetchPromise);

  // Clean up when request settles
  fetchPromise.finally(() => {
    activeRequests.delete(requestKey);
  }).catch(() => {});

  return fetchPromise;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: "POST", body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: "PUT", body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: "DELETE", ...options }),
};
