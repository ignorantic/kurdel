import { ApiKeyStrategy, AUTH_TOKENS, AuthModule } from '@kurdel/auth';
import { AuthDatabaseModule } from '@kurdel/auth-db';
import { createNodeApplication } from '@kurdel/facade';

import { AuthDbManagementModule } from './auth-db-management-module.js';
import { AuthDbHttpModule } from './auth-db-http-module.js';

const app = await createNodeApplication({
  modules: [
    new AuthDatabaseModule(),
    new AuthDbManagementModule(),
    new AuthModule({
      strategies: [
        {
          name: 'api-key',
          useFactory: ioc => new ApiKeyStrategy({
            header: 'x-api-key',
            credentials: ioc.get(AUTH_TOKENS.ApiKeyRepository),
            users: ioc.get(AUTH_TOKENS.UserRepository),
          }),
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
