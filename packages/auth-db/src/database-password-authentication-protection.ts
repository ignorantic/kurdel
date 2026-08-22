import {
  PasswordAuthenticationBlockedError,
  type PasswordAuthenticationProtection,
} from '@kurdel/auth';
import type { Database } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type AttemptRecord = { locked_until: string | Date | null };

export interface PasswordAuthenticationProtectionOptions {
  maxFailures?: number;
  windowMs?: number;
  lockMs?: number;
}

const DEFAULT_OPTIONS = { maxFailures: 5, windowMs: 15 * 60_000, lockMs: 15 * 60_000 };

/** Database-backed, process-safe protection against password brute-force attempts. */
export class DatabasePasswordAuthenticationProtection implements PasswordAuthenticationProtection {
  private readonly tables: AuthDatabaseTables;
  private readonly options: typeof DEFAULT_OPTIONS;

  constructor(
    private readonly db: Database,
    tables: Partial<AuthDatabaseTables> = {},
    options: PasswordAuthenticationProtectionOptions = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
    this.options = { ...DEFAULT_OPTIONS, ...options };
    for (const [name, value] of Object.entries(this.options)) {
      if (!Number.isSafeInteger(value) || value <= 0) throw new TypeError(`${name} must be a positive integer`);
    }
  }

  async assertAllowed(login: string): Promise<void> {
    const row = await this.db.get({
      sql: `SELECT locked_until FROM ${this.tables.passwordAuthenticationAttempts} WHERE login = ?;`,
      params: [normalize(login)],
    }) as AttemptRecord | undefined;
    const retryAt = toFutureDate(row?.locked_until);
    if (retryAt) throw new PasswordAuthenticationBlockedError(retryAt);
  }

  async recordFailure(login: string): Promise<void> {
    const now = new Date();
    const resetBefore = new Date(now.getTime() - this.options.windowMs).toISOString();
    const lockedUntil = new Date(now.getTime() + this.options.lockMs).toISOString();
    const row = await this.db.get({
      sql: [
        `INSERT INTO ${this.tables.passwordAuthenticationAttempts}`,
        '(login, failed_attempts, window_started_at, locked_until, updated_at)',
        'VALUES (?, 1, ?, CASE WHEN ? = 1 THEN ? ELSE NULL END, ?)',
        'ON CONFLICT(login) DO UPDATE SET',
        'failed_attempts = CASE WHEN window_started_at <= ? THEN 1 ELSE failed_attempts + 1 END,',
        'window_started_at = CASE WHEN window_started_at <= ? THEN excluded.window_started_at ELSE window_started_at END,',
        'locked_until = CASE',
        'WHEN locked_until > ? THEN locked_until',
        'WHEN (CASE WHEN window_started_at <= ? THEN 1 ELSE failed_attempts + 1 END) >= ? THEN ?',
        'ELSE NULL END, updated_at = excluded.updated_at',
        'RETURNING locked_until;',
      ].join(' '),
      params: [normalize(login), now.toISOString(), this.options.maxFailures, lockedUntil,
        now.toISOString(), resetBefore, resetBefore, now.toISOString(), resetBefore,
        this.options.maxFailures, lockedUntil],
    }) as AttemptRecord;
    const retryAt = toFutureDate(row.locked_until);
    if (retryAt) throw new PasswordAuthenticationBlockedError(retryAt);
  }

  async recordSuccess(login: string): Promise<void> {
    await this.db.run({
      sql: `DELETE FROM ${this.tables.passwordAuthenticationAttempts} WHERE login = ?;`,
      params: [normalize(login)],
    });
  }
}

const normalize = (login: string) => login.trim().toLowerCase();

function toFutureDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() > Date.now() ? date : null;
}
