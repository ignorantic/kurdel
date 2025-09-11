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
export declare const ServerModule: AppModule;
//# sourceMappingURL=server-module.d.ts.map