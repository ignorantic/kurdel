import type { IDatabase } from '@kurdel/db';

import { DatabaseAuthEventStore } from '../src/index.js';

describe('DatabaseAuthEventStore', () => {
  it('persists only the sanitized event fields', async () => {
    const db = { run: vi.fn(async () => undefined) } as unknown as IDatabase;
    const store = new DatabaseAuthEventStore(db);
    const occurredAt = new Date('2026-08-15T12:00:00.000Z');

    await store.report({
      type: 'authentication.succeeded',
      occurredAt,
      strategy: 'api-key',
      userId: 7,
      credential: { type: 'api-key', id: 'credential-1' },
    });

    expect(db.run).toHaveBeenCalledWith({
      sql: expect.stringContaining('INSERT INTO auth_events'),
      params: [
        'authentication.succeeded',
        occurredAt.toISOString(),
        'api-key',
        '7',
        'api-key',
        'credential-1',
        null,
        null,
      ],
    });
  });

  it('filters and maps stored events', async () => {
    const db = {
      all: vi.fn(async () => [{
        id: 3,
        type: 'authorization.denied',
        occurred_at: '2026-08-15T12:00:00.000Z',
        strategy: 'api-key',
        user_id: '7',
        credential_type: 'api-key',
        credential_id: 'credential-1',
        reason: 'policy-rejected',
        policy: 'manage-users',
      }]),
    } as unknown as IDatabase;
    const store = new DatabaseAuthEventStore(db, { authEvents: 'security_events' });

    await expect(store.list({
      userId: 7,
      type: 'authorization.denied',
      limit: 20,
    })).resolves.toEqual([{
      id: 3,
      type: 'authorization.denied',
      occurredAt: '2026-08-15T12:00:00.000Z',
      strategy: 'api-key',
      userId: '7',
      credentialType: 'api-key',
      credentialId: 'credential-1',
      reason: 'policy-rejected',
      policy: 'manage-users',
    }]);
    expect(db.all).toHaveBeenCalledWith(expect.objectContaining({
      sql: expect.stringContaining('FROM security_events WHERE user_id = ? AND type = ?'),
      params: ['7', 'authorization.denied', 20],
    }));
  });
});
