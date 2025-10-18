import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NativeHttpServerAdapter } from 'src/native-http-server-adapter.js';
import { createServer } from 'node:http';

// Mock runtime controller executor
vi.mock('@kurdel/runtime/http', () => ({
  RuntimeControllerExecutor: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}));

describe('NativeHttpServerAdapter', () => {
  let adapter: NativeHttpServerAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new NativeHttpServerAdapter({ resolve: vi.fn(), middlewares: [] } as any);
  });

  it('creates an underlying Node HTTP server', () => {
    expect(adapter.raw()).toBeDefined();
    expect(typeof adapter.raw()?.listen).toBe('function');
  });

  it('calls the registered handler on incoming requests', async () => {
    const handler = vi.fn((_req, _res) => {});
    adapter.on(handler);

    const server = adapter.raw()!;
    const req = new Request('http://localhost/');
    const res = { end: vi.fn() };

    // simulate request manually
    await (server.listeners('request')[0] as any)(req, res);

    expect(handler).toHaveBeenCalled();
  });

  it('returns 404 if no handler is registered', async () => {
    const server = adapter.raw()!;
    const res = { end: vi.fn(), statusCode: 0 };

    await (server.listeners('request')[0] as any)({}, res);

    expect(res.statusCode).toBe(404);
    expect(res.end).toHaveBeenCalled();
  });

  it('handles errors from handler gracefully', async () => {
    const handler = vi.fn(() => Promise.reject(new Error('fail')));
    adapter.on(handler);

    const res = { end: vi.fn(), statusCode: 0, headersSent: false };
    const server = adapter.raw()!;

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await (server.listeners('request')[0] as any)({}, res);

    expect(res.statusCode).toBe(500);
    expect(res.end).toHaveBeenCalled();

    spy.mockRestore();
  });
});
