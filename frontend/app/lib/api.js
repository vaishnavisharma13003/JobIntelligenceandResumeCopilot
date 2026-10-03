export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function apiFetch(path, options = {}) {
  const controller = new AbortController();

  // Ollama can take longer than a normal API
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 120000);

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(
        "The request timed out. Ollama is taking too long to respond.",
      );
    }

    throw new Error(
      `Cannot reach backend at ${API_BASE}. Make sure FastAPI is running.`,
    );
  }

  clearTimeout(timeoutId);

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = await response.json();

      if (body?.detail) {
        message = body.detail;
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  return response.json();
}

export async function apiFetchJSON(path, body, method = "POST") {
  return apiFetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export async function apiFetchForm(path, file) {
  const formData = new FormData();

  formData.append("file", file);

  return apiFetch(path, {
    method: "POST",
    body: formData,
  });
}

export default apiFetch;
