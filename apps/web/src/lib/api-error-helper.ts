export type ApiLikeError = {
  message?: string;
  status?: number;
  details?: unknown;
  response?: {
    status?: number;
    data?: unknown;
  };
};

export function toApiLikeError(err: unknown): ApiLikeError {
  if (typeof err === "object" && err) return err as ApiLikeError;
  return { message: typeof err === "string" ? err : undefined };
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message?: unknown }).message);
  }
  return "Erro desconhecido";
}
