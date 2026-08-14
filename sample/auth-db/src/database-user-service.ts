import type { IDatabase } from '@kurdel/db';

type RoleRecord = {
  id: number;
  name: string;
};

type CreatedUserRecord = {
  id: number;
};

export interface CreateUserInput {
  roles: string[];
}

export interface CreatedUser {
  id: number;
  status: 'active';
  roles: string[];
}

export class UnknownRolesError extends Error {
  constructor(readonly roles: string[]) {
    super(`Unknown roles: ${roles.join(', ')}`);
  }
}

export class DatabaseUserService {
  constructor(private readonly db: IDatabase) {}

  async create(input: CreateUserInput): Promise<CreatedUser> {
    const roles = [...new Set(input.roles)];
    const placeholders = roles.map(() => '?').join(', ');
    const records = await this.db.all({
      sql: `SELECT id, name FROM roles WHERE name IN (${placeholders});`,
      params: roles,
    }) as RoleRecord[];
    const found = new Set(records.map(role => role.name));
    const unknown = roles.filter(role => !found.has(role));
    if (unknown.length > 0) throw new UnknownRolesError(unknown);

    await this.db.run({ sql: 'BEGIN IMMEDIATE;', params: [] });
    try {
      const user = await this.db.get({
        sql: "INSERT INTO users (status) VALUES ('active') RETURNING id;",
        params: [],
      }) as CreatedUserRecord;

      for (const role of records) {
        await this.db.run({
          sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?);',
          params: [user.id, role.id],
        });
      }

      await this.db.run({ sql: 'COMMIT;', params: [] });
      return { id: user.id, status: 'active', roles };
    } catch (error) {
      await this.db.run({ sql: 'ROLLBACK;', params: [] });
      throw error;
    }
  }
}
