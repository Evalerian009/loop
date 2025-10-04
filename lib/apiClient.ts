export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    const error = data?.error?.message || "Something went wrong";
    throw new Error(error);
  }
  return data;
}