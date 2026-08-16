import type { AuthUserRepository } from '@kurdel/auth';
import type { AuthUser } from '@kurdel/common';
import type { IDatabase } from '@kurdel/db';

import { resolveAuthDatabaseTables, type AuthDatabaseTables } from './auth-database-tables.js';

type UserRecord = { id: string | number; status: string };
type RoleRecord = { name: string };
type PermissionRecord = { name: string };

export class DatabaseAuthUserRepository implements AuthUserRepository {
  private readonly tables: AuthDatabaseTables;

  constructor(
    private readonly db: IDatabase,
    tables: Partial<AuthDatabaseTables> = {}
  ) {
    this.tables = resolveAuthDatabaseTables(tables);
  }

  async findById(id: string | number): Promise<AuthUser | null> {
    const user = (await this.db.get({
      sql: `SELECT id, status FROM ${this.tables.users} WHERE id = ?;`,
      params: [id],
    })) as UserRecord | undefined;
    if (!user || user.status !== 'active') return null;

    const roles = (await this.db.all({
      sql: [
        `SELECT ${this.tables.roles}.name`,
        `FROM ${this.tables.roles}`,
        `INNER JOIN ${this.tables.userRoles}`,
        `ON ${this.tables.userRoles}.role_id = ${this.tables.roles}.id`,
        `WHERE ${this.tables.userRoles}.user_id = ?`,
        `ORDER BY ${this.tables.roles}.name;`,
      ].join(' '),
      params: [user.id],
    })) as RoleRecord[];

    const permissions = (await this.db.all({
      sql: [
        `SELECT DISTINCT ${this.tables.permissions}.name`,
        `FROM ${this.tables.permissions}`,
        `INNER JOIN ${this.tables.rolePermissions}`,
        `ON ${this.tables.rolePermissions}.permission_id = ${this.tables.permissions}.id`,
        `INNER JOIN ${this.tables.userRoles}`,
        `ON ${this.tables.userRoles}.role_id = ${this.tables.rolePermissions}.role_id`,
        `WHERE ${this.tables.userRoles}.user_id = ?`,
        `ORDER BY ${this.tables.permissions}.name;`,
      ].join(' '),
      params: [user.id],
    })) as PermissionRecord[];

    return {
      id: user.id,
      roles: roles.map(role => role.name),
      permissions: permissions.map(permission => permission.name),
    };
  }
}
