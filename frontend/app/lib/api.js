// Small fetch helper shared by every component.
// Centralizing this makes it easy to handle "backend unavailable" errors
// consistently everywhere in the UI.

export const API_BASE = "http://localhost:8000";

/**
 * Wraps fetch() with friendly error messages for common failure modes:
 * backend not running, Ollama down (503 from backend), timeouts, etc.
 */
export async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 60s timeout

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        "The request timed out. The model may be taking too long to respond.",
      );
    }
    throw new Error(
      "Could not reach the backend. Is it running at " +
        API_BASE +
        "? (uvicorn main:app --reload --port 8000)",
    );
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.detail) detail = errorBody.detail;
    } catch {
      // response wasn't JSON - keep the generic message
    }
    throw new Error(detail);
  }

  return response.json();
}

export async function apiFetchJSON(path, body, method = "POST") {
  return apiFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiFetchForm(path, file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch(path, { method: "POST", body: formData });
}
