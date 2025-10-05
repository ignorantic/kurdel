import { describe, it, expect } from 'vitest';
import {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  InternalServerError,
  NotImplemented,
  ServiceUnavailable,
} from 'src/api/http-results.js';
import { HttpError } from 'src/api/http-error.js';

describe('http-results (HttpError factories)', () => {
  it.each([
    [BadRequest('Bad request'), 400, 'Bad request'],
    [Unauthorized('No token'), 401, 'No token'],
    [Forbidden('Forbidden!'), 403, 'Forbidden!'],
    [NotFound('Missing'), 404, 'Missing'],
    [Conflict('Conflict!'), 409, 'Conflict!'],
    [InternalServerError('Oops'), 500, 'Oops'],
    [NotImplemented('NYI'), 501, 'NYI'],
    [ServiceUnavailable('Later'), 503, 'Later'],
  ])('should create %s HttpError with correct status and message', (err, status, msg) => {
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(status);
    expect(err.message).toBe(msg);
  });

  it('should include details when provided', () => {
    const err = BadRequest('Invalid', { field: 'name' });
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(400);
    expect(err.details).toEqual({ field: 'name' });
  });
});

