import type { AuthEventSink } from '@kurdel/auth';
import type { Container } from '@kurdel/ioc';

import { AUTH_DB_TOKENS, databaseAuthEventSink } from '../src/index.js';

describe('databaseAuthEventSink', () => {
  it('resolves the database event store from the application container', () => {
    const eventStore: AuthEventSink = { report: vi.fn() };
    const container = {
      get: vi.fn(() => eventStore),
    } as unknown as Container;
    const provider = databaseAuthEventSink();
    if (!('useFactory' in provider)) throw new Error('Expected a factory provider');

    expect(provider.useFactory(container)).toBe(eventStore);
    expect(container.get).toHaveBeenCalledWith(AUTH_DB_TOKENS.EventStore);
  });
});
