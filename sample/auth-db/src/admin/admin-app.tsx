import { useEffect, useState } from 'react';

import { ApiError, request } from './api-client.js';
import { credentialStorageKey, LoadingScreen, Login, TableSkeleton } from './auth-screen.js';
import { CreateUserDialog } from './create-user-dialog.js';
import { ManageUserDialog } from './manage-user-dialog.js';
import type { User, UserPage, UserStatus } from './types.js';
import { UserTable } from './user-table.js';

const pageSize = 10;

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
              Showing {shownFrom}-{shownTo} of {page?.total ?? 0}
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
