import type { IDatabase } from '@kurdel/db';

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

export class DatabaseUserService {
  constructor(private readonly db: IDatabase) {}

  async create(input: CreateUserInput): Promise<ManagedUser> {
    const email = this.normalizeEmail(input.email);
    const roles = await this.resolveRoles(input.roles);

    await this.db.run({ sql: 'BEGIN IMMEDIATE;', params: [] });
    try {
      const user = await this.db.get({
        sql: [
          'INSERT INTO users (name, email, status)',
          "VALUES (?, ?, 'active')",
          'RETURNING id, name, email, status, created_at, updated_at;',
        ].join(' '),
        params: [input.name, email],
      }) as UserRecord;
      await this.replaceRoles(user.id, roles);
      await this.db.run({ sql: 'COMMIT;', params: [] });
      return this.mapUser(user, roles.map(role => role.name));
    } catch (error) {
      await this.db.run({ sql: 'ROLLBACK;', params: [] });
      this.rethrowEmailConflict(error, email);
    }
  }

  async list(input: ListUsersInput): Promise<UserList> {
    const where = input.status ? 'WHERE status = ?' : '';
    const params = input.status ? [input.status] : [];
    const records = await this.db.all({
      sql: [
        'SELECT id, name, email, status, created_at, updated_at',
        `FROM users ${where}`,
        'ORDER BY id DESC LIMIT ? OFFSET ?;',
      ].join(' '),
      params: [...params, input.limit, input.offset],
    }) as UserRecord[];
    const count = await this.db.get({
      sql: `SELECT COUNT(*) AS count FROM users ${where};`,
      params,
    }) as CountRecord;
    const roles = await this.loadRoles(records.map(user => user.id));

    return {
      users: records.map(user => this.mapUser(user, roles.get(user.id) ?? [])),
      total: count.count,
      limit: input.limit,
      offset: input.offset,
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

    await this.db.run({ sql: 'BEGIN IMMEDIATE;', params: [] });
    try {
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
        await this.db.run({
          sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?;`,
          params: [...params, userId],
        });
      }
      if (roles) await this.replaceRoles(userId, roles);
      await this.db.run({ sql: 'COMMIT;', params: [] });
    } catch (error) {
      await this.db.run({ sql: 'ROLLBACK;', params: [] });
      this.rethrowEmailConflict(error, email);
    }
    return this.findById(userId);
  }

  private async findRecord(userId: number): Promise<UserRecord | undefined> {
    return await this.db.get({
      sql: [
        'SELECT id, name, email, status, created_at, updated_at',
        'FROM users WHERE id = ?;',
      ].join(' '),
      params: [userId],
    }) as UserRecord | undefined;
  }

  private async resolveRoles(names: string[]): Promise<RoleRecord[]> {
    const uniqueNames = [...new Set(names)];
    const placeholders = uniqueNames.map(() => '?').join(', ');
    const records = await this.db.all({
      sql: `SELECT id, name FROM roles WHERE name IN (${placeholders});`,
      params: uniqueNames,
    }) as RoleRecord[];
    const found = new Set(records.map(role => role.name));
    const unknown = uniqueNames.filter(role => !found.has(role));
    if (unknown.length > 0) throw new UnknownRolesError(unknown);
    const byName = new Map(records.map(role => [role.name, role]));
    return uniqueNames.map(name => byName.get(name)!);
  }

  private async replaceRoles(userId: number, roles: RoleRecord[]): Promise<void> {
    await this.db.run({ sql: 'DELETE FROM user_roles WHERE user_id = ?;', params: [userId] });
    for (const role of roles) {
      await this.db.run({
        sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
        params: [userId, role.id],
      });
    }
  }

  private async loadRoles(userIds: number[]): Promise<Map<number, string[]>> {
    const result = new Map<number, string[]>();
    if (userIds.length === 0) return result;
    const records = await this.db.all({
      sql: [
        'SELECT user_roles.user_id, roles.name FROM user_roles',
        'INNER JOIN roles ON roles.id = user_roles.role_id',
        `WHERE user_roles.user_id IN (${userIds.map(() => '?').join(', ')})`,
        'ORDER BY roles.name;',
      ].join(' '),
      params: userIds,
    }) as Array<{ user_id: number; name: string }>;
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
    if (email && error instanceof Error && error.message.includes('users.email')) {
      throw new DuplicateUserEmailError(email);
    }
    throw error;
  }
}
