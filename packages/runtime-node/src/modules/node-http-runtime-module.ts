import type { AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';
import { RuntimeResponseRenderer } from '@kurdel/runtime/http';
import { ModulePriority } from '@kurdel/runtime/app';

import { renderNodeActionResult } from 'src/http/render-node-action-result.js';

export const NodeHttpRuntimeModule: AppModule = {
  priority: ModulePriority.Platform,
  providers: [
    {
      provide: TOKENS.ResponseRenderer,
      useFactory: () => new RuntimeResponseRenderer(renderNodeActionResult),
      singleton: true,
    },
  ],
};
