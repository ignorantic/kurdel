import { hasPermission, type AuthorizationPolicy } from '@kurdel/auth';

/** Restricts administration endpoints to API-key authenticated administrators. */
export const manageUsersPolicy: AuthorizationPolicy = {
  authorize: auth =>
    auth.credential?.type === 'api-key' && hasPermission(auth.user, 'users.manage'),
};

/** Allows administrators to view any user and regular users to view themselves. */
export const viewUserPolicy: AuthorizationPolicy = {
  authorize: (auth, ctx) =>
    hasPermission(auth.user, 'users.view.any') ||
    (hasPermission(auth.user, 'users.view.self') && String(auth.user.id) === ctx.params.id),
};
