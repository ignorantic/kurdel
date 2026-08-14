import crypto from 'node:crypto';

import { DBConnector } from '@kurdel/db';

const hash = key => crypto.createHash('sha256').update(key).digest('hex');
const db = await new DBConnector().run();

try {
  await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
  await db.run({ sql: 'BEGIN;', params: [] });

  await db.run({ sql: 'DELETE FROM api_keys;', params: [] });
  await db.run({ sql: 'DELETE FROM user_roles;', params: [] });
  await db.run({ sql: 'DELETE FROM roles;', params: [] });
  await db.run({ sql: 'DELETE FROM users;', params: [] });

  await db.run({
    sql: "INSERT INTO users (id, status) VALUES (?, ?), (?, ?);",
    params: [1, 'active', 2, 'active'],
  });
  await db.run({
    sql: 'INSERT INTO roles (id, name) VALUES (?, ?), (?, ?);',
    params: [1, 'admin', 2, 'user'],
  });
  await db.run({
    sql: 'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?), (?, ?);',
    params: [1, 1, 2, 2],
  });
  await db.run({
    sql: [
      'INSERT INTO api_keys',
      '(id, user_id, key_hash, name, status)',
      'VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?);',
    ].join(' '),
    params: [
      'admin-demo', 1, hash('admin-demo-key'), 'Admin demo key', 'active',
      'user-demo', 2, hash('user-demo-key'), 'User demo key', 'active',
    ],
  });

  await db.run({ sql: 'COMMIT;', params: [] });
  console.log('Seeded auth.db');
  console.log('Admin key: admin-demo-key');
  console.log('User key: user-demo-key');
} catch (error) {
  await db.run({ sql: 'ROLLBACK;', params: [] });
  throw error;
} finally {
  await db.close();
}
