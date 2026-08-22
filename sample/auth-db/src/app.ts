import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { apiKeyStrategy, AuthModule, jwtStrategy } from '@kurdel/auth';
import { AuthDatabaseModule, databaseAuthEventSink } from '@kurdel/auth-db';
import { createNodeApplication } from '@kurdel/facade';
import { StaticFilesModule } from '@kurdel/runtime-node/modules';
import { ReactTemplateModule } from '@kurdel/template-react';

import { AuthDbHttpModule } from './auth-db-http-module.js';
import { manageUsersPolicy, viewUserPolicy } from './authorization-policies.js';
import { environment } from './environment.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

const app = await createNodeApplication({
  modules: [
    ReactTemplateModule.forRoot({ baseDir: resolve(currentDir, './admin/views') }),
    new StaticFilesModule(resolve(currentDir, './public')),
    new AuthDatabaseModule({ audit: true }),
    new AuthModule({
      events: databaseAuthEventSink(),
      strategies: [
        apiKeyStrategy({ usage: true }),
        jwtStrategy({ sessions: true }),
      ],
      policies: [
        {
          name: 'manage-users',
          use: manageUsersPolicy,
        },
        {
          name: 'view-user',
          use: viewUserPolicy,
        },
      ],
    }),
    new AuthDbHttpModule(),
  ],
});

app.listen(environment.PORT, () => {
  console.log(`Auth DB sample: http://localhost:${environment.PORT}`);
  console.log('Admin login: admin@example.test / admin-demo-password');
  console.log('User login: user@example.test / user-demo-password');
});
