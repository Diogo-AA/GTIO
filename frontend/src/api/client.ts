const API_BASE = import.meta.env.VITE_API_BASE as string;

let tokenGetter: (() => Promise<string>) | null = null;

export function setTokenGetter(fn: () => Promise<string>) {
  tokenGetter = fn;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === "string" && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (tokenGetter) {
    const token = await tokenGetter();
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}/${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const e = await res.json();
      msg = e.title || e.message || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 201 || res.status === 204) return null as T;
  return res.json() as Promise<T>;
}
