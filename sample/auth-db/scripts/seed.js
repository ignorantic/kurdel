import { Sha256ApiKeyHasher } from '@kurdel/auth-db';
import { DBConnector } from '@kurdel/db';

const hasher = new Sha256ApiKeyHasher();
const db = await new DBConnector().run();

try {
  await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
  await db.transaction(async transaction => {
    await transaction.run({
      sql: [
        'INSERT INTO users (id, name, email, status) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
        'ON CONFLICT(id) DO UPDATE SET',
        'name = excluded.name, email = excluded.email, status = excluded.status;',
      ].join(' '),
      params: [
        1,
        'Demo Admin',
        'admin@example.test',
        'active',
        2,
        'Demo User',
        'user@example.test',
        'active',
      ],
    });
    await transaction.run({
      sql: [
        'INSERT INTO roles (id, name) VALUES (?, ?), (?, ?)',
        'ON CONFLICT(id) DO UPDATE SET name = excluded.name;',
      ].join(' '),
      params: [1, 'admin', 2, 'user'],
    });
    await transaction.run({
      sql: 'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?), (?, ?);',
      params: [1, 1, 2, 2],
    });
    await transaction.run({
      sql: [
        'INSERT INTO api_keys',
        '(id, user_id, key_hash, name, status)',
        'VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
        'ON CONFLICT(id) DO UPDATE SET',
        'user_id = excluded.user_id, key_hash = excluded.key_hash,',
        'name = excluded.name, status = excluded.status;',
      ].join(' '),
      params: [
        'admin-demo',
        1,
        hasher.hash('admin-demo-key'),
        'Admin demo key',
        'active',
        'user-demo',
        2,
        hasher.hash('user-demo-key'),
        'User demo key',
        'active',
      ],
    });
  });
  console.log('Seeded auth.db');
  console.log('Admin key: admin-demo-key');
  console.log('User key: user-demo-key');
} finally {
  await db.close();
}
