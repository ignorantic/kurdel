import { ActionResult, JsonValue } from './types.js';
import { HttpError } from './http-error.js';

// success
export const Ok = (body: JsonValue = { message: 'OK' }): ActionResult => ({
  kind: 'json',
  status: 200,
  body,
});

export const Created = (body: JsonValue = { message: 'OK' }): ActionResult => ({
  kind: 'json',
  status: 201,
  body,
});

export const NoContent = (): ActionResult => ({
  kind: 'empty',
  status: 204,
});

// errors
export const BadRequest = (msg: string, details?: unknown) =>
  new HttpError(400, msg, details);

export const Unauthorized = (msg = 'Unauthorized', details?: JsonValue) =>
  new HttpError(401, msg, details);

export const Forbidden = (msg = 'Forbidden', details?: JsonValue) =>
  new HttpError(403, msg, details);

export const NotFound = (msg = 'Not Found', details?: JsonValue) =>
  new HttpError(404, msg, details);

export const Conflict = (msg = 'Conflict', details?: JsonValue) =>
  new HttpError(409, msg, details);

export const InternalServerError = (msg = 'Internal Server Error', details?: JsonValue) =>
  new HttpError(500, msg, details);

export const NotImplemented = (msg = 'Not Implemented', details?: JsonValue) =>
  new HttpError(501, msg, details);

export const ServiceUnavailable = (msg = 'Service Unavailable', details?: JsonValue) =>
  new HttpError(503, msg, details);
