import type { HttpModule } from '@kurdel/core/http';
import { serveStaticMiddleware } from 'src/middlewares/serve-static-middleware.js';

/**
 * StaticFilesModule
 *
 * HTTP module that provides a global middleware
 * for serving static files from a specified directory.
 *
 * Example:
 * ```ts
 * export const AppModule: HttpModule = {
 *   imports: [StaticFilesModule.forRoot('public')],
 * };
 * ```
 */
export class StaticFilesModule implements HttpModule {
  readonly middlewares;

  constructor(private readonly baseDir: string) {
    this.middlewares = [serveStaticMiddleware(baseDir)];
  }

  static forRoot(baseDir: string): StaticFilesModule {
    return new StaticFilesModule(baseDir);
  }
}
