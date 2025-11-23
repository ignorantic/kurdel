import type { ValidationError, SchemaValidator } from '@kurdel/core/http';

/**
 * Generic adapter factory for schema validators (Zod, Joi, Yup, etc.)
 *
 * Wraps any validation library into a unified `SchemaValidator` interface.
 */
export function createValidator<T>(
  parse: (data: unknown) => T | Promise<T>,
  mapError: (err: unknown) => ValidationError | null,
): SchemaValidator<T> {
  return {
    async validate(data: unknown): Promise<T> {
      try {
        return await parse(data);
      } catch (err) {
        const mapped = mapError(err);
        if (mapped) throw mapped;
        throw err;
      }
    },
  };
}
