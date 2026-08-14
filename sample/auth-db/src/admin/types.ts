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
