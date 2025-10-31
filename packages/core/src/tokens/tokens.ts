import { HTTP_TOKENS } from 'src/http/http-tokens.js';
import { APP_TOKENS } from 'src/app/app-tokens.js';
import { TemplateEngineToken } from 'src/template/template-tokens.js';

export const TOKENS = {
  ...HTTP_TOKENS,
  ...APP_TOKENS,
  TemplateEngineToken,
};
