export class MagError extends Error {
  public readonly code: string;
  public readonly details?: unknown;
  public readonly status: number;

  constructor(params: { code: string; message: string; status: number; details?: unknown }) {
    super(params.message);
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}
