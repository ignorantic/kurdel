import { createToken } from '@kurdel/ioc';
import type { TemplateEngine } from './template-engine.ts';

export const TemplateEngineToken = createToken<TemplateEngine>('@kurdel/core/template/engine');
