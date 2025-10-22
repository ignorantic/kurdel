import { createGlobalToken } from '@kurdel/ioc';

import type { OnShutdownHook, OnStartHook } from '../app/lifecycle.js';

export const LIFECYCLE_TOKENS = {
  OnStart: createGlobalToken<OnStartHook[]>('@kurdel/core/app:on-start'),
  OnShutdown: createGlobalToken<OnShutdownHook[]>('@kurdel/core/app:on-shutdown'),
};
