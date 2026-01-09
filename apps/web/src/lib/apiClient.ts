import type { ApiResponse } from "@mag/shared";

import { env } from "@/env";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly requestId?: string;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(params: {
    message: string;
    status: number;
    requestId?: string;
    code?: string;
    details?: unknown;
  }) {
    super(params.message);
    this.status = params.status;
    this.requestId = params.requestId;
    this.code = params.code;
    this.details = params.details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${env.NEXT_PUBLIC_API_URL}${path}`;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
  });

  const payload = (await parseJsonSafe(res)) as ApiResponse<T> | null;
  const requestId = payload?.requestId ?? res.headers.get("x-request-id") ?? undefined;

  if (!res.ok) {
    const message = payload?.error?.message ?? `Falha na requisição (${res.status}).`;
    throw new ApiClientError({
      message,
      status: res.status,
      requestId,
      code: payload?.error?.code,
      details: payload?.error?.details,
    });
  }

  if (!payload) {
    throw new ApiClientError({ message: "Resposta inválida do servidor.", status: 500, requestId });
  }

  return payload.data as T;
}
