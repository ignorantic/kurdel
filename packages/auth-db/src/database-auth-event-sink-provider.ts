import type { AuthEventSink, AuthEventSinkProvider } from '@kurdel/auth';
import type { Container } from '@kurdel/ioc';

import { AUTH_DB_TOKENS } from './tokens.js';

/**
 * Resolves the database-backed authentication event sink for `AuthModule`.
 *
 * `AuthDatabaseModule` must be configured with `audit: true` so that the
 * event store is registered in the application container.
 */
export function databaseAuthEventSink(): AuthEventSinkProvider {
  return {
    useFactory(container: Container): AuthEventSink {
      return container.get(AUTH_DB_TOKENS.EventStore);
    },
  };
}
