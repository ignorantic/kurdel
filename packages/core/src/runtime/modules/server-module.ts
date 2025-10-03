import { IoCContainer } from '@kurdel/ioc';
import { AppModule, ProviderConfig } from 'src/api/app-module.js';
import { NativeHttpServerAdapter } from 'src/adapters/native-http-server-adapter.js';
import { Router } from 'src/runtime/router.js';
import { AppConfig } from 'src/api/config.js';
import { TOKENS } from 'src/api/tokens.js';

/**
 * ServerModule
 *
 * - Registers HTTP server adapter
 * - Depends on Router
 * - Exports IServerAdapter
 */
export class ServerModule implements AppModule<AppConfig> {
  readonly imports = { router: Router };
  readonly exports = { server: TOKENS.ServerAdapter };

  readonly providers: ProviderConfig[];

  constructor(config: AppConfig) {
    const { server = NativeHttpServerAdapter } = config;

    this.providers = [
      {
        provide: TOKENS.ServerAdapter,
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
