import type { AuthUser } from '@kurdel/common';
import type { IDatabase } from '@kurdel/db';
import type { AuthUserRepository } from '@kurdel/auth';

type UserRecord = {
  id: string | number;
  status: string;
};

type RoleRecord = {
  name: string;
};

export class DatabaseAuthUserRepository implements AuthUserRepository {
  constructor(private readonly db: IDatabase) {}

  async findById(id: string | number): Promise<AuthUser | null> {
    const user = await this.db.get({
      sql: 'SELECT id, status FROM users WHERE id = ?;',
      params: [id],
    }) as UserRecord | undefined;

    if (!user || user.status !== 'active') return null;

    const roles = await this.db.all({
      sql: [
        'SELECT roles.name',
        'FROM roles',
        'INNER JOIN user_roles ON user_roles.role_id = roles.id',
        'WHERE user_roles.user_id = ?',
        'ORDER BY roles.name;',
      ].join(' '),
      params: [user.id],
    }) as RoleRecord[];

    return {
      id: user.id,
      roles: roles.map(role => role.name),
    };
  }
}
