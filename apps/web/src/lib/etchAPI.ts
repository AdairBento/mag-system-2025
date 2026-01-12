import { apiRequest } from "./apiClient";

export async function fetchAPI<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET" });
}

export async function postAPI<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: "POST", body });
}

export async function patchAPI<T>(endpoint: string, body: unknown): Promise<T> {
  return apiRequest<T>(endpoint, { method: "PATCH", body });
}

export async function deleteAPI<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}
