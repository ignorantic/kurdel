import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createNodeApplication } from '@kurdel/facade';
import { ReactTemplateModule } from '@kurdel/template-react';

import { HelloModule } from './hello-module.js';
import { StaticFilesModule } from '@kurdel/runtime-node/modules';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = await createNodeApplication({
  db: false,
  modules: [
    ReactTemplateModule.forRoot({
      baseDir: resolve(__dirname, './views'),
    }),
    new StaticFilesModule(resolve(__dirname, './public')),
    new HelloModule(),
  ],
});

app.listen(3000, () =>
  console.log('🚀 React (TSX) template demo: http://localhost:3000'),
);
