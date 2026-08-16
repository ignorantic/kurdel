import type { AuthUser } from '@kurdel/common';

import type { AuthorizationPolicy } from './authorization-policy.js';

/** Returns whether an authenticated user has a resolved capability. */
export function hasPermission(user: Readonly<AuthUser>, permission: string): boolean {
  return user.permissions?.includes(permission) ?? false;
}

/** Creates a policy that requires one resolved permission. */
export function permissionPolicy(permission: string): AuthorizationPolicy {
  return { authorize: auth => hasPermission(auth.user, permission) };
}
