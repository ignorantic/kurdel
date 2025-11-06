import { createToken } from '@kurdel/ioc';

import type { TemplateEngine } from 'src/template/index.js';

export const TemplateEngineToken = createToken<TemplateEngine>('@kurdel/core/template/engine');
