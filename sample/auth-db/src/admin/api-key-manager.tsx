import { useEffect, useState, type FormEvent } from 'react';

import { ApiError, handleMutationError, request } from './api-client.js';
import { formatDate } from './formatters.js';
import type { ApiKeyMetadata, CreatedApiKey, UserStatus } from './types.js';

export function ApiKeyManager({
  userId,
  userStatus,
  onUnauthorized,
}: {
  userId: number;
  userStatus: UserStatus;
  onUnauthorized: () => void;
}) {
  const [apiKeys, setApiKeys] = useState<ApiKeyMetadata[] | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [name, setName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    request<{ apiKeys: ApiKeyMetadata[] }>(`/users/${userId}/api-keys`)
      .then(result => setApiKeys(result.apiKeys))
      .catch(reason => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          onUnauthorized();
          return;
        }
        setError('Could not load API keys.');
      });
  }, [onUnauthorized, reload, userId]);

  async function issue(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const credential = await request<CreatedApiKey>(`/users/${userId}/api-keys`, {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
        }),
      });
      setCreated(credential);
      setName('');
      setExpiresAt('');
      setIssuing(false);
      setReload(value => value + 1);
    } catch (reason) {
      handleMutationError(reason, setError, onUnauthorized, 'Could not create the API key.');
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke(apiKeyId: string) {
    setSubmitting(true);
    setError('');
    try {
      await request<void>(`/users/${userId}/api-keys/${apiKeyId}`, { method: 'DELETE' });
      setRevoking(null);
      setReload(value => value + 1);
    } catch (reason) {
      handleMutationError(reason, setError, onUnauthorized, 'Could not revoke the API key.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="api-key-section">
      <header>
        <div>
          <h3>API keys</h3>
          <p>Credentials used to access protected routes.</p>
        </div>
        <button
          className="secondary-button compact"
          onClick={() => {
            setIssuing(true);
            setCreated(null);
            setError('');
          }}
          disabled={userStatus !== 'active' || submitting}
          title={userStatus === 'active' ? undefined : 'Enable the user before issuing a key'}
        >
          + New key
        </button>
      </header>

      {created && (
        <div className="secret-card" role="status">
          <strong>Copy this key now</strong>
          <p>It will not be shown again after this dialog is closed.</p>
          <code>{created.key}</code>
          <button
            className="secondary-button compact"
            onClick={() => navigator.clipboard.writeText(created.key)}
          >
            Copy key
          </button>
        </div>
      )}

      {issuing && (
        <form className="inline-form" onSubmit={issue}>
          <div className="field">
            <label htmlFor="api-key-name">Key name</label>
            <input
              id="api-key-name"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="api-key-expiration">
              Expires at <span className="optional">optional</span>
            </label>
            <input
              id="api-key-expiration"
              type="datetime-local"
              value={expiresAt}
              onChange={event => setExpiresAt(event.target.value)}
              min={minimumExpiration()}
            />
          </div>
          <footer className="modal-actions">
            <button
              type="button"
              className="text-button"
              onClick={() => setIssuing(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button className="primary-button compact" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating...' : 'Create key'}
            </button>
          </footer>
        </form>
      )}

      {apiKeys === null && !error && <p className="muted">Loading API keys...</p>}
      {apiKeys?.length === 0 && <p className="muted api-key-empty">No API keys issued yet.</p>}
      {apiKeys && apiKeys.length > 0 && (
        <div className="api-key-list">
          {apiKeys.map(key => (
            <article key={key.id}>
              <div className="key-summary">
                <strong>{key.name}</strong>
                <small>
                  Created {formatDate(key.createdAt)}
                  {key.expiresAt ? ` - expires ${formatDate(key.expiresAt)}` : ''}
                  {key.lastUsedAt ? ` - last used ${formatDate(key.lastUsedAt)}` : ' - never used'}
                </small>
              </div>
              <span className={`key-status ${key.status}`}>{key.status}</span>
              {key.status === 'active' && revoking !== key.id && (
                <button className="text-button danger-text" onClick={() => setRevoking(key.id)}>
                  Revoke
                </button>
              )}
              {revoking === key.id && (
                <div className="revoke-actions">
                  <button
                    className="text-button"
                    onClick={() => setRevoking(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    className="text-button danger-text"
                    onClick={() => revoke(key.id)}
                    disabled={submitting}
                  >
                    Confirm
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function minimumExpiration() {
  const minimum = new Date(Date.now() + 60 * 1000);
  minimum.setMinutes(minimum.getMinutes() - minimum.getTimezoneOffset());
  return minimum.toISOString().slice(0, 16);
}
