export interface RunningServer {
  /** e.g. http://127.0.0.1:3000 */
  url?: string;
  /** Graceful shutdown */
  close(): Promise<void>;
  /** Escape hatch for tests (e.g., Node http.Server) */
  raw?<T = unknown>(): T | undefined;
}
