import type { AuthCredential, AuthUser } from '@kurdel/common';

/**
 * Common properties shared by every authentication lifecycle event.
 */
type AuthEventBase = {
  /** Time at which the event occurred. */
  occurredAt: Date;

  /** Authenticated user, when known. */
  userId?: AuthUser['id'];

  /** Credential involved in the event, when applicable. */
  credential?: AuthCredential;
};

/**
 * ## AuthEvent
 *
 * Represents a sanitized authentication or authorization lifecycle event.
 *
 * Events intentionally exclude secrets and raw credentials so they can be
 * safely persisted, logged, or forwarded to external audit systems.
 */
export type AuthEvent =
  | (AuthEventBase & {
      type: 'authentication.succeeded';
      strategy: string;
    })
  | (AuthEventBase & {
      type: 'authentication.failed';
      strategy: string;
      reason: 'invalid-credential';
    })
  | (AuthEventBase & {
      type: 'authorization.denied';
      strategy?: string;
      reason: 'missing-role' | 'missing-authentication' | 'policy-rejected';
      policy?: string;
      decisionReason?: string;
    })
  | (AuthEventBase & {
      type: 'api-key.issued' | 'api-key.revoked';
    })
  | (AuthEventBase & {
      type: 'jwt-session.created' | 'jwt-session.refreshed' | 'jwt-session.revoked';
    })
  | (AuthEventBase & {
      type: 'password.changed' | 'password-reset.requested' | 'password-reset.completed';
    });

/**
 * ## AuthEventSink
 *
 * Receives sanitized authentication lifecycle events.
 *
 * Implementations may persist events, write them to logs, publish them to
 * message brokers, or forward them to external audit systems.
 */
export interface AuthEventSink {
  /**
   * Reports an authentication lifecycle event.
   */
  report(event: AuthEvent): Promise<void> | void;
}

/**
 * ## NoopAuthEventSink
 *
 * Default {@link AuthEventSink} implementation that silently ignores all
 * reported events.
 *
 * Used when an application does not configure audit reporting.
 */
export class NoopAuthEventSink implements AuthEventSink {
  report(_event: AuthEvent): void {}
}
