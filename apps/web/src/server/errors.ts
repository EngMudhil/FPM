export type AppErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BUSINESS_RULE'
  | 'DATABASE'
  | 'INTERNAL';

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: AppErrorCode, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function toPublicError(error: unknown): {
  code: AppErrorCode;
  message: string;
  status: number;
} {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message, status: error.status };
  }
  return {
    code: 'INTERNAL',
    message: 'An unexpected error occurred',
    status: 500,
  };
}
