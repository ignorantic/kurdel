import type { Middleware } from '../../../api/http/types.js';
import { HttpError } from '../../../api/http-error.js';

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

