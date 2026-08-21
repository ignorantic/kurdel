import { createNodeApplication } from '@kurdel/facade';
import { AuthModule, jwtStrategy } from '@kurdel/auth';

import { JwtAuthModule } from './jwt-auth-module.js';
import { JwtAuthProvidersModule } from './jwt-auth-providers-module.js';

const app = await createNodeApplication({
  db: false,
  modules: [
    new JwtAuthProvidersModule(),
    new AuthModule({
      strategies: [jwtStrategy()],
    }),
    new JwtAuthModule(),
  ],
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});
