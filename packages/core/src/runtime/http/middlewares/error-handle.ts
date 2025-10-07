import type { Middleware } from 'src/api/http/middleware.js';
import { HttpError } from 'src/api/http/http-error.js';

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

