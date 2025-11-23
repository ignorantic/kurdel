import { ZodError, type ZodSchema } from 'zod';

import { createValidator } from '@kurdel/runtime/middlewares';
import { ValidationError } from '@kurdel/core/http';

export function zodAdapter<T>(schema: ZodSchema<T>) {
  return createValidator(
    (data) => schema.parse(data),
    (err) => {
      if (err instanceof ZodError) {
        const first = err.issues[0];
        const details = err.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        return new ValidationError(
          first?.message ?? 'Invalid input',
          first?.path?.[0]?.toString(),
          details
        );
      }
      return null;
    }
  );
}
