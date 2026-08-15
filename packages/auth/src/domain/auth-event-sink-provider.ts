import type { Container } from '@kurdel/ioc';

import type { AuthEventSink } from './auth-event.js';

export type AuthEventSinkProvider =
  | { use: AuthEventSink }
  | { useFactory: (container: Container) => AuthEventSink };
