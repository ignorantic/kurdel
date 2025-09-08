import { HttpError } from './http-error.js';
// success
export const Ok = (body = { message: 'OK' }) => ({
    kind: 'json',
    status: 200,
    body,
});
export const Created = (body = { message: 'OK' }) => ({
    kind: 'json',
    status: 201,
    body,
});
export const NoContent = () => ({
    kind: 'empty',
    status: 204,
});
// errors
export const BadRequest = (msg, details) => new HttpError(400, msg, details);
export const NotFound = (msg, details) => new HttpError(404, msg, details);
export const Conflict = (msg, details) => new HttpError(409, msg, details);
export const InternalServerError = (msg = 'Internal Server Error') => new HttpError(500, msg);
//# sourceMappingURL=http-results.js.map