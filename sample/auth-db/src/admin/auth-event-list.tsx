import { useEffect, useState } from 'react';

import { ApiError, request } from './api-client.js';
import { formatDate } from './formatters.js';
import type { AuthEvent, AuthEventType } from './types.js';

const eventTypes: Array<{ value: AuthEventType | ''; label: string }> = [
  { value: '', label: 'All events' },
  { value: 'authentication.succeeded', label: 'Authentication succeeded' },
  { value: 'authentication.failed', label: 'Authentication failed' },
  { value: 'authorization.denied', label: 'Authorization denied' },
  { value: 'api-key.issued', label: 'API key issued' },
  { value: 'api-key.revoked', label: 'API key revoked' },
];

export function AuthEventList({
  userId,
  onUnauthorized,
}: {
  userId: number;
  onUnauthorized: () => void;
}) {
  const [events, setEvents] = useState<AuthEvent[] | null>(null);
  const [type, setType] = useState<AuthEventType | ''>('');
  const [reload, setReload] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams({ limit: '50' });
    if (type) query.set('type', type);
    setError('');
    request<{ events: AuthEvent[] }>(`/users/${userId}/auth-events?${query}`)
      .then(result => setEvents(result.events))
      .catch(reason => {
        if (reason instanceof ApiError && (reason.status === 401 || reason.status === 403)) {
          onUnauthorized();
          return;
        }
        setError('Could not load authentication events.');
      });
  }, [onUnauthorized, reload, type, userId]);

  return (
    <section className="audit-section">
      <header>
        <div>
          <h3>Security activity</h3>
          <p>Sanitized authentication, authorization, and credential events.</p>
        </div>
        <button className="secondary-button compact" onClick={() => setReload(value => value + 1)}>
          Refresh
        </button>
      </header>
      <label className="audit-filter">
        <span>Event type</span>
        <select value={type} onChange={event => setType(event.target.value as AuthEventType | '')}>
          {eventTypes.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {events?.length === 0 && <p className="api-key-empty">No matching events yet.</p>}
      {events && events.length > 0 && (
        <div className="audit-list">
          {events.map(event => (
            <article key={event.id}>
              <div>
                <strong>{event.type}</strong>
                <small>{event.reason ?? event.strategy ?? event.credentialType ?? 'security event'}</small>
              </div>
              <time>{formatDate(event.occurredAt)}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
