import { useState, type FormEvent } from 'react';

import { ApiError, clearSession, login, publicRequest, request } from './api-client.js';

type AuthMode = 'login' | 'request-reset' | 'complete-reset';

export function Login({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('admin@example.test');
  const [password, setPassword] = useState('admin-demo-password');
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        await request('/admin');
        onAuthenticated();
      } else if (mode === 'request-reset') {
        const result = await publicRequest<{ accepted: true; resetToken?: string }>(
          '/auth/password-reset/request',
          { method: 'POST', body: JSON.stringify({ email: email.trim() }) },
        );
        setNotice('If the account exists, password reset instructions were created.');
        if (result.resetToken) {
          setToken(result.resetToken);
          setMode('complete-reset');
        }
      } else {
        await publicRequest<void>('/auth/password-reset/complete', {
          method: 'POST',
          body: JSON.stringify({ token: token.trim(), password }),
        });
        setPassword('');
        setToken('');
        setMode('login');
        setNotice('Password reset successfully. Sign in with the new password.');
      }
    } catch (reason) {
      if (mode === 'login') clearSession();
      setError(
        reason instanceof ApiError && reason.status === 403
          ? 'This account does not have the admin role.'
          : reason instanceof ApiError ? reason.message : 'The server is unavailable.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === 'login' ? 'Auth administration'
    : mode === 'request-reset' ? 'Reset your password' : 'Choose a new password';

  return (
    <main className="login-layout">
      <section className="login-card">
        <div className="brand-mark" aria-hidden="true">K</div>
        <p className="eyebrow">Kurdel sample</p>
        <h1>{title}</h1>
        <p className="muted">
          {mode === 'login'
            ? 'Sign in with an administrator email and password.'
            : 'Reset tokens are displayed directly only in development mode.'}
        </p>
        <form onSubmit={submit}>
          {mode !== 'complete-reset' && <>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
          </>}
          {mode === 'complete-reset' && <>
            <label htmlFor="reset-token">Reset token</label>
            <input id="reset-token" value={token} onChange={event => setToken(event.target.value)} autoComplete="off" required />
          </>}
          {mode !== 'request-reset' && <>
            <label htmlFor="password">{mode === 'login' ? 'Password' : 'New password'}</label>
            <input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required />
          </>}
          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-notice" role="status">{notice}</p>}
          <button className="primary-button" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : mode === 'request-reset' ? 'Request reset' : 'Reset password'}
          </button>
        </form>
        <button className="text-button auth-switch" onClick={() => {
          setError('');
          setNotice('');
          setMode(mode === 'login' ? 'request-reset' : 'login');
        }}>
          {mode === 'login' ? 'Forgot password?' : 'Back to sign in'}
        </button>
        <p className="security-note">Tokens are kept only for this browser tab.</p>
      </section>
    </main>
  );
}

export function ChangePasswordDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await request<void>('/auth/password/change', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, password }),
      });
      onChanged();
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Could not change the password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="modal compact-modal" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
        <h2 id="change-password-title">Change password</h2>
        <p className="muted">All active sessions will be signed out.</p>
        <form onSubmit={submit}>
          <label htmlFor="current-password">Current password</label>
          <input id="current-password" type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} autoComplete="current-password" minLength={8} required autoFocus />
          <label htmlFor="new-password">New password</label>
          <input id="new-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={submitting}>{submitting ? 'Changing...' : 'Change password'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function LoadingScreen() {
  return <main className="loading-screen"><div className="spinner" /><span>Restoring session...</span></main>;
}

export function TableSkeleton() {
  return <div className="table-skeleton" aria-label="Loading users">{[1, 2, 3, 4].map(row => <div key={row} />)}</div>;
}
