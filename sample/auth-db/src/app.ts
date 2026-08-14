import { ApiKeyStrategy, AUTH_TOKENS, AuthModule } from '@kurdel/auth';
import { createNodeApplication } from '@kurdel/facade';

import { AuthDbHttpModule } from './auth-db-http-module.js';
import { DatabaseAuthProvidersModule } from './database-auth-providers-module.js';

const app = await createNodeApplication({
  modules: [
    new DatabaseAuthProvidersModule(),
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

app.listen(3000, () => {
  console.log('Auth DB sample: http://localhost:3000');
  console.log('Admin key: admin-demo-key');
  console.log('User key: user-demo-key');
});
