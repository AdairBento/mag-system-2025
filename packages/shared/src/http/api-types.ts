export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
};

export type ApiMeta = {
  page?: number;
  pageSize?: number;
  total?: number;
};

export type ApiResponse<T> = {
  data: T | null;
  meta?: ApiMeta;
  error?: ApiError;
  requestId: string;
};
