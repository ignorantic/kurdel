import { createNodeApplication } from '@kurdel/facade';
import { AUTH_TOKENS, AuthModule, JwtStrategy } from '@kurdel/auth';

import { JwtAuthModule } from './jwt-auth-module.js';

const app = await createNodeApplication({
  db: false,
  modules: [
    new AuthModule({  
      strategies: [
        {
          name: 'jwt',
          useFactory: (c) =>
            new JwtStrategy(
              c.get(AUTH_TOKENS.JwtService),
              c.get(AUTH_TOKENS.UserRepository),
            ),
        },
      ],
    }),
    new JwtAuthModule(),
  ],
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});
