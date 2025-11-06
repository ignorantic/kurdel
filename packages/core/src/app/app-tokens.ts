import { createGlobalToken } from '@kurdel/ioc';

import type { OnShutdownHook, OnStartHook } from 'src/app/index.js';

export const APP_TOKENS = {
  OnStart: createGlobalToken<OnStartHook[]>('@kurdel/core/app:on-start'),
  OnShutdown: createGlobalToken<OnShutdownHook[]>('@kurdel/core/app:on-shutdown'),
};
