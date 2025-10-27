import { TOKENS } from '@kurdel/core/tokens';
import type { AppModule } from '@kurdel/core/app';

import type { ReactTemplateOptions } from './react-template-options.js';
import { ReactTemplateEngine } from './react-template-engine.js';

export class ReactTemplateModule {
  static forRoot(options: ReactTemplateOptions): AppModule {
    return {
      exports: {
        view: TOKENS.TemplateEngineToken,
      },
      providers: [
        {
          provide: TOKENS.TemplateEngineToken,
          useFactory: () => new ReactTemplateEngine(options.baseDir),
          singleton: true,
        },
      ],
    };
  }
}
