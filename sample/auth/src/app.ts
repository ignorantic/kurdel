import { createNodeApplication } from '@kurdel/facade';
import {
  ApiKeyStrategy,
  AuthModule,
  InMemoryApiKeyRepository,
  InMemoryAuthUserRepository,
} from '@kurdel/auth';
import { DemoAuthModule } from './demo-auth-module.js';

// Example repository instance
const repo = new InMemoryApiKeyRepository({
  'svc-999': { userId: 1 },
  'dev-123': { userId: 2 },
  'pub-777': { userId: 3 },
  'pub-888': { userId: 4 },
});

const users = new InMemoryAuthUserRepository([
  { id: 1, roles: ['root'] },
  { id: 2, roles: ['admin'] },
  { id: 3, roles: ['user'] },
  { id: 4, roles: ['guest'] },
]);

// Application initialization
const app = await createNodeApplication({
  db: false,
  modules: [
    new AuthModule({
      strategies: [
        {
          name: 'api-key',
          use: new ApiKeyStrategy({
            header: 'x-api-key',
            credentials: repo,
            users,
          }),
        },
      ],
    }),
    new DemoAuthModule(),
  ],
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});
