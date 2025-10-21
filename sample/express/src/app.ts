import { createExpressApplication } from '@kurdel/facade';

import { UserModule } from './user-module.js';

const app = await createExpressApplication({
  db: false,
  modules: [new UserModule],
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});

