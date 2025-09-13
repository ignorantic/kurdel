import { AppModule, ProviderConfig } from './app-module.js';
import { IoCContainer } from '@kurdel/ioc';
import { IServerAdapter } from '../http/interfaces.js';
import { NativeHttpServerAdapter } from '../http/native-http-server-adapter.js';
import { Router } from '../router.js';
import { AppConfig } from '../config.js';

/**
 * ServerModule
 *
 * - Registers HTTP server adapter
 * - Depends on Router
 * - Exports IServerAdapter
 */
export class ServerModule implements AppModule<AppConfig> {
  readonly imports = { router: Router };
  readonly exports = { server: IServerAdapter };

  readonly providers: ProviderConfig[];

  constructor(config: AppConfig) {
    const { server = NativeHttpServerAdapter } = config;

    this.providers = [
      {
        provide: IServerAdapter,
        useClass: server,
        deps: { router: Router },
        isSingleton: true,
      },
    ];
  }

  async register(_ioc: IoCContainer): Promise<void> {
    // No-op (everything in providers)
  }
}
