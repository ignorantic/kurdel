import crypto from 'node:crypto';

import type { PasswordHasher } from './password-hasher.js';

export interface ScryptPasswordHasherOptions {
  cost?: number;
  blockSize?: number;
  parallelization?: number;
  keyLength?: number;
  saltLength?: number;
}

/** Password hasher with a self-describing format that supports future rehashing. */
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
