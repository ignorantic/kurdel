import type { AppModule } from '@kurdel/core/app';
import { RuntimeResponseRenderer } from '@kurdel/runtime/http';
import { TOKENS } from '@kurdel/core/tokens';

import { renderNodeActionResult } from 'src/http/render-node-action-result.js';

export const NodeHttpRuntimeModule: AppModule = {
  providers: [
    {
      provide: TOKENS.ResponseRenderer,
      useFactory: () => new RuntimeResponseRenderer(renderNodeActionResult),
      singleton: true,
    },
  ],
};
