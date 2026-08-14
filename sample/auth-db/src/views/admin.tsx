import { useEffect, useState, type FormEvent } from 'react';

const credentialStorageKey = 'kurdel.auth-db.admin-key';
const pageSize = 10;

type UserStatus = 'active' | 'disabled';

type User = {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

type UserPage = {
  users: User[];
  total: number;
  limit: number;
  offset: number;
};

class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(path: string, apiKey: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('x-api-key', apiKey);
  if (init.body) headers.set('content-type', 'application/json');
  const response = await fetch(path, { ...init, headers });
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new ApiError(response.status, body?.error ?? 'Request failed');
  return body as T;
}

export default function Admin() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem(credentialStorageKey);
    if (!saved) {
      setRestoring(false);
      return;
    }
    request('/admin', saved)
      .then(() => setApiKey(saved))
      .catch(() => sessionStorage.removeItem(credentialStorageKey))
      .finally(() => setRestoring(false));
  }, []);

  function logOut() {
    sessionStorage.removeItem(credentialStorageKey);
    setApiKey(null);
  }

  if (restoring) return <LoadingScreen />;
  if (!apiKey) return <Login onAuthenticated={setApiKey} />;
  return <Dashboard apiKey={apiKey} onUnauthorized={logOut} onLogOut={logOut} />;
}

function Login({ onAuthenticated }: { onAuthenticated: (apiKey: string) => void }) {
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
            {submitting ? 'Checking…' : 'Open dashboard'}
          </button>
        </form>
        <p className="security-note">The key is kept only for this browser tab.</p>
      </section>
    </main>
  );
}

function Dashboard({
  apiKey,
  onUnauthorized,
  onLogOut,
}: {
  apiKey: string;
  onUnauthorized: () => void;
  onLogOut: () => void;
}) {
  const [status, setStatus] = useState<'' | UserStatus>('');
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<UserPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [creating, setCreating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(pageSize), offset: String(offset) });
    if (status) params.set('status', status);
    setLoading(true);
    setError('');
    request<UserPage>(`/users?${params}`, apiKey)
      .then(setPage)
      .catch(reason => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          onUnauthorized();
          return;
        }
        setError('Could not load users. Check the server and try again.');
      })
      .finally(() => setLoading(false));
  }, [apiKey, offset, onUnauthorized, reload, status]);

  const shownFrom = page && page.total > 0 ? page.offset + 1 : 0;
  const shownTo = page ? Math.min(page.offset + page.users.length, page.total) : 0;

  function userCreated(user: User) {
    setCreating(false);
    setNotice(`${user.name} was created successfully.`);
    setStatus('');
    setOffset(0);
    setReload(value => value + 1);
  }

  function userUpdated(user: User) {
    setNotice(`${user.name} was updated successfully.`);
    setReload(value => value + 1);
  }

  function userDeleted(name: string) {
    setSelectedUserId(null);
    setNotice(`${name} was deleted.`);
    setOffset(0);
    setReload(value => value + 1);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">K</span>
          <span>Kurdel</span>
        </div>
        <nav>
          <span className="nav-item active">
            <span>Users</span>
          </span>
        </nav>
        <button className="logout-button" onClick={onLogOut}>
          Log out
        </button>
      </aside>
      <main className="content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Auth database</p>
            <h1>Users</h1>
            <p className="muted">Review identities, roles, and account status.</p>
          </div>
          <button className="primary-button" onClick={() => setCreating(true)}>
            + New user
          </button>
        </header>

        <section className="panel">
          <div className="toolbar">
            <div className="filter-group" aria-label="Filter by status">
              {(['', 'active', 'disabled'] as const).map(value => (
                <button
                  key={value || 'all'}
                  className={status === value ? 'filter active' : 'filter'}
                  onClick={() => {
                    setStatus(value);
                    setOffset(0);
                  }}
                >
                  {value || 'all'}
                </button>
              ))}
            </div>
            <button className="text-button" onClick={() => setReload(value => value + 1)}>
              Refresh
            </button>
          </div>

          {loading && <TableSkeleton />}
          {!loading && error && (
            <div className="empty-state" role="alert">
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          )}
          {!loading && !error && page?.users.length === 0 && (
            <div className="empty-state">
              <strong>No users found</strong>
              <p>Try another filter.</p>
            </div>
          )}
          {!loading && !error && page && page.users.length > 0 && (
            <UserTable users={page.users} onSelect={setSelectedUserId} />
          )}

          <footer className="pagination">
            <span>
              Showing {shownFrom}–{shownTo} of {page?.total ?? 0}
            </span>
            <div>
              <button
                disabled={loading || offset === 0}
                onClick={() => setOffset(value => Math.max(0, value - pageSize))}
              >
                Previous
              </button>
              <button
                disabled={loading || !page || offset + pageSize >= page.total}
                onClick={() => setOffset(value => value + pageSize)}
              >
                Next
              </button>
            </div>
          </footer>
        </section>
        {notice && (
          <div className="toast" role="status">
            <span>{notice}</span>
            <button aria-label="Dismiss notification" onClick={() => setNotice('')}>
              &times;
            </button>
          </div>
        )}
        {creating && (
          <CreateUserDialog
            apiKey={apiKey}
            onCreated={userCreated}
            onClose={() => setCreating(false)}
            onUnauthorized={onUnauthorized}
          />
        )}
        {selectedUserId !== null && (
          <ManageUserDialog
            userId={selectedUserId}
            apiKey={apiKey}
            onUpdated={userUpdated}
            onDeleted={userDeleted}
            onClose={() => setSelectedUserId(null)}
            onUnauthorized={onUnauthorized}
          />
        )}
      </main>
    </div>
  );
}

function ManageUserDialog({
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

function handleMutationError(
  reason: unknown,
  setError: (message: string) => void,
  onUnauthorized: () => void,
  fallback: string
) {
  if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
    onUnauthorized();
  } else if (reason instanceof ApiError && reason.status === 409) {
    setError(reason.message);
  } else if (reason instanceof ApiError && reason.status === 400) {
    setError(reason.message);
  } else {
    setError(fallback);
  }
}

function CreateUserDialog({
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

function UserTable({ users, onSelect }: { users: User[]; onSelect: (userId: number) => void }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Created</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <div className="user-cell">
                  <span className="avatar">{initials(user.name)}</span>
                  <span>
                    <strong>{user.name}</strong>
                    <small>
                      {user.email} · #{user.id}
                    </small>
                  </span>
                </div>
              </td>
              <td>
                <span className={`status ${user.status}`}>{user.status}</span>
              </td>
              <td>
                <div className="roles">
                  {user.roles.map(role => (
                    <span key={role}>{role}</span>
                  ))}
                </div>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <button className="row-action" onClick={() => onSelect(user.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="spinner" />
      <span>Restoring session…</span>
    </main>
  );
}

function TableSkeleton() {
  return (
    <div className="table-skeleton" aria-label="Loading users">
      {[1, 2, 3, 4].map(row => (
        <div key={row} />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(
    new Date(`${value.replace(' ', 'T')}Z`)
  );
}
