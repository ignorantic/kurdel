import { IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from '../http/interfaces.js';
import { NativeHttpServerAdapter } from '../http/native-http-server-adapter.js';
import { Router } from '../router.js';
import { AppConfig } from '../config.js';
import { AppModule } from './app-module.js';

/**
 * ServerModule
 *
 * - Exports: IServerAdapter (bound to configured server)
 * - Imports: Router
 *
 * Binds the HTTP server adapter into IoC.
 * Defaults to NativeHttpServerAdapter if none provided in config.
 * Always uses singleton scope.
 */
export const ServerModule: AppModule = {
  imports: { router: Router },
  exports: { server: IServerAdapter },

  register(ioc: IoCContainer, config: AppConfig) {
    const server = config.server ?? NativeHttpServerAdapter;
    ioc.bind(IServerAdapter).to(server).inSingletonScope().with({ router: Router });
  },
};
