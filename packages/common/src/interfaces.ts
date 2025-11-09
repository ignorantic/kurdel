/** A minimal, platform-independent HTTP request abstraction. */
export interface HttpRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[]>;
  body?: unknown;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
}

/** A minimal, platform-independent HTTP response abstraction. */
export interface HttpResponse {
  /** Sends a complete response body (string, Buffer, or object). */
  send(body?: any): void;

  /** Sends a JSON response with correct content type. */
  json(body: unknown): void;

  /** Sets the HTTP status code. */
  status(code: number): this;

  /** Optional shorthand for redirection. */
  redirect(status: number, location: string): void;

  /** Write a data chunk to the response stream. */
  write?(chunk: any): void;

  /** End the response stream (optional final data chunk). */
  end?(chunk?: any): void;

  /** Marks the response as already sent. */
  sent: boolean;

  /** Underlying native platform response (optional). */
  raw?: unknown;
}
