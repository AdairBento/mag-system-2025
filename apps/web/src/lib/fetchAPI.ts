import { apiRequest } from "./api/http";

export async function fetchAPI<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export async function postAPI<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: "POST", body: JSON.stringify(body) });
}

export async function patchAPI<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) });
}

export async function deleteAPI<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}
