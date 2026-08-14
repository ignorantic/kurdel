import type { AuthCredential, AuthUser } from '@kurdel/common';

export type { AuthContext, AuthCredential } from '@kurdel/common';

/** Data produced by a strategy before middleware attaches the strategy name. */
export interface AuthenticationResult<TUser extends AuthUser = AuthUser> {
  user: TUser;
  credential?: AuthCredential;
  claims?: Record<string, unknown>;
}
