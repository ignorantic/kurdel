import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from './config.js';
/**
 * Main application orchestrator.
 * Delegates setup work to initializers.
 */
export declare class Application {
    private readonly config;
    private ioc;
    constructor(config: AppConfig);
    static create(config?: AppConfig): Promise<Application>;
    private init;
    listen(port: number, callback: () => void): void;
    getContainer(): IoCContainer;
}
//# sourceMappingURL=application.d.ts.map