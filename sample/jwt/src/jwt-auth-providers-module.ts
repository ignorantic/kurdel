import { ModulePriority, type AppModule, type ProviderConfig } from '@kurdel/core/app';
import {
  AUTH_TOKENS,
  InMemoryAuthUserRepository,
  JwtService,
} from '@kurdel/auth';

/** Demo-only JWT infrastructure supplied by the application. */
export class JwtAuthProvidersModule implements AppModule {
  readonly priority = ModulePriority.User;

  readonly providers: ProviderConfig[] = [
    {
      provide: AUTH_TOKENS.UserRepository,
      useFactory: () => new InMemoryAuthUserRepository([
        { id: '1', roles: ['root'] },
        { id: '2', roles: ['admin'] },
        { id: '3', roles: ['user'] },
        { id: '4', roles: ['guest'] },
      ]),
      singleton: true,
    },
    {
      provide: AUTH_TOKENS.JwtService,
      useFactory: () => new JwtService({
        secret: 'dev-secret',
        issuer: 'kurdel',
        audience: 'sample-jwt',
      }),
      singleton: true,
    },
  ];
}
