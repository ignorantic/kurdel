export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
  refreshExpiresAt: string;
};

const sessionStorageKey = 'kurdel.auth-db.session';
let session: AuthTokens | null = null;
let refreshPromise: Promise<AuthTokens> | null = null;

export async function login(email: string, password: string): Promise<void> {
  setSession(await publicRequest<AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }));
}

export async function restoreSession(): Promise<boolean> {
  const stored = sessionStorage.getItem(sessionStorageKey);
  if (!stored) return false;
  try {
    const parsed = JSON.parse(stored) as AuthTokens;
    if (!parsed.refreshToken) return false;
    session = parsed;
    await refreshSession();
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    if (session) await request<void>('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
  }
}

export function clearSession(): void {
  session = null;
  sessionStorage.removeItem(sessionStorageKey);
}

export async function publicRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return send<T>(path, init);
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!session) throw new ApiError(401, 'Authentication is required');
  let result = await send<T>(path, init, session.accessToken, false);
  if (result.response.ok) return result.body as T;
  if (result.response.status !== 401) throw apiError(result.response, result.body);

  await refreshSession();
  result = await send<T>(path, init, session!.accessToken, false);
  if (!result.response.ok) throw apiError(result.response, result.body);
  return result.body as T;
}

export function handleMutationError(
  reason: unknown,
  setError: (message: string) => void,
  onUnauthorized: () => void,
  fallback: string,
) {
  if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
    onUnauthorized();
  } else if (reason instanceof ApiError && (reason.status === 409 || reason.status === 400)) {
    setError(reason.message);
  } else {
    setError(fallback);
  }
}

async function refreshSession(): Promise<AuthTokens> {
  if (!session) throw new ApiError(401, 'Authentication is required');
  refreshPromise ??= publicRequest<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  }).then(tokens => {
    setSession(tokens);
    return tokens;
  }).catch(reason => {
    clearSession();
    throw reason;
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

function setSession(tokens: AuthTokens): void {
  session = tokens;
  sessionStorage.setItem(sessionStorageKey, JSON.stringify(tokens));
}

async function send<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T>;
async function send<T>(path: string, init: RequestInit, accessToken: string, throwOnError: false): Promise<{ response: Response; body: T | { error?: string } | null }>;
async function send<T>(path: string, init: RequestInit = {}, accessToken?: string, throwOnError = true): Promise<T | { response: Response; body: T | { error?: string } | null }> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`);
  if (init.body) headers.set('content-type', 'application/json');
  const response = await fetch(path, { ...init, headers });
  const body = (await response.json().catch(() => null)) as T | { error?: string } | null;
  if (!throwOnError) return { response, body };
  if (!response.ok) throw apiError(response, body);
  return body as T;
}

function apiError(response: Response, body: unknown): ApiError {
  const message = body && typeof body === 'object' && 'error' in body
    ? String(body.error)
    : 'Request failed';
  return new ApiError(response.status, message);
}
