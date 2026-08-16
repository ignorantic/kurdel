import {
  allOf,
  anyOf,
  hasPermission,
  permissionPolicy,
  type AuthorizationPolicy,
} from '@kurdel/auth';

const apiKeyCredentialPolicy: AuthorizationPolicy = {
  authorize: auth => auth.credential?.type === 'api-key'
    ? { allowed: true }
    : { allowed: false, reason: 'api-key-required' },
};

const viewSelfPolicy: AuthorizationPolicy = {
  authorize: (auth, ctx) => hasPermission(auth.user, 'users.view.self') &&
    String(auth.user.id) === ctx.params.id
    ? { allowed: true }
    : { allowed: false, reason: 'self-access-required' },
};

/** Restricts administration endpoints to API-key authenticated administrators. */
export const manageUsersPolicy = allOf(
  apiKeyCredentialPolicy,
  permissionPolicy('users.manage'),
);

/** Allows administrators to view any user and regular users to view themselves. */
export const viewUserPolicy = anyOf(
  permissionPolicy('users.view.any'),
  viewSelfPolicy,
);
