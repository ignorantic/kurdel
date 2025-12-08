import { createNodeApplication } from '@kurdel/facade';
import { ApiKeyStrategy, AuthModule } from '@kurdel/auth';
import { DemoAuthModule } from './demo-auth-module.js';

const app = await createNodeApplication({
  db: false,
  modules: [
    new AuthModule({
      strategies: [{
        name: 'api-key',
        use: new ApiKeyStrategy({
          header: 'x-api-key',
          keys: {
            'svc-999': { id: 1, roles: ['root'] },
            'dev-123': { id: 2, roles: ['admin'] },
            'pub-777': { id: 3, roles: ['user'] },
            'pub-888': { id: 4, roles: ['guest'] },
          },
        }),
      }],
    }),
    new DemoAuthModule(),
  ]
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});

