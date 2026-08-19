import type { AuthUser } from '@kurdel/common';

import type { AuthorizationPolicy } from './authorization-policy.js';

/**
 * Determines whether a user has a resolved permission.
 *
 * Permissions are expected to be precomputed during authentication and
 * attached to the authenticated user.
 */
export function hasPermission(
  user: Readonly<AuthUser>,
  permission: string,
): boolean {
  return user.permissions?.includes(permission) ?? false;
}

/**
 * Creates an authorization policy that requires a specific permission.
 *
 * Access is granted only when the authenticated user has the specified
 * resolved permission.
 */
export function permissionPolicy(
  permission: string,
): AuthorizationPolicy {
  return {
    authorize: auth =>
      hasPermission(auth.user, permission)
        ? { allowed: true }
        : {
            allowed: false,
            reason: `missing-permission:${permission}`,
          },
  };
}