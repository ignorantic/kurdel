import type { ActionResult, HtmlResult, JsonValue } from 'src/http/index.js';
import { HttpError } from 'src/http/index.js';

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

export const Text = (body: string, status = 200): ActionResult => ({
  kind: 'text',
  status,
  body,
});

export const Json = (data: JsonValue, status = 200): ActionResult => ({
  kind: 'json',
  status,
  body: JSON.stringify(data),
});

export const Html = (body: string, status = 200): HtmlResult => ({
  kind: 'html',
  status,
  body,
});

export const Redirect = (location: string, status = 302): ActionResult => ({
  kind: 'redirect',
  status,
  location,
});

// errors
export const BadRequest = (msg: string, details?: unknown) => new HttpError(400, msg, details);

export const Unauthorized = (msg = 'Unauthorized', details?: JsonValue) =>
  new HttpError(401, msg, details);

export const Forbidden = (msg = 'Forbidden', details?: JsonValue) =>
  new HttpError(403, msg, details);

export const NotFound = (msg = 'Not Found', details?: JsonValue) =>
  new HttpError(404, msg, details);

export const Conflict = (msg = 'Conflict', details?: JsonValue) => new HttpError(409, msg, details);

export const InternalServerError = (msg = 'Internal Server Error', details?: JsonValue) =>
  new HttpError(500, msg, details);

export const NotImplemented = (msg = 'Not Implemented', details?: JsonValue) =>
  new HttpError(501, msg, details);

export const ServiceUnavailable = (msg = 'Service Unavailable', details?: JsonValue) =>
  new HttpError(503, msg, details);
