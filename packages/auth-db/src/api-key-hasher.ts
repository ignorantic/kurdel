import crypto from 'node:crypto';

export interface ApiKeyHasher {
  hash(key: string): string;
}

export class Sha256ApiKeyHasher implements ApiKeyHasher {
  hash(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}
