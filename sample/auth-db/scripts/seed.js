import { Sha256ApiKeyHasher } from '@kurdel/auth-db';
import { DBConnector } from '@kurdel/db';

const hasher = new Sha256ApiKeyHasher();
const db = await new DBConnector().run();

try {
  if (db.dialect === 'sqlite') {
    await db.run({ sql: 'PRAGMA foreign_keys = ON;', params: [] });
  }
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
      sql: [
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?), (?, ?)',
        'ON CONFLICT(user_id, role_id) DO NOTHING;',
      ].join(' '),
      params: [1, 1, 2, 2],
    });
    const permissionNames = [
      'users.view.self',
      'users.view.any',
      'users.manage',
      'roles.manage',
      'audit.view',
    ];
    for (const name of permissionNames) {
      await transaction.run({
        sql: 'INSERT INTO permissions (name) VALUES (?) ON CONFLICT(name) DO NOTHING;',
        params: [name],
      });
    }
    await transaction.run({
      sql: [
        'INSERT INTO role_permissions (role_id, permission_id)',
        "SELECT 1, id FROM permissions WHERE name IN ('users.view.self', 'users.view.any', 'users.manage', 'roles.manage', 'audit.view')",
        'ON CONFLICT(role_id, permission_id) DO NOTHING;',
      ].join(' '),
      params: [],
    });
    await transaction.run({
      sql: [
        'INSERT INTO role_permissions (role_id, permission_id)',
        "SELECT 2, id FROM permissions WHERE name = 'users.view.self'",
        'ON CONFLICT(role_id, permission_id) DO NOTHING;',
      ].join(' '),
      params: [],
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
    if (db.dialect === 'postgres') {
      await transaction.run({
        sql: "SELECT setval(pg_get_serial_sequence('users', 'id'), MAX(id)) FROM users;",
        params: [],
      });
      await transaction.run({
        sql: "SELECT setval(pg_get_serial_sequence('roles', 'id'), MAX(id)) FROM roles;",
        params: [],
      });
    }
  });
  console.log(`Seeded auth database (${db.dialect})`);
  console.log('Admin key: admin-demo-key');
  console.log('User key: user-demo-key');
} finally {
  await db.close();
}
