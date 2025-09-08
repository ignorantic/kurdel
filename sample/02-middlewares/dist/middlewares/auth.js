import { Unauthorized } from "@kurdel/core";
export const authMiddleware = async (ctx, next) => {
    if (!ctx.req.headers['authorization']) {
        throw Unauthorized();
    }
    return next();
};
