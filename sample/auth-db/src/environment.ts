import { env, loadEnv } from '@kurdel/common';

export const environment = loadEnv({
  NODE_ENV: env.enum(['development', 'test', 'production'], {
    default: 'development',
  }),
  PORT: env.number({
    default: 3000,
    integer: true,
    min: 1,
    max: 65_535,
  }),
});
