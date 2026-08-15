import { useEffect, useState, type FormEvent } from 'react';

import { ApiError, handleMutationError, request } from './api-client.js';
import { ApiKeyManager } from './api-key-manager.js';
import { AuthEventList } from './auth-event-list.js';
import { formatDate, initials } from './formatters.js';
import type { User, UserStatus } from './types.js';

export function ManageUserDialog({
  userId,
  apiKey,
  onUpdated,
  onDeleted,
  onClose,
  onUnauthorized,
}: {
  userId: number;
  apiKey: string;
  onUpdated: (user: User) => void;
  onDeleted: (name: string) => void;
  onClose: () => void;
  onUnauthorized: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<UserStatus>('active');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      request<User>(`/users/${userId}`, apiKey),
      request<{ roles: string[] }>('/roles', apiKey),
    ])
      .then(([loadedUser, loadedRoles]) => {
        setUser(loadedUser);
        setRoles(loadedRoles.roles);
        setName(loadedUser.name);
        setEmail(loadedUser.email);
        setStatus(loadedUser.status);
        setSelectedRoles(loadedUser.roles);
      })
      .catch(reason => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          onUnauthorized();
          return;
        }
        setError(
          reason instanceof ApiError && reason.status === 404
            ? 'This user no longer exists.'
            : 'Could not load the user.'
        );
      })
      .finally(() => setLoading(false));
  }, [apiKey, onUnauthorized, userId]);

  function toggleRole(role: string) {
    setSelectedRoles(current =>
      current.includes(role) ? current.filter(value => value !== role) : [...current, role]
    );
  }

  function resetForm() {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setStatus(user.status);
    setSelectedRoles(user.roles);
    setError('');
    setEditing(false);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (selectedRoles.length === 0) {
      setError('Select at least one role.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const updated = await request<User>(`/users/${userId}`, apiKey, {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          status,
          roles: selectedRoles,
        }),
      });
      setUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      setStatus(updated.status);
      setSelectedRoles(updated.roles);
      setEditing(false);
      onUpdated(updated);
    } catch (reason) {
      handleMutationError(reason, setError, onUnauthorized, 'Could not update the user.');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      await request<void>(`/users/${userId}`, apiKey, { method: 'DELETE' });
      onDeleted(user.name);
    } catch (reason) {
      handleMutationError(reason, setError, onUnauthorized, 'Could not delete the user.');
      setConfirmingDelete(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="manage-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">User #{userId}</p>
            <h2 id="manage-title">{editing ? 'Edit user' : 'User details'}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close"
            onClick={onClose}
            disabled={submitting}
          >
            &times;
          </button>
        </header>

        {loading && (
          <div className="modal-loading">
            <div className="spinner" /> Loading user...
          </div>
        )}
        {!loading && error && !user && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {!loading && user && !editing && !confirmingDelete && (
          <div className="details">
            <div className="detail-user">
              <span className="avatar large">{initials(user.name)}</span>
              <span>
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
            </div>
            <dl>
              <div>
                <dt>Status</dt>
                <dd>
                  <span className={`status ${user.status}`}>{user.status}</span>
                </dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>
                  <div className="roles">
                    {user.roles.map(role => (
                      <span key={role}>{role}</span>
                    ))}
                  </div>
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{formatDate(user.updatedAt)}</dd>
              </div>
            </dl>
            <ApiKeyManager
              userId={user.id}
              userStatus={user.status}
              apiKey={apiKey}
              onUnauthorized={onUnauthorized}
            />
            <AuthEventList
              userId={user.id}
              apiKey={apiKey}
              onUnauthorized={onUnauthorized}
            />
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <footer className="modal-actions split-actions">
              <button className="danger-button" onClick={() => setConfirmingDelete(true)}>
                Delete user
              </button>
              <button className="primary-button" onClick={() => setEditing(true)}>
                Edit user
              </button>
            </footer>
          </div>
        )}
        {!loading && user && confirmingDelete && (
          <div className="confirmation">
            <div className="danger-icon">!</div>
            <h3>Delete {user.name}?</h3>
            <p>This permanently removes the user, role assignments, and every API key they own.</p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <footer className="modal-actions">
              <button
                className="secondary-button"
                onClick={() => setConfirmingDelete(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button className="danger-button solid" onClick={remove} disabled={submitting}>
                {submitting ? 'Deleting...' : 'Delete permanently'}
              </button>
            </footer>
          </div>
        )}
        {!loading && user && editing && (
          <form onSubmit={save}>
            <div className="field">
              <label htmlFor="edit-user-name">Name</label>
              <input
                id="edit-user-name"
                value={name}
                onChange={event => setName(event.target.value)}
                maxLength={100}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="edit-user-email">Email</label>
              <input
                id="edit-user-email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                maxLength={254}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="edit-user-status">Status</label>
              <select
                id="edit-user-status"
                value={status}
                onChange={event => setStatus(event.target.value as UserStatus)}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <fieldset disabled={submitting}>
              <legend>Roles</legend>
              {roles.map(role => (
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
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                disabled={submitting || !name.trim() || !email.trim()}
              >
                {submitting ? 'Saving...' : 'Save changes'}
              </button>
            </footer>
          </form>
        )}
      </section>
    </div>
  );
}
