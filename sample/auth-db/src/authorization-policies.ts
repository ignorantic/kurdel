import type { AuthorizationPolicy } from '@kurdel/auth';

/** Restricts administration endpoints to API-key authenticated administrators. */
export const manageUsersPolicy: AuthorizationPolicy = {
  authorize: auth =>
    auth.credential?.type === 'api-key' && auth.user.roles.includes('admin'),
};

/** Allows administrators to view any user and regular users to view themselves. */
export const viewUserPolicy: AuthorizationPolicy = {
  authorize: (auth, ctx) =>
    auth.user.roles.includes('admin') || String(auth.user.id) === ctx.params.id,
};
