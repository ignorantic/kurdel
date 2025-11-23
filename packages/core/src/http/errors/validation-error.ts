import type { JsonValue } from 'src/http/types.js';

/**
 * Error raised when schema validation fails.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    readonly field?: string,
    readonly details?: JsonValue,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}