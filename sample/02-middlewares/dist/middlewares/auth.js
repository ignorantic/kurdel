import { HttpError } from "@kurdel/core";
export const authMiddleware = async (ctx, next) => {
    if (!ctx.req.headers['authorization']) {
        throw new HttpError(400, 'Unauthorized');
    }
    return next();
};
