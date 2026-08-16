import { PostgresDB, type IDatabase } from '@kurdel/db';
import { DatabaseJwtSessionRepository, DatabaseJwtSessionService, DatabaseUserService } from '@kurdel/auth-db';
import { MigrationLock, MigrationLockedError } from '@kurdel/migrations';

import CreateAuthSchema from '../migrations/0001-create-auth-schema.js';
import AddUserProfile from '../migrations/0002-add-user-profile.js';
import CreateAuthEvents from '../migrations/0003-create-auth-events.js';
import CreateRolePermissions from '../migrations/0004-create-role-permissions.js';
import CreateJwtSessions from '../migrations/0005-create-jwt-sessions.js';

const connectionString = process.env.POSTGRES_TEST_URL;
const describePostgres = connectionString ? describe : describe.skip;

describePostgres('PostgreSQL auth database integration', () => {
  let db: IDatabase;

  beforeAll(async () => {
    const postgres = new PostgresDB({ connectionString });
    await postgres.connect();
    db = postgres;
    await new CreateAuthSchema(db).up();
    await new AddUserProfile(db).up();
    await new CreateAuthEvents(db).up();
    await new CreateRolePermissions(db).up();
    await new CreateJwtSessions(db).up();
    await db.run({
      sql: 'INSERT INTO roles (name) VALUES (?), (?);',
      params: ['admin', 'user'],
    });
  });

  afterAll(async () => {
    if (!db) return;
    await new CreateJwtSessions(db).down();
    await new CreateRolePermissions(db).down();
    await new CreateAuthEvents(db).down();
    await new AddUserProfile(db).down();
    await new CreateAuthSchema(db).down();
    await db.run({ sql: 'DROP TABLE IF EXISTS migration_locks;', params: [] });
    await db.close();
  });

  it('runs user and revocable session workflows on PostgreSQL', async () => {
    const users = new DatabaseUserService(db);
    const user = await users.create({
      name: 'Postgres User',
      email: 'postgres@example.test',
      roles: ['user'],
    });
    await expect(users.findById(user.id)).resolves.toEqual(user);

    const sessions = new DatabaseJwtSessionService(db);
    const created = await sessions.create(user.id, new Date(Date.now() + 60_000));
    const repository = new DatabaseJwtSessionRepository(db);
    await expect(repository.findById(created.id)).resolves.toEqual({
      id: created.id,
      userId: user.id,
      revoked: false,
      expiresAt: new Date(created.expiresAt),
    });
    await sessions.revoke(user.id, created.id);
    await expect(repository.findById(created.id)).resolves.toEqual(expect.objectContaining({
      revoked: true,
    }));
  });

  it('serializes competing PostgreSQL migration operations', async () => {
    const first = new MigrationLock(db);
    const second = new MigrationLock(db);
    await first.initialize();

    await first.acquire();
    await expect(second.acquire()).rejects.toBeInstanceOf(MigrationLockedError);
    await first.release();
    await expect(second.acquire()).resolves.toBeUndefined();
    await second.release();
  });
});
