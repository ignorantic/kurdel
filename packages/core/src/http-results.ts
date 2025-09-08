// src/http-results.ts
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

export const NotFound = (msg: string, details?: unknown) =>
  new HttpError(404, msg, details);

export const Conflict = (msg: string, details?: unknown) =>
  new HttpError(409, msg, details);

export const InternalServerError = (msg = 'Internal Server Error') =>
  new HttpError(500, msg);
