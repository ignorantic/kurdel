import { createGlobalToken } from '@kurdel/ioc';
import { ServerAdapter } from './interfaces.js';

export const TOKENS = {
  ServerAdapter: createGlobalToken<ServerAdapter>('SERVER_ADAPTER'),
  ControllerClasses: createGlobalToken('CONTROLLER_CLASSES'),
  ControllerConfigs: createGlobalToken('CONTROLLER_CONFIGS'),
};
