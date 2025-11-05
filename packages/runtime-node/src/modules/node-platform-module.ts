import type { AppModule } from '@kurdel/core/app';
import { TOKENS } from '@kurdel/core/tokens';
import { RuntimeResponseRenderer } from '@kurdel/runtime/http';
import { ModulePriority } from '@kurdel/runtime/app';

import { renderNodeActionResult } from 'src/http/render-node-action-result.js';
import { NativeHttpServerAdapter } from 'src/http/native-http-server-adapter.js';

/**
 * Provides Node.js platform-level services:
 * - native ServerAdapter
 * - platform-aware ResponseRenderer
 */
export const NodePlatformModule: AppModule = {
  priority: ModulePriority.Platform,
  providers: [
    {
      provide: TOKENS.ServerAdapter,
      useFactory: () => new NativeHttpServerAdapter(),
      singleton: true,
    },
    {
      provide: TOKENS.ResponseRenderer,
      useFactory: () => new RuntimeResponseRenderer(renderNodeActionResult),
      singleton: true,
    },
  ],
};
