import { beforeAll, afterAll, vi } from 'vitest';

let e: any, w: any;

beforeAll(() => {
  e = vi.spyOn(console, 'error').mockImplementation(() => {});
  w = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  e.mockRestore();
  w.mockRestore();
});
