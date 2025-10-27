import { createNodeApplication } from '@kurdel/facade';
import { EjsTemplateModule } from '@kurdel/template-ejs';

import { HomeModule } from './home-module.js';
import { UserModule } from './user-module.js';

const app = await createNodeApplication({
  db: false,
  modules: [
    new HomeModule(),
    new UserModule(),
    EjsTemplateModule.forRoot({
      baseDir: process.cwd() + '/views',
    }),
  ],
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000\n`);
});
