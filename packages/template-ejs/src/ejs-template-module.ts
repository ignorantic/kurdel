import { TOKENS } from '@kurdel/core/tokens';
import type { AppModule } from '@kurdel/core/app';

import type { EjsTemplateModuleOptions } from 'src/ejs-engine-options.js';
import { EjsEngine } from 'src/ejs-engine.js';

export class EjsTemplateModule {
  static forRoot(options: EjsTemplateModuleOptions): AppModule {
    return {
      exports: {
        view: TOKENS.TemplateEngineToken,
      },
      
      providers: [
        {
          provide: TOKENS.TemplateEngineToken,
          useFactory: () => new EjsEngine(options.baseDir),
          singleton: true,
        },
      ],
    };
  }
}
