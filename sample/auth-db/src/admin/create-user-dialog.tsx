import { useEffect, useState, type FormEvent } from 'react';

import { ApiError, request } from './api-client.js';
import type { User } from './types.js';

export function CreateUserDialog({
  apiKey,
  onCreated,
  onClose,
  onUnauthorized,
}: {
  apiKey: string;
  onCreated: (user: User) => void;
  onClose: () => void;
  onUnauthorized: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    request<{ roles: string[] }>('/roles', apiKey)
      .then(result => {
        setRoles(result.roles);
        setSelectedRoles(result.roles.includes('user') ? ['user'] : result.roles.slice(0, 1));
      })
      .catch(reason => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          onUnauthorized();
          return;
        }
        setError('Could not load available roles.');
      })
      .finally(() => setLoadingRoles(false));
  }, [apiKey, onUnauthorized]);

  function toggleRole(role: string) {
    setSelectedRoles(current =>
      current.includes(role) ? current.filter(value => value !== role) : [...current, role]
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (selectedRoles.length === 0) {
      setError('Select at least one role.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const user = await request<User>('/users', apiKey, {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), roles: selectedRoles }),
      });
      onCreated(user);
    } catch (reason) {
      if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
        onUnauthorized();
        return;
      }
      if (reason instanceof ApiError && reason.status === 409) {
        setError('A user with this email already exists.');
      } else if (reason instanceof ApiError && reason.status === 400) {
        setError(reason.message);
      } else {
        setError('Could not create the user. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">New identity</p>
            <h2 id="create-title">Create user</h2>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </header>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="new-user-name">Name</label>
            <input
              id="new-user-name"
              value={name}
              onChange={event => setName(event.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="new-user-email">Email</label>
            <input
              id="new-user-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              maxLength={254}
              required
            />
          </div>
          <fieldset disabled={loadingRoles || submitting}>
            <legend>Roles</legend>
            {loadingRoles && <span className="muted">Loading roles...</span>}
            {!loadingRoles &&
              roles.map(role => (
                <label className="role-option" key={role}>
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  <span>{role}</span>
                </label>
              ))}
          </fieldset>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <footer className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary-button"
              disabled={submitting || loadingRoles || !name.trim() || !email.trim()}
            >
              {submitting ? 'Creating...' : 'Create user'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
