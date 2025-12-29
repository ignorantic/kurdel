import { createNodeApplication } from '@kurdel/facade';
import {
  AuthModule,
  InMemoryJwtRepository,
  JwtService,
  JwtStrategy,
} from '@kurdel/auth';
import { JwtAuthModule } from './jwt-auth-module.js';

// Example repository instance
const repo = new InMemoryJwtRepository([
  { id: '1', roles: ['root'] },
  { id: '2', roles: ['admin'] },
  { id: '3', roles: ['user'] },
  { id: '4', roles: ['guest'] },
]);

const jwt = new JwtService({
  secret: 'dev-secret',
  issuer: 'kurdel',
  audience: 'sample-jwt',
  expiresIn: undefined, // verification only
});

// Application initialization
const app = await createNodeApplication({
  db: false,
  modules: [
    new AuthModule({  
      strategies: [
        {
          name: 'jwt',
          use: new JwtStrategy(jwt, repo),
        },
      ],
    }),
    new JwtAuthModule(),
  ],
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});
