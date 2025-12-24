/**
 * 標準的なAPIエラーレスポンスとエラークラス
 */

/**
 * APIエラーレスポンスの標準フォーマット
 */
export interface ApiErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * HTTPエラーを表す基底クラス
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }

  toResponse(): ApiErrorResponse {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends HttpError {
  constructor(message: string, code?: string, details?: unknown) {
    super(400, message, code, details);
    this.name = "BadRequestError";
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", code?: string) {
    super(401, message, code);
    this.name = "UnauthorizedError";
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends HttpError {
  constructor(message: string, code?: string) {
    super(403, message, code);
    this.name = "ForbiddenError";
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends HttpError {
  constructor(resource: string, code?: string) {
    super(404, `${resource} not found`, code);
    this.name = "NotFoundError";
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpError {
  constructor(message = "Internal server error", code?: string) {
    super(500, message, code);
    this.name = "InternalServerError";
  }
}

/**
 * HttpErrorをハンドリングしてElysiaレスポンスに変換
 */
export function handleError(
  error: unknown,
  set: { status?: number | string },
): ApiErrorResponse {
  if (error instanceof HttpError) {
    set.status = error.status;
    return error.toResponse();
  }

  // 通常のErrorの場合
  if (error instanceof Error) {
    set.status = 500;
    return { message: error.message };
  }

  // 不明なエラー
  set.status = 500;
  return { message: "An unknown error occurred" };
}
