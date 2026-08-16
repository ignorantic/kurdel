import type { IDatabase, IDatabaseSession } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

export type UserStatus = 'active' | 'disabled';

type RoleRecord = {
  id: number;
  name: string;
};

type UserRecord = {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
};

type CountRecord = { count: number };

export interface CreateUserInput {
  name: string;
  email: string;
  roles: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  status?: UserStatus;
  roles?: string[];
}

export interface ListUsersInput {
  limit: number;
  offset: number;
  status?: UserStatus;
  search?: string;
  sortBy?: 'id' | 'name' | 'email' | 'status' | 'createdAt' | 'updatedAt';
  sortDirection?: 'asc' | 'desc';
}

export interface BulkUpdateUsersInput {
  userIds: number[];
  status?: UserStatus;
  addRoles?: string[];
  removeRoles?: string[];
}

export interface RoleSummary {
  id: number;
  name: string;
  userCount: number;
}

export interface AdminDashboardStats {
  users: { total: number; active: number; disabled: number };
  apiKeys: { active: number; revoked: number; expired: number };
  failedAuthenticationsLast24Hours: number;
}

export interface ManagedUser {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserList {
  users: ManagedUser[];
  total: number;
  limit: number;
  offset: number;
}

export class UnknownRolesError extends Error {
  constructor(readonly roles: string[]) {
    super(`Unknown roles: ${roles.join(', ')}`);
  }
}

export class UserNotFoundError extends Error {
  constructor(readonly userId: number) {
    super(`User ${userId} not found`);
  }
}

export class DuplicateUserEmailError extends Error {
  constructor(readonly email: string) {
    super(`A user with email ${email} already exists`);
  }
}

export class RoleNotFoundError extends Error {
  constructor(readonly roleId: number) {
    super(`Role ${roleId} not found`);
  }
}

export class DuplicateRoleNameError extends Error {
  constructor(readonly name: string) {
    super(`Role ${name} already exists`);
  }
}

export class RoleInUseError extends Error {
  constructor(
    readonly roleId: number,
    readonly userCount: number
  ) {
    super(`Role ${roleId} is assigned to ${userCount} users`);
  }
}

export class DatabaseUserService {
  private readonly tables: AuthDatabaseTables;

  constructor(
    private readonly db: IDatabase,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async listRoles(): Promise<string[]> {
    const roles = (await this.db.all({
      sql: `SELECT name FROM ${this.tables.roles} ORDER BY name;`,
      params: [],
    })) as Array<{ name: string }>;
    return roles.map(role => role.name);
  }

  async listRoleSummaries(): Promise<RoleSummary[]> {
    const records = (await this.db.all({
      sql: [
        `SELECT r.id, r.name, COUNT(ur.user_id) AS user_count FROM ${this.tables.roles} r`,
        `LEFT JOIN ${this.tables.userRoles} ur ON ur.role_id = r.id`,
        'GROUP BY r.id, r.name ORDER BY r.name;',
      ].join(' '),
      params: [],
    })) as Array<{ id: number; name: string; user_count: number }>;
    return records.map(role => ({ id: role.id, name: role.name, userCount: role.user_count }));
  }

  async createRole(name: string): Promise<RoleSummary> {
    const normalized = name.trim();
    try {
      const role = (await this.db.get({
        sql: `INSERT INTO ${this.tables.roles} (name) VALUES (?) RETURNING id, name;`,
        params: [normalized],
      })) as RoleRecord;
      return { ...role, userCount: 0 };
    } catch (error) {
      this.rethrowRoleConflict(error, normalized);
    }
  }

  async renameRole(roleId: number, name: string): Promise<RoleSummary> {
    const existing = await this.findRole(roleId);
    if (!existing) throw new RoleNotFoundError(roleId);
    const normalized = name.trim();
    try {
      await this.db.run({
        sql: `UPDATE ${this.tables.roles} SET name = ? WHERE id = ?;`,
        params: [normalized, roleId],
      });
    } catch (error) {
      this.rethrowRoleConflict(error, normalized);
    }
    return (await this.listRoleSummaries()).find(role => role.id === roleId)!;
  }

  async deleteRole(roleId: number): Promise<void> {
    const existing = await this.findRole(roleId);
    if (!existing) throw new RoleNotFoundError(roleId);
    const usage = (await this.db.get({
      sql: `SELECT COUNT(*) AS count FROM ${this.tables.userRoles} WHERE role_id = ?;`,
      params: [roleId],
    })) as CountRecord;
    if (usage.count > 0) throw new RoleInUseError(roleId, usage.count);
    await this.db.run({
      sql: `DELETE FROM ${this.tables.roles} WHERE id = ?;`,
      params: [roleId],
    });
  }

  async create(input: CreateUserInput): Promise<ManagedUser> {
    const email = this.normalizeEmail(input.email);
    const roles = await this.resolveRoles(input.roles);

    try {
      return await this.db.transaction(async transaction => {
        const user = (await transaction.get({
          sql: [
            `INSERT INTO ${this.tables.users} (name, email, status)`,
            "VALUES (?, ?, 'active')",
            'RETURNING id, name, email, status, created_at, updated_at;',
          ].join(' '),
          params: [input.name, email],
        })) as UserRecord;
        await this.replaceRoles(transaction, user.id, roles);
        return this.mapUser(
          user,
          roles.map(role => role.name)
        );
      });
    } catch (error) {
      this.rethrowEmailConflict(error, email);
    }
  }

  async list(input: ListUsersInput): Promise<UserList> {
    const conditions: string[] = [];
    const params: unknown[] = [];
    if (input.status) {
      conditions.push('status = ?');
      params.push(input.status);
    }
    if (input.search?.trim()) {
      conditions.push('(LOWER(name) LIKE ? OR LOWER(email) LIKE ?)');
      const search = `%${input.search.trim().toLowerCase()}%`;
      params.push(search, search);
    }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortColumns = {
      id: 'id',
      name: 'LOWER(name)',
      email: 'LOWER(email)',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    } as const;
    const sortColumn = sortColumns[input.sortBy ?? 'id'];
    const sortDirection = input.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const records = (await this.db.all({
      sql: [
        'SELECT id, name, email, status, created_at, updated_at',
        `FROM ${this.tables.users} ${where}`,
        `ORDER BY ${sortColumn} ${sortDirection}, id DESC LIMIT ? OFFSET ?;`,
      ].join(' '),
      params: [...params, input.limit, input.offset],
    })) as UserRecord[];
    const count = (await this.db.get({
      sql: `SELECT COUNT(*) AS count FROM ${this.tables.users} ${where};`,
      params,
    })) as CountRecord;
    const roles = await this.loadRoles(records.map(user => user.id));

    return {
      users: records.map(user => this.mapUser(user, roles.get(user.id) ?? [])),
      total: count.count,
      limit: input.limit,
      offset: input.offset,
    };
  }

  async bulkUpdate(input: BulkUpdateUsersInput): Promise<ManagedUser[]> {
    const userIds = [...new Set(input.userIds)];
    if (userIds.length === 0) return [];
    const addRoles = input.addRoles ? await this.resolveRoles(input.addRoles) : [];
    const removeRoles = input.removeRoles ? await this.resolveRoles(input.removeRoles) : [];
    await this.ensureUsersExist(userIds);
    await this.db.transaction(async transaction => {
      if (input.status) {
        await transaction.run({
          sql: `UPDATE ${this.tables.users} SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${userIds.map(() => '?').join(', ')});`,
          params: [input.status, ...userIds],
        });
      }
      for (const userId of userIds) {
        for (const role of addRoles) {
          await transaction.run({
            sql: `INSERT OR IGNORE INTO ${this.tables.userRoles} (user_id, role_id) VALUES (?, ?);`,
            params: [userId, role.id],
          });
        }
        for (const role of removeRoles) {
          await transaction.run({
            sql: `DELETE FROM ${this.tables.userRoles} WHERE user_id = ? AND role_id = ?;`,
            params: [userId, role.id],
          });
        }
      }
    });
    return Promise.all(userIds.map(userId => this.findById(userId)));
  }

  async bulkDelete(userIds: number[]): Promise<void> {
    const uniqueIds = [...new Set(userIds)];
    if (uniqueIds.length === 0) return;
    await this.ensureUsersExist(uniqueIds);
    await this.db.transaction(async transaction => {
      const placeholders = uniqueIds.map(() => '?').join(', ');
      await transaction.run({
        sql: `DELETE FROM ${this.tables.apiKeys} WHERE user_id IN (${placeholders});`,
        params: uniqueIds,
      });
      await transaction.run({
        sql: `DELETE FROM ${this.tables.userRoles} WHERE user_id IN (${placeholders});`,
        params: uniqueIds,
      });
      await transaction.run({
        sql: `DELETE FROM ${this.tables.users} WHERE id IN (${placeholders});`,
        params: uniqueIds,
      });
    });
  }

  async dashboardStats(): Promise<AdminDashboardStats> {
    const users = (await this.db.get({
      sql: [
        'SELECT COUNT(*) AS total,',
        "SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,",
        "SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled",
        `FROM ${this.tables.users};`,
      ].join(' '),
      params: [],
    })) as { total: number; active: number; disabled: number };
    const apiKeys = (await this.db.get({
      sql: [
        "SELECT SUM(CASE WHEN status = 'active' AND (expires_at IS NULL OR datetime(expires_at) > CURRENT_TIMESTAMP) THEN 1 ELSE 0 END) AS active,",
        "SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) AS revoked,",
        "SUM(CASE WHEN status = 'active' AND datetime(expires_at) <= CURRENT_TIMESTAMP THEN 1 ELSE 0 END) AS expired",
        `FROM ${this.tables.apiKeys};`,
      ].join(' '),
      params: [],
    })) as { active: number | null; revoked: number | null; expired: number | null };
    const failures = (await this.db.get({
      sql: [
        'SELECT COUNT(*) AS count',
        `FROM ${this.tables.authEvents}`,
        "WHERE type = 'authentication.failed' AND datetime(occurred_at) >= datetime('now', '-1 day');",
      ].join(' '),
      params: [],
    })) as CountRecord;
    return {
      users: { total: users.total, active: users.active ?? 0, disabled: users.disabled ?? 0 },
      apiKeys: {
        active: apiKeys.active ?? 0,
        revoked: apiKeys.revoked ?? 0,
        expired: apiKeys.expired ?? 0,
      },
      failedAuthenticationsLast24Hours: failures.count,
    };
  }

  async findById(userId: number): Promise<ManagedUser> {
    const user = await this.findRecord(userId);
    if (!user) throw new UserNotFoundError(userId);
    const roles = await this.loadRoles([userId]);
    return this.mapUser(user, roles.get(userId) ?? []);
  }

  async update(userId: number, input: UpdateUserInput): Promise<ManagedUser> {
    const existing = await this.findRecord(userId);
    if (!existing) throw new UserNotFoundError(userId);
    const roles = input.roles ? await this.resolveRoles(input.roles) : undefined;
    const email = input.email ? this.normalizeEmail(input.email) : undefined;

    try {
      await this.db.transaction(async transaction => {
        const updates: string[] = [];
        const params: unknown[] = [];
        for (const [column, value] of [
          ['name', input.name],
          ['email', email],
          ['status', input.status],
        ] as const) {
          if (value !== undefined) {
            updates.push(`${column} = ?`);
            params.push(value);
          }
        }
        if (updates.length > 0 || roles) {
          updates.push('updated_at = CURRENT_TIMESTAMP');
          await transaction.run({
            sql: `UPDATE ${this.tables.users} SET ${updates.join(', ')} WHERE id = ?;`,
            params: [...params, userId],
          });
        }
        if (roles) await this.replaceRoles(transaction, userId, roles);
      });
    } catch (error) {
      this.rethrowEmailConflict(error, email);
    }
    return this.findById(userId);
  }

  async delete(userId: number): Promise<void> {
    const existing = await this.findRecord(userId);
    if (!existing) throw new UserNotFoundError(userId);

    await this.db.transaction(async transaction => {
      await transaction.run({
        sql: `DELETE FROM ${this.tables.apiKeys} WHERE user_id = ?;`,
        params: [userId],
      });
      await transaction.run({
        sql: `DELETE FROM ${this.tables.userRoles} WHERE user_id = ?;`,
        params: [userId],
      });
      await transaction.run({
        sql: `DELETE FROM ${this.tables.users} WHERE id = ?;`,
        params: [userId],
      });
    });
  }

  private async findRecord(userId: number): Promise<UserRecord | undefined> {
    return (await this.db.get({
      sql: [
        'SELECT id, name, email, status, created_at, updated_at',
        `FROM ${this.tables.users} WHERE id = ?;`,
      ].join(' '),
      params: [userId],
    })) as UserRecord | undefined;
  }

  private async findRole(roleId: number): Promise<RoleRecord | undefined> {
    return (await this.db.get({
      sql: `SELECT id, name FROM ${this.tables.roles} WHERE id = ?;`,
      params: [roleId],
    })) as RoleRecord | undefined;
  }

  private async ensureUsersExist(userIds: number[]): Promise<void> {
    if (userIds.length === 0) return;
    const record = (await this.db.get({
      sql: `SELECT COUNT(*) AS count FROM ${this.tables.users} WHERE id IN (${userIds.map(() => '?').join(', ')});`,
      params: userIds,
    })) as CountRecord;
    if (record.count === userIds.length) return;
    for (const userId of userIds) {
      if (!(await this.findRecord(userId))) throw new UserNotFoundError(userId);
    }
  }

  private async resolveRoles(names: string[]): Promise<RoleRecord[]> {
    const uniqueNames = [...new Set(names)];
    const placeholders = uniqueNames.map(() => '?').join(', ');
    const records = (await this.db.all({
      sql: `SELECT id, name FROM ${this.tables.roles} WHERE name IN (${placeholders});`,
      params: uniqueNames,
    })) as RoleRecord[];
    const found = new Set(records.map(role => role.name));
    const unknown = uniqueNames.filter(role => !found.has(role));
    if (unknown.length > 0) throw new UnknownRolesError(unknown);
    const byName = new Map(records.map(role => [role.name, role]));
    return uniqueNames.map(name => byName.get(name)!);
  }

  private async replaceRoles(
    database: IDatabaseSession,
    userId: number,
    roles: RoleRecord[]
  ): Promise<void> {
    await database.run({
      sql: `DELETE FROM ${this.tables.userRoles} WHERE user_id = ?;`,
      params: [userId],
    });
    for (const role of roles) {
      await database.run({
        sql: `INSERT INTO ${this.tables.userRoles} (user_id, role_id) VALUES (?, ?);`,
        params: [userId, role.id],
      });
    }
  }

  private async loadRoles(userIds: number[]): Promise<Map<number, string[]>> {
    const result = new Map<number, string[]>();
    if (userIds.length === 0) return result;
    const records = (await this.db.all({
      sql: [
        `SELECT ${this.tables.userRoles}.user_id, ${this.tables.roles}.name`,
        `FROM ${this.tables.userRoles}`,
        `INNER JOIN ${this.tables.roles}`,
        `ON ${this.tables.roles}.id = ${this.tables.userRoles}.role_id`,
        `WHERE ${this.tables.userRoles}.user_id IN (${userIds.map(() => '?').join(', ')})`,
        `ORDER BY ${this.tables.roles}.name;`,
      ].join(' '),
      params: userIds,
    })) as Array<{ user_id: number; name: string }>;
    for (const role of records) {
      result.set(role.user_id, [...(result.get(role.user_id) ?? []), role.name]);
    }
    return result;
  }

  private mapUser(user: UserRecord, roles: string[]): ManagedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roles,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  private normalizeEmail(email: string): string {
    return email.toLowerCase();
  }

  private rethrowEmailConflict(error: unknown, email?: string): never {
    if (email && error instanceof Error && error.message.includes(`${this.tables.users}.email`)) {
      throw new DuplicateUserEmailError(email);
    }
    throw error;
  }

  private rethrowRoleConflict(error: unknown, name: string): never {
    if (error instanceof Error && error.message.includes(`${this.tables.roles}.name`)) {
      throw new DuplicateRoleNameError(name);
    }
    throw error;
  }
}
