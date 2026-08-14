import { ValidationError } from '@kurdel/core/http';
import { createValidator } from '@kurdel/runtime/middlewares';
import { ZodError, type ZodSchema } from 'zod';

export function zodAdapter<T>(schema: ZodSchema<T>) {
  return createValidator(
    data => schema.parse(data),
    error => {
      if (!(error instanceof ZodError)) return null;
      const first = error.issues[0];
      return new ValidationError(
        first?.message ?? 'Invalid input',
        first?.path?.[0]?.toString(),
        error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }))
      );
    }
  );
}
