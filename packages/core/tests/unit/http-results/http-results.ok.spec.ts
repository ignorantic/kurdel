import { describe, it, expect } from 'vitest';

import {
  Ok,
  Created,
  NoContent,
  Redirect,
  Json,
} from 'src/http/http-results.js';

describe('http-results success helpers', () => {
  it('Ok should wrap value with status 200', () => {
    const data = { hello: 'world' };
    const result = Ok(data);

    expect(result.status).toBe(200);
    expect(result.body).toEqual(data);
  });

  it('Created should wrap value with status 201', () => {
    const entity = { id: 1, name: 'Alice' };
    const result = Created(entity);

    expect(result.status).toBe(201);
    expect(result.body).toEqual(entity);
  });

  it('NoContent should have 204 status and no body', () => {
    const result = NoContent();

    expect(result.status).toBe(204);
    expect(result.body).toBeUndefined();
  });

  it('Redirect should set status 302 and location header', () => {
    const url = '/new-location';
    const result = Redirect(url);

    expect(result.status).toBe(302);
    expect(result.location).toBe(url);
    expect(result.body).toBeUndefined();
  });

  it('Json should stringify object and set content-type', () => {
    const obj = { foo: 'bar' };
    const result = Json(obj);

    expect(result.status).toBe(200);
    expect(result.body).toBe(JSON.stringify(obj));
  });
});

