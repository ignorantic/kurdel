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
export const Unauthorized = (msg = 'Unauthorized', details) => new HttpError(401, msg, details);
export const Forbidden = (msg = 'Forbidden', details) => new HttpError(403, msg, details);
export const NotFound = (msg = 'Not Found', details) => new HttpError(404, msg, details);
export const Conflict = (msg = 'Conflict', details) => new HttpError(409, msg, details);
export const InternalServerError = (msg = 'Internal Server Error', details) => new HttpError(500, msg, details);
export const NotImplemented = (msg = 'Not Implemented', details) => new HttpError(501, msg, details);
export const ServiceUnavailable = (msg = 'Service Unavailable', details) => new HttpError(503, msg, details);
//# sourceMappingURL=http-results.js.map