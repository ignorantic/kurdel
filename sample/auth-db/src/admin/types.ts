export type UserStatus = 'active' | 'disabled';

export type User = {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserPage = {
  users: User[];
  total: number;
  limit: number;
  offset: number;
};

export type ApiKeyMetadata = {
  id: string;
  name: string;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

export type CreatedApiKey = {
  id: string;
  key: string;
  name: string;
  expiresAt: string | null;
};

export type AuthEventType =
  | 'authentication.succeeded'
  | 'authentication.failed'
  | 'authorization.denied'
  | 'api-key.issued'
  | 'api-key.revoked';

export type AuthEvent = {
  id: number;
  type: AuthEventType;
  occurredAt: string;
  strategy: string | null;
  userId: string | null;
  credentialType: string | null;
  credentialId: string | null;
  reason: string | null;
  policy: string | null;
};
