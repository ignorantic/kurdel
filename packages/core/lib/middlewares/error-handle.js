import { HttpError } from '../http-error.js';
export const errorHandler = async (ctx, next) => {
    try {
        return await next();
    }
    catch (err) {
        if (err instanceof HttpError) {
            return {
                kind: 'json',
                status: err.status,
                body: {
                    error: err.message,
                    ...(err.details ? { details: err.details } : {}),
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
//# sourceMappingURL=error-handle.js.map