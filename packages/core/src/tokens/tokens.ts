import { HTTP_TOKENS } from 'src/http/index.js';
import { APP_TOKENS } from 'src/app/index.js';
import { TemplateEngineToken } from 'src/template/index.js';

export const TOKENS = {
  ...HTTP_TOKENS,
  ...APP_TOKENS,
  TemplateEngineToken,
};
