import { IoCContainer } from '@kurdel/ioc';
import { AppConfig } from '../config.js';
import { Initializer } from './initializer.js';
export declare class DatabaseInitializer implements Initializer {
    run(ioc: IoCContainer, config: AppConfig): Promise<void>;
}
//# sourceMappingURL=database-initializer.d.ts.map