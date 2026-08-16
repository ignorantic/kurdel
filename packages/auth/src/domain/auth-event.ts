import type { AuthCredential, AuthUser } from '@kurdel/common';

type AuthEventBase = {
  occurredAt: Date;
  userId?: AuthUser['id'];
  credential?: AuthCredential;
};

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
      type: 'jwt-session.created' | 'jwt-session.revoked';
    });

/** Receives sanitized authentication and authorization lifecycle events. */
export interface AuthEventSink {
  report(event: AuthEvent): Promise<void> | void;
}

/** Default sink used when an application does not configure event reporting. */
export class NoopAuthEventSink implements AuthEventSink {
  report(_event: AuthEvent): void {}
}
