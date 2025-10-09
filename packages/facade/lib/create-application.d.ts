import type { AppConfig, Application } from '@kurdel/core/app';
/**
 * Runtime façade that constructs and bootstraps the application,
 * returning only the public Application interface.
 */
export declare function createApplication(config?: AppConfig): Promise<Application>;
