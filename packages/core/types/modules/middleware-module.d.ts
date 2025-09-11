import { AppModule } from './app-module.js';
/**
 * MiddlewareModule
 *
 * - Exports: MiddlewareRegistry
 * - Imports: none
 *
 * Registers global middleware pipeline:
 * - creates MiddlewareRegistry
 * - attaches user-provided middlewares
 * - always attaches built-in errorHandler as last middleware
 */
export declare const MiddlewareModule: AppModule;
//# sourceMappingURL=middleware-module.d.ts.map