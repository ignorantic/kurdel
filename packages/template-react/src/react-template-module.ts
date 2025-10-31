import { TOKENS } from '@kurdel/core/tokens';
import type { AppModule } from '@kurdel/core/app';
import type { ProviderConfig } from '@kurdel/core/app';
import type { ReactTemplateOptions } from './react-template-options.js';
import { ReactTemplateEngine } from './react-template-engine.js';

/**
 * ReactTemplateModule
 *
 * Application module that provides server-side React rendering
 * via the {@link ReactTemplateEngine}.
 *
 * Responsibilities:
 * - Registers `ReactTemplateEngine` as the default template engine
 * - Exposes it through the `TemplateEngineToken`
 *
 * @example:
 * ```ts
 * const app = await createNodeApplication({
 *   modules: [
 *     ReactTemplateModule.forRoot({
 *       baseDir: resolve(__dirname, './views'),
 *     }),
 *   ],
 * });
 * ```
 */
export class ReactTemplateModule {
  /**
   * Configures the module for root application context.
   *
   * @param options - Configuration options for the React template engine
   * @returns AppModule definition that can be passed into `createApplication()`
   */
  static forRoot(options: ReactTemplateOptions): AppModule {
    const providers: ProviderConfig[] = [
      {
        provide: TOKENS.TemplateEngineToken,
        useFactory: (): ReactTemplateEngine => new ReactTemplateEngine(options.baseDir),
        singleton: true,
      },
    ];

    return {
      exports: {
        view: TOKENS.TemplateEngineToken,
      },
      providers,
    };
  }
}
