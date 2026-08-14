export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export async function request<T>(path: string, apiKey: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('x-api-key', apiKey);
  if (init.body) headers.set('content-type', 'application/json');
  const response = await fetch(path, { ...init, headers });
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new ApiError(response.status, body?.error ?? 'Request failed');
  return body as T;
}

export function handleMutationError(
  reason: unknown,
  setError: (message: string) => void,
  onUnauthorized: () => void,
  fallback: string
) {
  if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
    onUnauthorized();
  } else if (reason instanceof ApiError && (reason.status === 409 || reason.status === 400)) {
    setError(reason.message);
  } else {
    setError(fallback);
  }
}
