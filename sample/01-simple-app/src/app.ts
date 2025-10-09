import { createApplication } from '@kurdel/facade';
import { UserModule } from './user-module.js';

const app = await createApplication({
  modules: [new UserModule()]
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});

