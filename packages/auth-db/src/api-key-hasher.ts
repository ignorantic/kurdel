import crypto from 'node:crypto';

/**
 * ## ApiKeyHasher
 *
 * Computes deterministic hashes of API keys for secure storage
 * and lookup.
 *
 * Implementations must always produce the same hash for the same
 * input key.
 */
export interface ApiKeyHasher {
  hash(key: string): string;
}

/**
 * SHA-256 implementation of {@link ApiKeyHasher}.
 *
 * Produces hexadecimal SHA-256 digests suitable for database
 * storage and credential lookup.
 */
export class Sha256ApiKeyHasher implements ApiKeyHasher {
  hash(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
