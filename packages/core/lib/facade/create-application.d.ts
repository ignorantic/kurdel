import type { AppConfig } from '../api/app/config.js';
import type { Application } from '../api/app/application.js';
/**
 * Runtime façade that constructs and bootstraps the application,
 * returning only the public Application interface.
 */
export declare function createApplication(config?: AppConfig): Promise<Application>;
