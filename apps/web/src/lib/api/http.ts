type ApiError = {
  ok: false;
  status: number;
  code?: string;
  message?: string;
  details?: unknown;
};

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  return envUrl && envUrl.trim() ? envUrl.trim() : "http://localhost:3001";
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as unknown as T;

  const data = await parseBody(res);

  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in (data as Record<string, unknown>)
        ? String((data as Record<string, unknown>)["message"])
        : `HTTP ${res.status}`;

    const err: ApiError = {
      ok: false,
      status: res.status,
      message: msg,
      details: data,
    };
    throw err;
  }

  return data as T;
}

// Alias para compatibilidade com código legado
export const apiClient = {
  get: <T>(path: string) => api<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => api<T>(path, { method: "DELETE" }),
};
