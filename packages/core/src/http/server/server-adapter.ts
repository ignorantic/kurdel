import type { HttpRequest, HttpResponse } from '@kurdel/common';

/**
 * A unified abstraction over different HTTP runtime environments.
 *
 * The `ServerAdapter` interface allows the Kurdel runtime to operate
 * in both long-running (Node.js) and request-scoped (Web/Edge) contexts
 * using a shared contract.
 *
 * Implementations may bridge native platform primitives
 * (e.g. Node’s `IncomingMessage`, Fetch API `Request`, etc.)
 * into the framework-agnostic `HttpRequest` / `HttpResponse` types.
 *
 * ---
 * ### Adapter responsibilities:
 * - Translate platform-specific request/response objects.
 * - Delegate execution to the runtime pipeline (middlewares + controller).
 * - Manage platform-specific server lifecycle (optional).
 *
 * ### Typical Implementations:
 * - **Node.js** → `NativeHttpServerAdapter` (uses `listen` / `close`)
 * - **Web / Edge** → `WebHttpServerAdapter` (uses `handle`)
 *
 * ---
 */
export interface ServerAdapter<R = HttpRequest, S = HttpResponse> {
  /**
   * Registers the platform-independent request handler.
   *
   * The runtime calls this once to connect the main execution pipeline.
   *
   * @example
   * adapter.on(async (req, res) => {
   *   await router.dispatch(req, res);
   * });
   */
  on(handler: (req: R, res: S) => void | Promise<void>): void;

  /**
   * Handles a single incoming request.
   *
   * This method is primarily used by environments that expose a Fetch-like API
   * (such as Cloudflare Workers, Deno Deploy, Bun, or Vercel Edge).
   *
   * Implementations should adapt the incoming request object and return
   * a platform-compatible response.
   *
   * @example
   * const response = await adapter.handle(request);
   */
  handle?(request: unknown, ...args: unknown[]): Promise<unknown> | unknown;

  /**
   * Starts listening for incoming connections.
   *
   * Used by long-running environments (e.g., Node.js, Bun’s TCP mode).
   * May be a no-op in serverless / edge environments.
   *
   * @example
   * adapter.listen(3000, () => console.log('Server started'));
   */
  listen?(port: number, hostOrCb?: string | (() => void), cb?: () => void): void | Promise<void>;

  /**
   * Gracefully closes the underlying server.
   *
   * Optional. Typically used in tests or controlled shutdowns.
   */
  close?(): Promise<void>;

  /**
   * Returns the underlying platform-native server instance.
   *
   * This is a low-level escape hatch for advanced integrations
   * (e.g., attaching WebSocket handlers, inspecting connections).
   *
   * @example
   * const nodeServer = adapter.raw<import('http').Server>();
   */
  raw?<T = unknown>(): T | undefined;

  /**
   * Returns the effective base URL of the server, if applicable.
   *
   * Useful for testing, introspection, or constructing self-referential links.
   */
  url?(): string;
}
