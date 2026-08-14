import { useState, type FormEvent } from 'react';

import { ApiError, request } from './api-client.js';

export const credentialStorageKey = 'kurdel.auth-db.admin-key';

export function Login({ onAuthenticated }: { onAuthenticated: (apiKey: string) => void }) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const key = value.trim();
    if (!key) return;
    setSubmitting(true);
    setError('');
    try {
      await request('/admin', key);
      sessionStorage.setItem(credentialStorageKey, key);
      onAuthenticated(key);
    } catch (reason) {
      setError(
        reason instanceof ApiError && reason.status === 403
          ? 'This credential does not have the admin role.'
          : 'The API key is invalid or the server is unavailable.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-layout">
      <section className="login-card">
        <div className="brand-mark" aria-hidden="true">
          K
        </div>
        <p className="eyebrow">Kurdel sample</p>
        <h1>Auth administration</h1>
        <p className="muted">Enter an API key with the admin role to manage users.</p>
        <form onSubmit={submit}>
          <label htmlFor="api-key">Admin API key</label>
          <input
            id="api-key"
            type="password"
            value={value}
            onChange={event => setValue(event.target.value)}
            placeholder="admin-demo-key"
            autoComplete="current-password"
            autoFocus
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={submitting || !value.trim()}>
            {submitting ? 'Checking...' : 'Open dashboard'}
          </button>
        </form>
        <p className="security-note">The key is kept only for this browser tab.</p>
      </section>
    </main>
  );
}

export function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="spinner" />
      <span>Restoring session...</span>
    </main>
  );
}

export function TableSkeleton() {
  return (
    <div className="table-skeleton" aria-label="Loading users">
      {[1, 2, 3, 4].map(row => (
        <div key={row} />
      ))}
    </div>
  );
}
