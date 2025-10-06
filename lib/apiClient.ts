// lib/apiClient.ts

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({})); // avoid crash if not JSON
    if (!res.ok) {
      const error = data?.error?.message || "Something went wrong";
      throw new Error(error);
    }
    return data;
  } catch (err) {
    console.error("API Fetch error:", err);
    throw err;
  }
}