import { createApplication } from '@kurdel/core';
import { UserModule } from './modules/user-module.js';
import { PostModule } from './modules/post-module.js';
import { LoggerModule } from './modules/logger-module.js';

const app = await createApplication({
  db: false,
  modules: [
    new UserModule,
    new PostModule,
    new LoggerModule,
  ]
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});

