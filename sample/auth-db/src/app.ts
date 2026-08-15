import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ApiKeyStrategy, AUTH_TOKENS, AuthModule } from '@kurdel/auth';
import { AUTH_DB_TOKENS, AuthDatabaseModule } from '@kurdel/auth-db';
import { createNodeApplication } from '@kurdel/facade';
import { StaticFilesModule } from '@kurdel/runtime-node/modules';
import { ReactTemplateModule } from '@kurdel/template-react';

import { AuthDbHttpModule } from './auth-db-http-module.js';
import { manageUsersPolicy, viewUserPolicy } from './authorization-policies.js';

const currentDir = dirname(fileURLToPath(import.meta.url));

const app = await createNodeApplication({
  modules: [
    ReactTemplateModule.forRoot({ baseDir: resolve(currentDir, './admin/views') }),
    new StaticFilesModule(resolve(currentDir, './public')),
    new AuthDatabaseModule({ audit: true }),
    new AuthModule({
      events: {
        useFactory: ioc => ioc.get(AUTH_DB_TOKENS.EventStore),
      },
      strategies: [
        {
          name: 'api-key',
          useFactory: ioc =>
            new ApiKeyStrategy({
              header: 'x-api-key',
              credentials: ioc.get(AUTH_TOKENS.ApiKeyRepository),
              users: ioc.get(AUTH_TOKENS.UserRepository),
              usage: ioc.get(AUTH_TOKENS.ApiKeyUsageRecorder),
            }),
        },
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

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Auth DB sample: http://localhost:${port}`);
  console.log('Admin key: admin-demo-key');
  console.log('User key: user-demo-key');
});
