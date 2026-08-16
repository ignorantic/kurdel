export type JwtSession = {
  id: string;
  userId: string | number;
  revoked: boolean;
  expiresAt?: Date;
};

/** Resolves server-side JWT session state used for token revocation. */
export interface JwtSessionRepository {
  findById(id: string): Promise<JwtSession | null>;
}
