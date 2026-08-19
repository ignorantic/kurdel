import crypto from 'node:crypto';

import type { PasswordHasher } from './password-hasher.js';

/**
 * ## ScryptPasswordHasherOptions
 *
 * Configures password hashing parameters.
 *
 * The defaults follow conservative values suitable for general-purpose
 * password authentication.
 */
export interface ScryptPasswordHasherOptions {
  /** CPU/memory cost parameter (`N`). */
  cost?: number;

  /** Block size parameter (`r`). */
  blockSize?: number;

  /** Parallelization parameter (`p`). */
  parallelization?: number;

  /** Derived key length in bytes. */
  keyLength?: number;

  /** Random salt length in bytes. */
  saltLength?: number;
}

/**
 * ## ScryptPasswordHasher
 *
 * Password hasher based on the scrypt key derivation function.
 *
 * Responsibilities:
 * - derive password hashes using scrypt
 * - verify passwords against persisted hashes
 * - embed hashing parameters into the stored hash format
 *
 * Guarantees:
 * - every generated hash uses a cryptographically secure random salt
 * - password verification uses constant-time comparison
 * - malformed or unsupported hashes never authenticate
 *
 * Non-responsibilities:
 * - password persistence
 * - password policy enforcement
 * - credential management
 */
export class ScryptPasswordHasher implements PasswordHasher {
  private readonly cost: number;
  private readonly blockSize: number;
  private readonly parallelization: number;
  private readonly keyLength: number;
  private readonly saltLength: number;

  constructor(options: ScryptPasswordHasherOptions = {}) {
    this.cost = options.cost ?? 16_384;
    this.blockSize = options.blockSize ?? 8;
    this.parallelization = options.parallelization ?? 1;
    this.keyLength = options.keyLength ?? 64;
    this.saltLength = options.saltLength ?? 16;
  }

  /**
   * Derives a self-describing password hash.
   *
   * The resulting hash embeds the algorithm, parameters, salt,
   * and derived key, allowing future verification without
   * additional metadata.
   */
  async hash(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.saltLength);
    const derived = await this.derive(
      password,
      salt,
      this.cost,
      this.blockSize,
      this.parallelization,
      this.keyLength
    );
    return [
      'scrypt',
      this.cost,
      this.blockSize,
      this.parallelization,
      salt.toString('base64url'),
      derived.toString('base64url'),
    ].join('$');
  }

  /**
   * Verifies a password against a previously generated hash.
   *
   * Returns `false` for malformed hashes, unsupported parameters,
   * or verification failures.
   */
  async verify(password: string, encodedHash: string): Promise<boolean> {
    const parts = encodedHash.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const [cost, blockSize, parallelization] = parts.slice(1, 4).map(Number);
    const salt = Buffer.from(parts[4], 'base64url');
    const expected = Buffer.from(parts[5], 'base64url');
    if (!this.validParameters(cost, blockSize, parallelization, salt, expected)) return false;
    try {
      const actual = await this.derive(
        password,
        salt,
        cost,
        blockSize,
        parallelization,
        expected.length
      );
      return crypto.timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }

  private async derive(
    password: string,
    salt: Buffer,
    cost: number,
    blockSize: number,
    parallelization: number,
    keyLength: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        keyLength,
        {
          N: cost,
          r: blockSize,
          p: parallelization,
          maxmem: Math.max(32 * 1024 * 1024, 256 * cost * blockSize),
        },
        (error, derivedKey) => (error ? reject(error) : resolve(derivedKey))
      );
    });
  }

  private validParameters(
    cost: number,
    blockSize: number,
    parallelization: number,
    salt: Buffer,
    hash: Buffer
  ): boolean {
    return (
      Number.isInteger(cost) &&
      cost >= 1024 &&
      cost <= 1_048_576 &&
      Number.isInteger(blockSize) &&
      blockSize >= 1 &&
      blockSize <= 32 &&
      Number.isInteger(parallelization) &&
      parallelization >= 1 &&
      parallelization <= 16 &&
      salt.length >= 8 &&
      salt.length <= 64 &&
      hash.length >= 32 &&
      hash.length <= 128
    );
  }
}
