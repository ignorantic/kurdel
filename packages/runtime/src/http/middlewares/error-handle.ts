import type { Middleware } from '@kurdel/core/http';
import { HttpError } from '@kurdel/core/http';

export const errorHandler: Middleware = async (ctx, next) => {
  try {
    return await next();
  } catch (err) {
    console.error(err);
    if (err instanceof HttpError) {
      return {
        kind: 'json',
        status: err.status,
        body: {
          error: err.message,
          ...(err.details ? { details: err.details as any } : {}),
        },
      };
    }

    return {
      kind: 'json',
      status: 500,
      body: { error: 'Internal Server Error' },
    };
  }
};
