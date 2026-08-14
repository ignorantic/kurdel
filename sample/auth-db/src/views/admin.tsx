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
          {!loading && !error && page && page.users.length > 0 && <UserTable users={page.users} />}

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
      </main>
    </div>
  );
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

function UserTable({ users }: { users: User[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Status</th>
            <th>Roles</th>
            <th>Created</th>
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
