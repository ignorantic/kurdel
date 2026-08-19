import type { Container } from '@kurdel/ioc';

import type { AuthEventSink } from './auth-event.js';

/**
 * ## AuthEventSinkProvider
 *
 * Describes how an authentication event sink is supplied to
 * {@link AuthModule}.
 *
 * Applications may provide either:
 * - an existing event sink instance
 * - a factory that resolves the sink from the IoC container
 */
export type AuthEventSinkProvider =
  | { use: AuthEventSink }
  | { useFactory: (container: Container) => AuthEventSink };