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
  sent: boolean;
  status: (code: number) => HttpResponse;
  json: (data: unknown) => void;
  send: (data: string | Uint8Array) => void;
  redirect: (status: number, location: string) => void;
}
