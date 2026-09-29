/**
 * AppError - a single error type used across the whole backend.
 *
 * Services throw `AppError` instances for expected problems (bad input, missing
 * records). The error middleware understands this class and turns it into a
 * clean JSON response, so controllers never have to build error payloads.
 */
export class AppError extends Error {
  constructor(message, { status = 500, code = 'INTERNAL_ERROR', details = [] } = {}) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
    /** Marks errors that are safe to expose to API clients. */
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }

  /** 400 - the request body or query string failed validation. */
  static badRequest(message = 'Invalid request data', details = []) {
    return new AppError(message, { status: 400, code: 'VALIDATION_ERROR', details });
  }

  /** 404 - a requested record does not exist. */
  static notFound(message = 'Resource not found') {
    return new AppError(message, { status: 404, code: 'NOT_FOUND' });
  }

  /** 500 - something unexpected happened. */
  static internal(message = 'Something went wrong on the server') {
    return new AppError(message, { status: 500, code: 'INTERNAL_ERROR' });
  }
}
